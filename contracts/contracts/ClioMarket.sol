// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

import "./ClioRegistry.sol";
import "./ClioArtistToken.sol";

/// @title ClioMarket
/// @notice USDC-only bonding curve market for artist tokens (18 decimals) with linear pricing.
contract ClioMarket is ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct CurveParams {
        uint256 basePriceWad;   // base price (USDC, 18 decimals)
        uint256 slopeWad;       // price increase per token (USDC, 18 decimals)
        uint16 artistFeeBps;    // fee on each trade paid to artist wallet
        bool initialized;
    }

    ClioRegistry public registry;
    IERC20 public immutable usdc; // 6 decimals on Base Sepolia
    address public owner;
    address public curveAdmin; // optional delegate that can init curves

    // artistId => curve state
    mapping(uint256 => CurveParams) public curves;
    mapping(uint256 => uint256) public reserves; // USDC (6 decimals) locked per artist

    // constants
    uint256 private constant WAD = 1e18;
    uint256 private constant USDC_SCALE = 1e12; // convert wad <-> 6d USDC

    event CurveInitialized(uint256 indexed artistId, uint256 basePriceWad, uint256 slopeWad, uint16 feeBps);
    event Bought(uint256 indexed artistId, address indexed buyer, uint256 tokensOut, uint256 usdcIn, uint256 fee, uint256 newPriceWad, uint256 newSupply);
    event Sold(uint256 indexed artistId, address indexed seller, uint256 tokensIn, uint256 usdcOut, uint256 fee, uint256 newPriceWad, uint256 newSupply);
    event OwnerSet(address indexed newOwner);
    event CurveAdminSet(address indexed newAdmin);

    modifier onlyOwner() {
        require(msg.sender == owner, "ClioMarket: not owner");
        _;
    }

    modifier onlyCurveAdmin() {
        require(
            msg.sender == owner || msg.sender == curveAdmin,
            "ClioMarket: not curve admin"
        );
        _;
    }

    constructor(address _registry, address _usdc) {
        require(_registry != address(0), "ClioMarket: zero registry");
        require(_usdc != address(0), "ClioMarket: zero usdc");
        owner = msg.sender;
        registry = ClioRegistry(_registry);
        usdc = IERC20(_usdc);
        emit OwnerSet(msg.sender);
    }

    function setOwner(address _owner) external onlyOwner {
        require(_owner != address(0), "ClioMarket: zero owner");
        owner = _owner;
        emit OwnerSet(_owner);
    }

    function setCurveAdmin(address _admin) external onlyOwner {
        require(_admin != address(0), "ClioMarket: zero admin");
        curveAdmin = _admin;
        emit CurveAdminSet(_admin);
    }

    // ----- INTERNAL HELPERS -----

    function _artist(uint256 artistId)
        internal
        view
        returns (address artistWallet, address tokenAddr, bool active)
    {
        (artistWallet, tokenAddr, , , active) = registry.artists(artistId);
        require(tokenAddr != address(0), "ClioMarket: no token");
        require(artistWallet != address(0), "ClioMarket: no wallet");
        require(active, "ClioMarket: inactive");
    }

    function _supply(address tokenAddr) internal view returns (uint256) {
        return ClioArtistToken(tokenAddr).totalSupply();
    }

    function _priceAt(uint256 supply, CurveParams memory cp) internal pure returns (uint256) {
        // price = basePrice + slope * supply / WAD
        return cp.basePriceWad + Math.mulDiv(cp.slopeWad, supply, WAD);
    }

    // cost = base*delta/WAD + slope * (( (S+delta)^2 - S^2) ) / (2*WAD*WAD)
    function _costToMint(uint256 supply, uint256 delta, CurveParams memory cp) internal pure returns (uint256) {
        uint256 term1 = Math.mulDiv(cp.basePriceWad, delta, WAD);
        uint256 newSupply = supply + delta;
        uint256 squaredDiff = newSupply * newSupply - supply * supply;
        uint256 term2 = Math.mulDiv(cp.slopeWad, squaredDiff, 2 * WAD * WAD);
        return term1 + term2;
    }

    // revenue = base*delta/WAD + slope * (S^2 - (S-delta)^2) / (2*WAD*WAD)
    function _revenueFromBurn(uint256 supply, uint256 delta, CurveParams memory cp) internal pure returns (uint256) {
        uint256 term1 = Math.mulDiv(cp.basePriceWad, delta, WAD);
        uint256 newSupply = supply - delta;
        uint256 squaredDiff = supply * supply - newSupply * newSupply;
        uint256 term2 = Math.mulDiv(cp.slopeWad, squaredDiff, 2 * WAD * WAD);
        return term1 + term2;
    }

    function _wadToUsdcUp(uint256 wadAmount) internal pure returns (uint256) {
        return (wadAmount + USDC_SCALE - 1) / USDC_SCALE; // ceil
    }

    function _wadToUsdcDown(uint256 wadAmount) internal pure returns (uint256) {
        return wadAmount / USDC_SCALE; // floor
    }

    // ----- ADMIN: INIT CURVE -----

    function initCurve(
        uint256 artistId,
        uint256 basePriceWad,
        uint256 slopeWad,
        uint16 artistFeeBps
    ) external onlyCurveAdmin {
        CurveParams storage cp = curves[artistId];
        require(!cp.initialized, "ClioMarket: already init");
        require(basePriceWad > 0, "ClioMarket: zero base");
        require(artistFeeBps <= 5_000, "ClioMarket: fee too high"); // max 50% for sanity

        cp.basePriceWad = basePriceWad;
        cp.slopeWad = slopeWad;
        cp.artistFeeBps = artistFeeBps;
        cp.initialized = true;

        emit CurveInitialized(artistId, basePriceWad, slopeWad, artistFeeBps);
    }

    // ----- PUBLIC VIEWS -----

    function quoteBuy(uint256 artistId, uint256 tokensOut)
        public
        view
        returns (uint256 usdcIn, uint256 fee, uint256 newPriceWad)
    {
        require(tokensOut > 0, "ClioMarket: zero buy");
        CurveParams memory cp = curves[artistId];
        require(cp.initialized, "ClioMarket: curve not init");

        ( , address tokenAddr, ) = _artist(artistId);
        uint256 supply = _supply(tokenAddr);

        uint256 costWad = _costToMint(supply, tokensOut, cp);
        uint256 costUsdc = _wadToUsdcUp(costWad);
        fee = (costUsdc * cp.artistFeeBps) / 10_000;
        usdcIn = costUsdc + fee;

        uint256 newSupply = supply + tokensOut;
        newPriceWad = _priceAt(newSupply, cp);
    }

    function quoteSell(uint256 artistId, uint256 tokensIn)
        public
        view
        returns (uint256 usdcOut, uint256 fee, uint256 newPriceWad)
    {
        require(tokensIn > 0, "ClioMarket: zero sell");
        CurveParams memory cp = curves[artistId];
        require(cp.initialized, "ClioMarket: curve not init");

        ( , address tokenAddr, ) = _artist(artistId);
        uint256 supply = _supply(tokenAddr);
        require(tokensIn <= supply, "ClioMarket: > supply");

        uint256 revenueWad = _revenueFromBurn(supply, tokensIn, cp);
        uint256 grossUsdc = _wadToUsdcDown(revenueWad);
        fee = (grossUsdc * cp.artistFeeBps) / 10_000;
        usdcOut = grossUsdc - fee;

        uint256 newSupply = supply - tokensIn;
        newPriceWad = _priceAt(newSupply, cp);
    }

    function currentPrice(uint256 artistId) external view returns (uint256) {
        CurveParams memory cp = curves[artistId];
        require(cp.initialized, "ClioMarket: curve not init");
        ( , address tokenAddr, ) = _artist(artistId);
        uint256 supply = _supply(tokenAddr);
        return _priceAt(supply, cp);
    }

    // ----- USER: BUY -----

    function buy(
        uint256 artistId,
        uint256 tokenAmount,
        uint256 maxUsdcIn
    ) external nonReentrant {
        (uint256 usdcIn, uint256 fee, uint256 newPriceWad) = quoteBuy(artistId, tokenAmount);
        require(usdcIn <= maxUsdcIn, "ClioMarket: slippage");

        (address artistWallet, address tokenAddr, ) = _artist(artistId);
        ClioArtistToken token = ClioArtistToken(tokenAddr);

        // Pull USDC
        usdc.safeTransferFrom(msg.sender, address(this), usdcIn);

        // Pay fee
        if (fee > 0) {
            usdc.safeTransfer(artistWallet, fee);
        }

        // Liquidity stays in reserve
        reserves[artistId] += (usdcIn - fee);

        // Mint tokens
        token.mint(msg.sender, tokenAmount);

        emit Bought(artistId, msg.sender, tokenAmount, usdcIn, fee, newPriceWad, token.totalSupply());
    }

    // ----- USER: SELL -----

    function sell(
        uint256 artistId,
        uint256 tokenAmount,
        uint256 minUsdcOut
    ) external nonReentrant {
        (uint256 usdcOut, uint256 fee, uint256 newPriceWad) = quoteSell(artistId, tokenAmount);
        require(usdcOut >= minUsdcOut, "ClioMarket: slippage");

        (address artistWallet, address tokenAddr, ) = _artist(artistId);
        ClioArtistToken token = ClioArtistToken(tokenAddr);

        uint256 totalDebit = usdcOut + fee;
        require(reserves[artistId] >= totalDebit, "ClioMarket: reserve low");

        // Burn first
        token.burn(msg.sender, tokenAmount);

        // Update reserve before transfers
        reserves[artistId] -= totalDebit;

        // Pay fee then user
        if (fee > 0) {
            usdc.safeTransfer(artistWallet, fee);
        }
        usdc.safeTransfer(msg.sender, usdcOut);

        emit Sold(artistId, msg.sender, tokenAmount, usdcOut, fee, newPriceWad, token.totalSupply());
    }
}
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ClioRegistry.sol";
import "./ClioArtistToken.sol";

interface IClioMarket {
    function initCurve(
        uint256 artistId,
        uint256 basePriceWad,
        uint256 slopeWad,
        uint16 artistFeeBps
    ) external;
}

contract ClioFactory {
    ClioRegistry public registry;
    address public owner;
    address public market;

    event ArtistCreated(uint256 indexed artistId, address artistWallet, address token);

    modifier onlyOwner() {
        require(msg.sender == owner, "ClioFactory: not owner");
        _;
    }

    constructor(address _registry) {
        owner = msg.sender;
        registry = ClioRegistry(_registry);
    }

    function setOwner(address _owner) external onlyOwner {
        require(_owner != address(0), "ClioFactory: zero owner");
        owner = _owner;
    }

    function setMarket(address _market) external onlyOwner {
        require(_market != address(0), "ClioFactory: zero market");
        market = _market;
    }

    /// @notice Create artist + token and initialize curve in one call.
    function createArtistWithCurve(
        address artistWallet,
        string memory name,
        string memory handle,
        string memory symbol,
        uint256 basePriceWad,
        uint256 slopeWad,
        uint16 artistFeeBps
    ) external onlyOwner returns (uint256 artistId, address token) {
        (artistId, token) = _createArtist(artistWallet, name, handle, symbol);

        // initialize curve for this artist (factory must be curveAdmin or owner on market)
        IClioMarket(market).initCurve(artistId, basePriceWad, slopeWad, artistFeeBps);
    }

    function createArtist(
        address artistWallet,
        string memory name,
        string memory handle,
        string memory symbol
    ) external onlyOwner returns (uint256 artistId, address token) {
        return _createArtist(artistWallet, name, handle, symbol);
    }

    function _createArtist(
        address artistWallet,
        string memory name,
        string memory handle,
        string memory symbol
    ) internal returns (uint256 artistId, address token) {
        // 1) Register artist in registry
        artistId = registry.registerArtist(artistWallet, name, handle);

        // 2) Deploy artist token
        ClioArtistToken t = new ClioArtistToken(
            name,
            symbol,
            address(this)   // factory owns the token to set market
        );

        // 3) Set market on token
        t.setMarket(market);

        token = address(t);

        // 4) Link token to artistId in registry
        registry.setArtistToken(artistId, token);

        emit ArtistCreated(artistId, artistWallet, token);
    }
}

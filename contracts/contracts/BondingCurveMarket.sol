// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./ArtistRegistry.sol";
import "./ArtistToken.sol";

/// @title BondingCurveMarket
/// @notice Handles buy/sell logic for artist tokens using a bonding curve.
/// @dev Currently uses a simple 1:1 pricing (1 wei = 1 token) as a placeholder.
///      Bonding curve math will be plugged into getBuyPrice/getSellReturn later.
contract BondingCurveMarket {
    /// @notice Registry that keeps track of artists and their tokens.
    ArtistRegistry public registry;

    /// @notice ETH reserve held for each artist's bonding curve.
    /// @dev Keyed by artistId (1..artistCount).
    mapping(uint256 => uint256) public reserveBalance;

    /// @notice Fee in basis points (1/100 of a percent) taken on buys for the artist.
    /// @dev 300 = 3% (300 / 10_000).
    uint256 public constant ARTIST_FEE_BPS = 300;

    /// @notice Emitted when the market is initialized with a registry.
    event RegistrySet(address indexed registry);

    /// @notice Emitted when ETH reserve for an artist changes.
    event ReserveUpdated(uint256 indexed artistId, uint256 newReserve);

    /// @notice Emitted when someone buys an artist's token.
    event Bought(
        uint256 indexed artistId,
        address indexed buyer,
        uint256 ethIn,       // total ETH sent by buyer
        uint256 tokensOut
    );

    /// @notice Emitted when someone sells an artist's token.
    event Sold(
        uint256 indexed artistId,
        address indexed seller,
        uint256 tokensIn,
        uint256 ethOut
    );

    /// @notice Deploy the bonding curve market with a given artist registry.
    /// @param registry_ Address of the ArtistRegistry contract.
    constructor(address registry_) {
        require(registry_ != address(0), "Invalid registry address");
        registry = ArtistRegistry(registry_);
        emit RegistrySet(registry_);
    }

    // ------------------------------------------------------------------------
    // Bonding curve pricing skeleton (linear curve – TODO implement math)
    // ------------------------------------------------------------------------

    function getBuyPrice(
        uint256 artistId,
        uint256 tokensToBuy
    ) internal view returns (uint256 ethRequired) {
        artistId;
        tokensToBuy;
        // TODO: implement proper bonding curve math
        return 0;
    }

    function getSellReturn(
        uint256 artistId,
        uint256 tokensToSell
    ) internal view returns (uint256 ethOut) {
        artistId;
        tokensToSell;
        // TODO: implement proper bonding curve math
        return 0;
    }

    // ------------------------------------------------------------------------
    // Buy / sell
    // ------------------------------------------------------------------------

    /// @notice Buy artist tokens along the bonding curve.
    /// @dev Currently: 1 wei (after fee) = 1 token. Slippage via minTokensOut.
    /// @param artistId      ID of the artist whose token is being bought.
    /// @param minTokensOut  Minimum acceptable tokens to receive (slippage control).
    function buy(uint256 artistId, uint256 minTokensOut) external payable {
        require(msg.value > 0, "No ETH sent");
        require(
            artistId > 0 && artistId <= registry.artistCount(),
            "Artist does not exist"
        );

        // Load artist info from the registry
        ArtistRegistry.Artist memory artist = registry.getArtist(artistId);
        require(artist.token != address(0), "Artist token not set");
        require(artist.artistWallet != address(0), "Artist wallet not set");

        // --------------------------------------------------------------------
        // Fee + pricing (placeholder)
        // --------------------------------------------------------------------
        // Take a 3% fee of msg.value and send to artist.
        uint256 fee = (msg.value * ARTIST_FEE_BPS) / 10_000;
        uint256 amountAfterFee = msg.value - fee;

        // Placeholder pricing: 1 wei (after fee) = 1 token.
        uint256 tokensOut = amountAfterFee;
        require(tokensOut >= minTokensOut, "Slippage: tokensOut < minTokensOut");

        // --------------------------------------------------------------------
        // Effects
        // --------------------------------------------------------------------

        // Update ETH reserve for this artist with the amount that stays in the curve
        reserveBalance[artistId] += amountAfterFee;
        emit ReserveUpdated(artistId, reserveBalance[artistId]);

        // Mint tokens to the buyer via the ArtistToken
        ArtistToken token = ArtistToken(artist.token);
        token.mint(msg.sender, tokensOut);

        // --------------------------------------------------------------------
        // Interactions (external calls)
        // --------------------------------------------------------------------
        // Pay fee to the artist wallet
        if (fee > 0) {
            (bool ok, ) = artist.artistWallet.call{value: fee}("");
            require(ok, "Artist fee transfer failed");
        }

        emit Bought(artistId, msg.sender, msg.value, tokensOut);
    }

    /// @notice Sell artist tokens back to the bonding curve.
    /// @dev Currently: 1 token = 1 wei (placeholder). Slippage via minEthOut.
    /// @param artistId     ID of the artist whose token is being sold.
    /// @param tokenAmount  Amount of tokens to sell.
    /// @param minEthOut    Minimum acceptable ETH to receive (slippage control).
    function sell(
        uint256 artistId,
        uint256 tokenAmount,
        uint256 minEthOut
    ) external {
        require(tokenAmount > 0, "No tokens to sell");
        require(
            artistId > 0 && artistId <= registry.artistCount(),
            "Artist does not exist"
        );

        // Load artist info from the registry
        ArtistRegistry.Artist memory artist = registry.getArtist(artistId);
        require(artist.token != address(0), "Artist token not set");

        ArtistToken token = ArtistToken(artist.token);

        // --------------------------------------------------------------------
        // Pricing (placeholder)
        // --------------------------------------------------------------------
        // For now, we use a trivial "bonding curve": 1 token = 1 wei.
        uint256 ethOut = tokenAmount;
        require(ethOut >= minEthOut, "Slippage: ethOut < minEthOut");
        require(
            reserveBalance[artistId] >= ethOut,
            "Insufficient reserve for artist"
        );

        // --------------------------------------------------------------------
        // Effects
        // --------------------------------------------------------------------
        // Burn tokens from the seller
        token.burn(msg.sender, tokenAmount);

        // Update reserve BEFORE transferring ETH (checks-effects-interactions)
        reserveBalance[artistId] -= ethOut;
        emit ReserveUpdated(artistId, reserveBalance[artistId]);

        // --------------------------------------------------------------------
        // Interactions
        // --------------------------------------------------------------------
        // Send ETH to the seller
        (bool ok, ) = msg.sender.call{value: ethOut}("");
        require(ok, "ETH transfer failed");

        emit Sold(artistId, msg.sender, tokenAmount, ethOut);
    }
}

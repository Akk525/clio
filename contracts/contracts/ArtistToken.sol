// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title ArtistToken
/// @notice ERC20 token representing a single artist's market.
/// @dev Only the owner (e.g. BondingCurveMarket) can mint and burn.
contract ArtistToken is ERC20, Ownable {
    /// @notice Deploy a new ArtistToken.
    /// @param name_   Human-readable name of the token (e.g. "Apollo - Luna").
    /// @param symbol_ Short symbol (e.g. "LUNA").
    /// @param initialOwner Address that will be set as owner (usually the market contract).
    constructor(
        string memory name_,
        string memory symbol_,
        address initialOwner
    )
        ERC20(name_, symbol_)        // pass name and symbol to ERC20
        Ownable(initialOwner)        // pass initialOwner to Ownable (OZ v5 style)
    {
        // no extra logic needed here
    }

    /// @notice Mint new tokens to a given address.
    /// @dev Only callable by the contract owner (e.g. BondingCurveMarket).
    /// @param to     Recipient of the newly minted tokens.
    /// @param amount Amount of tokens to mint (in smallest units, usually 18 decimals).
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /// @notice Burn tokens from a given address.
    /// @dev Only callable by the contract owner (e.g. BondingCurveMarket).
    /// @param from   Address whose tokens will be burned.
    /// @param amount Amount of tokens to burn.
    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }
}

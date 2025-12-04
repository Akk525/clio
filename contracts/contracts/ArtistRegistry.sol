// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @title ArtistRegistry
/// @notice Stores basic info about artists for Apollo Markets.
/// @dev Token address is initially a placeholder (address(0)) and can be set later.
contract ArtistRegistry is Ownable {
    /// @notice Info stored for each artist.
    struct Artist {
        address artistWallet;
        address token;      // artist's ERC20 token address (initially address(0))
        string name;        // display name
        string handle;      // short handle / username
    }

    /// @notice Total number of registered artists.
    uint256 public artistCount;

    /// @notice Mapping from artistId (1..artistCount) to Artist info.
    mapping(uint256 => Artist) public artists;

    /// @notice Reverse lookup: token address -> artistId.
    /// @dev Will be filled once token is created and linked.
    mapping(address => uint256) public artistIdByToken;

    /// @notice Emitted whenever a new artist is registered.
    event ArtistRegistered(
        uint256 indexed artistId,
        address indexed artistWallet,
        string name,
        string handle
    );

    /// @notice Emitted when an artist's token is linked.
    event ArtistTokenSet(uint256 indexed artistId, address indexed token);

    /// @notice Constructor sets the initial owner to the deployer.
    constructor() Ownable(msg.sender) {}

    /// @notice Register a new artist in the registry.
    /// @param artistWallet The wallet address associated with the artist (payout / identity).
    /// @param name         Human-readable display name of the artist.
    /// @param handle       Short handle / username for the artist.
    /// @return artistId    The newly assigned artist ID.
    function registerArtist(
        address artistWallet,
        string calldata name,
        string calldata handle
    ) external returns (uint256 artistId) {
        require(artistWallet != address(0), "Invalid artist wallet");

        artistId = ++artistCount; // increment then use

        artists[artistId] = Artist({
            artistWallet: artistWallet,
            token: address(0), // placeholder; will be set when token is created
            name: name,
            handle: handle
        });

        emit ArtistRegistered(artistId, artistWallet, name, handle);
    }

    /// @notice Link a deployed ERC20 token to an existing artist.
    /// @dev Only callable by the registry owner (e.g. factory / deployer).
    /// @param artistId The ID of the artist.
    /// @param token    The ERC20 token address for this artist.
    function setArtistToken(uint256 artistId, address token) external onlyOwner {
        require(artistId > 0 && artistId <= artistCount, "Artist does not exist");
        require(token != address(0), "Invalid token");
        require(artists[artistId].token == address(0), "Token already set");
        require(artistIdByToken[token] == 0, "Token already linked");

        artists[artistId].token = token;
        artistIdByToken[token] = artistId;

        emit ArtistTokenSet(artistId, token);
    }

    /// @notice View helper to get full artist info.
    /// @param artistId The ID of the artist.
    /// @return artist  The Artist struct.
    function getArtist(uint256 artistId) external view returns (Artist memory artist) {
        require(artistId > 0 && artistId <= artistCount, "Artist does not exist");
        artist = artists[artistId];
    }
}

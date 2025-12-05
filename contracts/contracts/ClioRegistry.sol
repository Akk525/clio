// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ClioRegistry {
    struct Artist {
        address artistWallet;
        address token;
        string name;
        string handle;
        bool active;
    }

    uint256 public nextArtistId;
    mapping(uint256 => Artist) public artists;
    mapping(address => uint256) public tokenToArtistId;

    address public owner;
    address public tokenFactory;
    address public market;

    event ArtistRegistered(uint256 indexed artistId, address artistWallet, string name, string handle);
    event ArtistTokenSet(uint256 indexed artistId, address token);
    event OwnerSet(address indexed newOwner);
    event TokenFactorySet(address indexed factory);
    event MarketSet(address indexed market);

    modifier onlyOwner() {
        require(msg.sender == owner, "ClioRegistry: not owner");
        _;
    }

    modifier onlyTokenFactory() {
        require(msg.sender == tokenFactory, "ClioRegistry: not factory");
        _;
    }

    constructor() {
        owner = msg.sender;
        emit OwnerSet(msg.sender);
    }

    function setOwner(address _owner) external onlyOwner {
        require(_owner != address(0), "ClioRegistry: zero owner");
        owner = _owner;
        emit OwnerSet(_owner);
    }

    function setTokenFactory(address _factory) external onlyOwner {
        require(_factory != address(0), "ClioRegistry: zero factory");
        tokenFactory = _factory;
        emit TokenFactorySet(_factory);
    }

    function setMarket(address _market) external onlyOwner {
        require(_market != address(0), "ClioRegistry: zero market");
        market = _market;
        emit MarketSet(_market);
    }

    // Called by factory when creating a new artist
    function registerArtist(
        address artistWallet,
        string memory name,
        string memory handle
    ) external onlyTokenFactory returns (uint256 artistId) {
        require(artistWallet != address(0), "ClioRegistry: zero wallet");

        artistId = nextArtistId++;
        artists[artistId] = Artist({
            artistWallet: artistWallet,
            token: address(0),
            name: name,
            handle: handle,
            active: true
        });

        emit ArtistRegistered(artistId, artistWallet, name, handle);
    }

    // Called by factory after token deployment
    function setArtistToken(uint256 artistId, address token) external onlyTokenFactory {
        Artist storage a = artists[artistId];
        require(a.artistWallet != address(0), "ClioRegistry: invalid artist");
        require(a.token == address(0), "ClioRegistry: token already set");
        require(token != address(0), "ClioRegistry: zero token");
        a.token = token;
        tokenToArtistId[token] = artistId;
        emit ArtistTokenSet(artistId, token);
    }
}

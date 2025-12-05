// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ClioArtistToken is ERC20, Ownable {
    constructor(
        string memory name_,
        string memory symbol_,
        address owner_
    )
        ERC20(name_, symbol_)             // ERC20 constructor call
        Ownable(owner_)                   // <-- FIX: pass owner_ here
    {}
    
    address public market;

    error NotMarket();

    function setMarket(address _market) external onlyOwner {
        require(_market != address(0), "ClioArtistToken: zero market");
        market = _market;
    }

    modifier onlyMarket() {
        if (msg.sender != market) revert NotMarket();
        _;
    }

    function mint(address to, uint256 amount) external onlyMarket {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyMarket {
        _burn(from, amount);
    }
}


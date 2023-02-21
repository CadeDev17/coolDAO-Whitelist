// SPDX-License-Identifier: MIT
pragma solidity  ^0.8.0;

contract Whitelist {
    uint8 public maxWhitelisted;

    mapping(address => bool) public whitelistedAddresses;

    uint8 public numWhitelisted;


    constructor(uint8 _maxWhitelisted) {
        maxWhitelisted = _maxWhitelisted;
    }

    function addAddressToWhitelist() public {
        require(numWhitelisted < maxWhitelisted, "Maximum amount of users whitelisted.");
        require(!whitelistedAddresses[msg.sender], "This account is already whitelisted");
        whitelistedAddresses[msg.sender] = true;
        numWhitelisted += 1;
    }
}
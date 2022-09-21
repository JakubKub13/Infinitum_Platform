//SPDX-License-Identifier: MIT
pragma solidity 0.8.8;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * ERC721 smart contract for minting Infinitas NFTs
 * This contract utilizes ERC721Enumerable standard to allow NFT iteration in the Lottery contract.
 * ERC721URIStorage standard is used for assigning NFTs with URI.
 * The Access control mechanism is used to grand NFT minter role to InfinitumFarm contract.
 */

contract InfinitasFactory is ERC721, ERC721Enumerable, ERC721URIStorage, AccessControl {
    using Counters for Counters.Counter;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    Counters.Counter private _tokenIdCounter;
    
    constructor() ERC721("Infinitas", "INFS") {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function safeMint(address to) public {
        require(hasRole(MINTER_ROLE, msg.sender));
        _safeMint(to, _tokenIdCounter.current());
        _tokenIdCounter.increment();
    }
}
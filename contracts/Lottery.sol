//SPDX-License-Identifier: MIT
pragma solidity 0.8.8;

import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./InfinitasFactory.sol";
import "./InfinitumToken.sol";


/**
 * The Lottery contract adds a lottery feature to InfinitumFarm contract which uses Infinitas NFT tokenId as 
 * the entrance ticked. This contract utilizes ChainLinks's VRF to create verifieable randomness for the winner number
 * Basic iteration of the lottery feature in Infinitum Platform. Infinitum farm contract has mintNFT function
 * which invokes transfer of tokens to fund the lotteryPool. 
 * The internal validateWinner function uses ERC721Enumerable standard with tokenOfOwnerByIndex functionality to
 * iterate and validate the user who holds the winning tokenId number
 */


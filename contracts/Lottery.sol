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

contract Lottery is Ownable, VRFConsumerBase {
    uint256 private lotteryPool;
    uint256 public lotteryCount;
    uint256 internal fee;
    bytes32 internal keyHash;
    InfinitasFactory public infinitasFactory;
    InfinitumToken public infinitumToken;
    IERC20 public linkToken;

    mapping(uint256 => uint256) public winningNumber;
    mapping(bytes32 => uint256) public requestIdToCount;

    event LotteryStart(uint256 indexed _lotteryCount, bytes32 indexed _requestId);
    event NumberReceived(bytes32 indexed _requestId, uint256 indexed _winningNumber);
    event LotteryClaim(address indexed winner, uint256 indexed amount);
    event WithdrawLink(address indexed from, uint256 indexed amount);

    /**
     * Constructor sets the necessary contract instances, addresses, and values for ChainLink's VRF mechanism
     */

    constructor(
        InfinitasFactory _infinitasFactory,
        InfinitumToken _infinitumToken,
        IERC20 _linkToken,
        address _coorAddress,
        address _linkTokenAddress,
        uint256 _fee,
        bytes32 _keyHash
        ) VRFConsumerBase (
            _coorAddress,
            _linkTokenAddress
        ) {
            infinitasFactory = _infinitasFactory;
            infinitumToken = _infinitumToken;
            linkToken = _linkToken;
            fee = _fee;
            keyHash = _keyHash;
        }
}
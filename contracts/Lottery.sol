//SPDX-License-Identifier: MIT
pragma solidity 0.8.8;

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./InfinitasFactory.sol";
import "./InfinitumToken.sol";


/**
 * This is V1 
 * The Lottery contract adds a lottery feature to InfinitumFarm contract which uses Infinitas NFT tokenId as 
 * the entrance ticked. This contract utilizes ChainLinks's VRF to create verifieable randomness for the winner number
 * Basic iteration of the lottery feature in Infinitum Platform. Infinitum farm contract has mintNFT function
 * which invokes transfer of tokens to fund the lotteryPool. 
 * The internal validateWinner function uses ERC721Enumerable standard with tokenOfOwnerByIndex functionality to
 * iterate and validate the user who holds the winning tokenId number
 */

contract Lottery is Ownable, VRFConsumerBaseV2 {
    VRFCoordinatorV2Interface private immutable vrfCoordinatorV2;
    uint64 private immutable subscriptionId;
    uint32 private immutable callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATION = 3;
    uint32 private constant NUM_WORDS = 1;
    uint256 private lotteryPool;
    uint256 public lotteryCount;
    uint256 internal fee;
    bytes32 internal keyHash;
    InfinitasFactory public infinitasFactory;
    InfinitumToken public infinitumToken;
    IERC20 public linkToken;

    mapping(uint256 => uint256) public winningNumber;
    mapping(uint256 => uint256) public requestIdToCount;

    event LotteryStart(uint256 indexed _lotteryCount, uint256 indexed _requestId);
    event NumberReceived(uint256 indexed _requestId, uint256 indexed _winningNumber);
    event LotteryClaim(address indexed winner, uint256 indexed amount);
    event AddInft(address indexed from, uint256 indexed amount);
    event WithdrawLink(address indexed from, uint256 indexed amount);

    /**
     * Constructor sets the necessary contract instances, addresses, and values for ChainLink's VRF mechanism
     */

    constructor(
        InfinitasFactory _infinitasFactory,
        InfinitumToken _infinitumToken,
        IERC20 _linkToken,
        address _vrfcoordinatorV2Address,
        uint256 _fee,
        bytes32 _keyHash,
        uint64 _subscriptionId,
        uint32 _callbackGasLimit
        ) VRFConsumerBaseV2 (
            _vrfcoordinatorV2Address
        ) {
            infinitasFactory = _infinitasFactory;
            infinitumToken = _infinitumToken;
            linkToken = _linkToken;
            fee = _fee;
            keyHash = _keyHash;
            vrfCoordinatorV2 = VRFCoordinatorV2Interface(_vrfcoordinatorV2Address);
            subscriptionId = _subscriptionId;
            callbackGasLimit = _callbackGasLimit;
        }

    /**
     * getRandomNumber function call returns a requestId from the requestRandomness VRF function. 
     * Mapping which we declared above as state variable requestIdToCount uses requestId as a key to point to the 
     * current lotteryCount. The lotteryCount than increments.
     */

    function getWinningNumber() public onlyOwner {
        uint256 requestId = getRandomNumber();
        requestIdToCount[requestId] = lotteryCount;
        emit LotteryStart(lotteryCount, requestId);
        lotteryCount++;
    }

    function getRandomNumber() internal returns (uint256 requestId) {
        //uint256 userSeedNum = uint256(keccak256(abi.encodePacked(blockhash(block.number - 1)))); // check this 
        return vrfCoordinatorV2.requestRandomWords(keyHash, subscriptionId, REQUEST_CONFIRMATION, callbackGasLimit, NUM_WORDS);
    }

    /**
     * Chainlink VRF will callback into this function with the requestId and random number
     * It takes totalSupply of Infinitas NFTs as  the divisor and uses CHainLink's returned number as the dividend.
     * The winningNumber mapping takes the requestIdToCount mapping as an argument which uses the _requestId as its argument and points
     * to the modulus of the tokenIds and random number
     * @param _requestId -> The return value used to track the VRF call with the current uint
     * @param randomWords -> The verifiable random array of numbers returned from Chainlink's VRF contract
     */

    
    function fulfillRandomWords(uint256 _requestId, uint256[] memory randomWords) internal override {
        uint totalIds = infinitasFactory.getTotalSupply();
        uint256 winningNum = randomWords[0] % totalIds;
        winningNumber[requestIdToCount[_requestId]] = winningNum;
        emit NumberReceived(_requestId, winningNum);
    }

    /**
     * This function adds Infinitum token to the Lottery contract
     * The Infinitum farm contract calls this function within its mintNFT function
     * @param from -> the sender to the tx
     * @param inft -> total amount of inft tokens to send
     */

    function addToLotteryPool(address from, uint256 inft) public {
        require(inft > 0, "Lottery: You are adding 0");
        lotteryPool += inft;
        infinitumToken.transferFrom(from, address(this), inft);
        emit AddInft(msg.sender, inft);
    }

    /**
     * This is an internal function that verifies that user's NFT tokenId matches the winning lottery number
     * This function checks the amount of Infinitas NFTs in possesion of user. Than it iterates the tokenIds and returns true
     * if the tokenId is the same as winning number. The unchecked keyword wraps the for loop to safe gas.
     * @param userAddr -> the address of the user
     */

    function validateWinner(address userAddr) internal view returns (bool) {  
        uint256 totalNfts = infinitasFactory.balanceOf(userAddr);
        uint winNum = winningNumber[lotteryCount - 1];
        unchecked {
            for(uint256 i; i < totalNfts; i++) {
                if(infinitasFactory.tokenOfOwnerByIndex(userAddr, i) == winNum) {
                    return true;
                }
            }
        }
    }

    /**
     * This function allows the user with the winning NFT tokenId to claim the lotteryPool winnings
     * It utilizes internal validateWinner function to verify that the user holds the winning tokenId number.
     * Resets the lotteryPool balance to zero using check -> effects -> interaction smart contract pattern before sending money to
     * user in order to prevent reentrancy attack.
     */

    function claimLotteryPrice() public {
        require(validateWinner(msg.sender) && lotteryPool > 0, "Lottery: You are not a winner or lottery pool is empty");
        uint256 toTransferPrice = lotteryPool;
        lotteryPool = 0;
        infinitumToken.transfer(msg.sender, toTransferPrice);
        emit LotteryClaim(msg.sender, toTransferPrice);
    }

    function withdrawLink() public onlyOwner {
        uint256 toTransferLink = linkToken.balanceOf(address(this));
        linkToken.transfer(msg.sender, toTransferLink);
        emit WithdrawLink(msg.sender, toTransferLink);
    }

    function getLinkBalance() public view returns (uint256) {
        return linkToken.balanceOf(address(this));
    }
}
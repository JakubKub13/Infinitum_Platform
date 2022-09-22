//SPDX-License-Identifier: MIT
pragma solidity 0.8.8;

import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../InfinitasFactory.sol";
import "../InfinitumToken.sol";


contract MockLottery is Ownable, VRFConsumerBase {
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
    event AddInft(address indexed from, uint256 indexed amount);
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


    function getWinningNumber() public onlyOwner {
        bytes32 requestId = getRandomNumber();
        requestIdToCount[requestId] = lotteryCount;
        emit LotteryStart(lotteryCount, requestId);
        lotteryCount++;
    }

    function getRandomNumber() internal returns (bytes32 requestId) {
        //uint256 userSeedNum = uint256(keccak256(abi.encodePacked(blockhash(block.number - 1)))); // check this 
        return requestRandomness(keyHash, fee);
    }

    function fulfillRandomness(bytes32 _requestId, uint256 _randomness) internal override {
        uint256 totalIds = infinitasFactory.getTotalSupply();
        uint256 winningNum = (_randomness % totalIds) + 1;
        winningNumber[requestIdToCount[_requestId]] = winningNum;
        emit NumberReceived(_requestId, winningNum);
    }

    function addToLotteryPool(address from, uint256 inft) public {
        require(inft > 0, "Lottery: You are adding 0");
        lotteryPool += inft;
        infinitumToken.transferFrom(from, address(this), inft);
        emit AddInft(msg.sender, inft);
    }

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

    // Additional Test functions
    bytes32 public __requestId = keccak256("5");

    function testGetWinningNumber0() public {
        requestIdToCount[__requestId] = lotteryCount;
        testFulfillRandomness(__requestId, 0);
        emit LotteryStart(lotteryCount, __requestId);
        lotteryCount++;
    }

    function testGetWinningNumber() public {
        requestIdToCount[__requestId] = lotteryCount;
        testFulfillRandomness(__requestId, 99);
        emit LotteryStart(lotteryCount, __requestId);
        lotteryCount++;
    }

    function testFulfillRandomness(bytes32 __RequestId, uint256 _randomness) public {
        uint256 totalIds = infinitasFactory.getTotalSupply();
        uint256 winningNum = (_randomness % totalIds);
        winningNumber[requestIdToCount[__RequestId]] = winningNum;
        emit NumberReceived(__RequestId, winningNum);
    }
}
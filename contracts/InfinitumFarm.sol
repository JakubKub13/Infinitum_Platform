//SPDX-License-Identifier: MIT
pragma solidity 0.8.8;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./InfinitumToken.sol";
import "./InfinitasFactory.sol";
import "./Lottery.sol";

/// @title Infinitum Farm
/// @notice This contract is s simple yield farming dApp where users can lock up their DAI stablecoin and get rewards for that action
///         in form of ERC20 Infinitum token.
/// @dev Contract inherits InfinitumToken contract which automaticly mints INFT tokens when user call the withdrawYield function.
///      Functions calculateYield time and calculateYieldTotal are used to calculate all necessary yield metrics.
///      Ownership of the InfinitumToken contract should be transferred to the InfinitumFarm contract immediately after deployment.

contract InfinitumFarm {

    mapping(address => uint256) public stakingBalance;
    mapping(address => bool) public isStaking;
    mapping(address => uint256) public startTime;
    mapping(address => uint256) public inftBalance;
    mapping(string => uint256) public nftCount;

    string public name = "Infinitum Farm";

    IERC20 public daiStablecoin;
    InfinitumToken public infinitumToken;
    InfinitasFactory public infinitasFactory;
    Lottery public lottery;

    uint256 private nftPrice;

    event Stake(address indexed from, uint256 amount);
    event Unstake(address indexed from, uint256 amount);
    event YieldWithdraw(address indexed to, uint256 amount);
    event MintNFT(address indexed to, uint256 indexed tokenId);

    constructor(
        IERC20 _daiToken,
        InfinitumToken _infinitumToken,
        InfinitasFactory _infinitasFactory,
        Lottery _lottery,
        uint256 _nftPrice
    ) {
        daiStablecoin = _daiToken;
        infinitumToken = _infinitumToken;
        infinitasFactory = _infinitasFactory;
        lottery = _lottery;
        nftPrice = _nftPrice;
    }

///@notice This function locks user's DAI within the contract
/// @dev If the user has already staked dai the
/// @param amount is the Quantity of how much Dai user wants to add.
    function stake(uint256 amount) public {
        require(amount > 0 && daiStablecoin.balanceOf(msg.sender) >= amount, "InfinitumFarm: You want to stake 0 DAI or don't have enough tokens to stake");

        if(isStaking[msg.sender] == true) {
            uint256 toTransferAmount = calculateYieldTotal(msg.sender);
        }
    }



    function calculateYieldTime(address user) public view returns (uint256) {
        uint256 end = block.timestamp;
        uint256 totalTimeStaked = end - startTime[user];
        return totalTimeStaked;
    }

    function calculateYieldTotal(address user) public view returns (uint256) {
        uint256 yieldTime = calculateYieldTime(user) * 10**18;
        uint256 rate = 86400;
        uint256 timeRate = yieldTime / rate;
        uint256 rawYield = (stakingBalance[user] * timeRate) / 10**18;
        return rawYield; 
    }


}
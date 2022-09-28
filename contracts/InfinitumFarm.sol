//SPDX-License-Identifier: MIT
pragma solidity 0.8.8;

import "./interfaces/IERC20.sol";
import "./InfinitumToken.sol";
import "./InfinitasFactory.sol";

/// @title Infinitum Farm
/// @notice This contract is s simple yield farming dApp where users can lock up their DAI stablecoin and get rewards for that action
///         in form of ERC20 Infinitum token.
/// @dev Contract inherits InfinitumToken contract which automaticly mints INFT tokens when user call the withdrawYield function.
///      Functions calculateYield time and calculateYieldTotal are used to calculate all necessary yield metrics.
///      Ownership of the InfinitumToken contract should be transferred to the InfinitumFarm contract immediately after deployment.

contract InfinitumFarm {
    IERC20 public immutable daiToken;
    IERC20 public immutable infinitumToken;

/// STATE VARIABLES NEEDED TO KEEP TRACK OF REWARDS (Infinitum token)
    address public owner;
    // Duration of reward
    uint256 public duration;
    // Time when the reward finishes
    uint256 public finishAt;
    // Last time this contract was updated
    uint256 public updatedAt;
    // Reward user earns per second
    uint256 public rewardRate;
    // Reward per token stored --> sum of reward rate * duration divided by totalSupply
    uint256 public rewardPerTokenStored;
    // Reward per token stored per user
    mapping(address => uint256) public userRewardPerTokenPaid;
    // Keep track of rewards that the user has earned
    mapping(address => uint256) public rewards;

/// STATE VARIABLES NEEDED TO KEEP TRACK OF THE TOTAL SUPPLY OF STAKING TOKEN (DAI token) AND AMOUNT STAKED PER USER
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;

    constructor(address _daiToken, address _infinitumToken) {
        owner = msg.sender;
        daiToken = IERC20(_daiToken);
        infinitumToken = IERC20(_infinitumToken);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "InfinitumFarm: Caller is not and owner of contract");
        _;
    }
/// This modofier is called when user stakes & withdraws -> contract is able to track rewardPerToken() and userRewardPerTokenPaid
    modifier updateReward(address _account) {
        rewardPerTokenStored = rewardPerToken();
        updatedAt = lastTimeRewardApplicable();

        if(_account != address(0)) {
            rewards[_account] = earned(_account);
            userRewardPerTokenPaid[_account] = rewardPerTokenStored;
        }
        _;
    }

    function setRewardsDuration(uint256 _duration) external onlyOwner {
        require(finishAt < block.timestamp, "InfinitumFarm: Reward duration has not finished yet");
        duration = _duration;
    }

/// Owner can call to send infinitum tokens into this contract and set the reward rate
    function modifyRewardAmount(uint256 _inftAmount) external onlyOwner updateReward(address(0)) {
        if(block.timestamp > finishAt) {
            rewardRate = _inftAmount / duration;
        } else {
            uint256 remainingRewards = rewardRate * (finishAt - block.timestamp);
            rewardRate = (remainingRewards + _amount) / duration;
        }
        require(rewardRate > 0, "InfinitumFarm: Reward rate = 0");
        require(rewardRate * duration <= infinitumToken.balanceOf(address(this)), "InfinitumFarm: Reward amount > balance");
        finishAt = block.timestamp + duration;
        updatedAt = block.timestamp;
    }

/// Users can call this function to stake DAI tokens
    function stakeDAI(uint256 _daiAmount) external updateReward(msg.sender) {
        require(_daiAmount > 0, "InfinitumFarm: No DAI tokens to stake");
        daiToken.transferFrom(msg.sender, address(this), _daiAmount);
        balanceOf[msg.sender] += _daiAmount; // keeps track of dai tokens staked by msg.sender
        totalSupply += _daiAmount; // keeps track of total amount of dai tokens staked inside this contract
    }

// Users call this function to withdraw staked DAI tokens
    function withdrawDAI(uint256 _daiAmount) external updateReward(msg.sender) {
        require(_daiAmount > 0, "InfinitumFarm: No DAI tokens to withdraw");
        balanceOf[msg.sender] -= _daiAmount;
        totalSupply -= _daiAmount;
        daiToken.transfer(msg.sender, _daiAmount);
    }


}
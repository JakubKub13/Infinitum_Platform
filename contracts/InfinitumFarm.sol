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

    modifier updateReward(address _account) {
        rewardPerTokenStored = rewardPerToken();
        updatedAt = lastTimeRewardApplicable();

        if(_account != address(0)) {
            rewards[_account] = earned(_account);
            userRewardPerTokenPaid[_account] = rewardPerTokenStored;
        }
        _;
    }
}
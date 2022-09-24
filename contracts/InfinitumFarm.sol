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
}
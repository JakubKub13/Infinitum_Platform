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

/// @notice This function locks user's DAI within the contract
/// @dev If the user has already staked dai the
/// @param amount is the Quantity of how much Dai user wants to add.
    function stake(uint256 amount) public {
        require(amount > 0 && daiStablecoin.balanceOf(msg.sender) >= amount, "InfinitumFarm: You want to stake 0 DAI or don't have enough tokens to stake");

        if(isStaking[msg.sender] == true) {
            uint256 toTransferAmount = calculateYieldTotal(msg.sender);
            inftBalance[msg.sender] += toTransferAmount;
        }

        daiStablecoin.transferFrom(msg.sender, address(this), amount);
        stakingBalance[msg.sender] += amount;
        startTime[msg.sender] = block.timestamp;
        isStaking[msg.sender] = true;
        emit Stake(msg.sender, amount);
    }

/// @notice Returns staked Funds locked in the contract to the user. 
/// @dev The yiealdToTransfer variable calculates and transfers the result to inftBalance in order to save the user's unrealized yield
/// @param amount -> The quantity of how much Dai user wants to withdraw
    function unstake(uint256 amount) public {
        require(isStaking[msg.sender] == true && stakingBalance[msg.sender] >= amount, "InfinitumFarm: Nothing to unstake");
        uint256 yieldToTransfer = calculateYieldTotal(msg.sender);
        startTime[msg.sender] = block.timestamp;
        uint256 balTransfer = amount;
        amount = 0; 
        stakingBalance[msg.sender] -= balTransfer;
        daiStablecoin.transfer(msg.sender, balTransfer);
        inftBalance[msg.sender] += yieldToTransfer;
        if(stakingBalance[msg.sender] == 0) {
            isStaking[msg.sender] = false;
        }
        emit Unstake(msg.sender, balTransfer);
    }

    function returnStartTimeUser(address user) public view returns (uint256) {
        uint256 Sttime = startTime[user];
        return Sttime;
    }

/// @notice This function calculates the total time the user has staked Dai in this contract
/// @dev function should be internal in production the public visibility is for testing purposes
/// @param user -> The address of the user staking
    function calculateYieldTime(address user) public view returns (uint256) {
        uint256 end = block.timestamp;
        return end;
        //uint256 totalTime = end - startTime[user]; 
        //return totalTime;
    }

/// @notice This function calculates the user's yield while using a 86400 second rate (100% retunrs in 24 hours)
/// @dev Because the Solidity language does not compute decimals the time is multiplied by 10**18
/// @param user -> The address of the user
    function calculateYieldTotal(address user) public view returns (uint256) {
        uint256 yieldTime = calculateYieldTime(user) * 10**18;
        uint256 rate = 86400;
        uint256 timeRate = yieldTime / rate;
        uint256 rawYield = (stakingBalance[user] * timeRate) / 10**18;
        return rawYield; 
    }

/// @notice This function accures the Infinitum token yield to the user
/// @dev The conditional statement checks for stored INFT balance. If it exists accured yield is added to the
/// accured yield before INFT mint function is called
    function realizeYield() public {
        uint256 yieldToTransfer = calculateYieldTotal(msg.sender);
        require(yieldToTransfer > 0 || inftBalance[msg.sender] > 0, "InfinitumFarm: No Yield to realize");

        if(inftBalance[msg.sender] != 0) {
            uint256 balanceBefore = inftBalance[msg.sender];
            inftBalance[msg.sender] = 0;
            yieldToTransfer += balanceBefore;
        }

        startTime[msg.sender] = block.timestamp;
        infinitumToken.mint(msg.sender, yieldToTransfer);
        emit YieldWithdraw(msg.sender, yieldToTransfer);
    }

/// @notice This function calls the mintItem function in the InfinitasFactory contract which safeMint an NFT for user
/// @dev Function also calls addToLotteryPool function ln the Lottery contract and transfer INFT token from user
/// Calls the mintItem function in InfinitasFactory contract which calls the ERC721 safeMint function. Updates nftCount mapping
/// @param user -> Address of the user
/// @param tokenURI -> The Uniform Resource Identifier (URI) for tokenId
    function mintNFT(address user, string calldata tokenURI) public {
        require(infinitumToken.balanceOf(msg.sender) >= nftPrice, "InfinitumFarm: Not enough tokens to buy");
        lottery.addToLotteryPool(msg.sender, nftPrice);
        uint256 tokenId = infinitasFactory.mintItem(user, tokenURI);
        nftCount[tokenURI]++;
        emit MintNFT(msg.sender, tokenId);
    }
}
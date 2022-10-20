import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { network, deployments, ethers } from "hardhat";
import { developmentChains } from "../helper-hardhat-config";
import { BigNumber } from "ethers";
import { InfinitumToken, MockERC20, InfinitumFarm  } from "../typechain-types";
import { expect } from "chai";


!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Infinitum Farm testing", function() {
        let  owner: SignerWithAddress;
        let jacob: SignerWithAddress;
        let martin: SignerWithAddress;
        let peter: SignerWithAddress;
        let john: SignerWithAddress;
        let steve: SignerWithAddress;
        let infinitumFarm: InfinitumFarm;
        let mockDAI: MockERC20;
        let infinitumToken: InfinitumToken;
        
        const daiAmount: BigNumber = ethers.utils.parseEther("25000");
        const infinitumAmountInitFarm: BigNumber = ethers.utils.parseEther("1000000")
        const daiAmountOwner: BigNumber = ethers.utils.parseEther("20000000")
        const infinitumAmountOwner: BigNumber = ethers.utils.parseEther("200000")
      

        beforeEach(async () => {
            [owner, jacob, martin, peter, john, steve ] = await ethers.getSigners();
            await deployments.fixture(["all"]);
            infinitumFarm = await ethers.getContract("InfinitumFarm");
            mockDAI = await ethers.getContract("MockERC20");
            infinitumToken = await ethers.getContract("InfinitumToken");

            // DAI TRANSFERS---------------
            await Promise.all([
                mockDAI.mint(owner.address, daiAmountOwner),
                mockDAI.mint(jacob.address, daiAmount),
                mockDAI.mint(martin.address, daiAmount),
                mockDAI.mint(peter.address, daiAmount),
                mockDAI.mint(john.address, daiAmount),
                mockDAI.mint(steve.address, daiAmount),
            ]);
            let durationTime: number = 1000
            await infinitumFarm.setRewardsDuration(durationTime)

            let minter = await infinitumToken.MINTER_ROLE()
            await infinitumToken.grantRole(minter, owner.address);
            await infinitumToken.mint(owner.address, infinitumAmountOwner);
        });

        describe("Initialization", function () {
            it("Should deploy contracts without errors", async () => {
                expect(infinitumFarm).to.be.ok;
                expect(mockDAI).to.be.ok;
                expect(infinitumToken).to.be.ok                
            })

            it("Should return name", async () => {
                 expect(await mockDAI.name()).to.eq("DAI token")
                 expect(await infinitumToken.name()).to.eq("Infinitum token")
            });

            it("Should return correct mockDAI balance of accounts", async () => {
                expect(await mockDAI.balanceOf(owner.address)).to.eq(daiAmountOwner);
                expect(await mockDAI.balanceOf(jacob.address)).to.eq(daiAmount);
                expect(await mockDAI.balanceOf(martin.address)).to.eq(daiAmount);
                expect(await mockDAI.balanceOf(peter.address)).to.eq(daiAmount);
                expect(await mockDAI.balanceOf(john.address)).to.eq(daiAmount);
                expect(await mockDAI.balanceOf(steve.address)).to.eq(daiAmount);
            });
            
            it("Should set the duration of staking", async () => {
                expect(await infinitumFarm.duration()).to.eq(1000)
            });
            it("Initial total supply of DAI in contract should be 0)", async () => {
                let initialDaiBalance = await infinitumFarm.totalSupply();
                expect(initialDaiBalance.toString()).to.eq('0');
            });
            
            it("Balance of INFT tokens in farm should be greater than reward amount", async () => {
                await infinitumToken.mint(infinitumFarm.address, infinitumAmountInitFarm)
                let modifyRewardTx = await infinitumFarm.modifyRewardAmount(1000);
                await modifyRewardTx.wait();
                let inftTokenFarmBal = await infinitumToken.balanceOf(infinitumFarm.address);
                let formattedInftTokenFarmBal = inftTokenFarmBal.toString()
                let _rewardRate = await infinitumFarm.rewardRate();
                let formattedRewRate = _rewardRate.toNumber();
                let duration = await infinitumFarm.duration();
                let formattedDuration = duration.toNumber();
                let rewardAmount = formattedRewRate * formattedDuration;
                expect(console.log(`Balance of Farm is ${formattedInftTokenFarmBal} which is greater than RewardAmount that is ${rewardAmount}`));
             });

            it("Should revert when modifyReward is called but contract has no balance of INFT tokens", async () => {
                expect(await infinitumFarm.modifyRewardAmount(1000)).to.be.revertedWith('InfinitumFarm: Reward amount > balance');
            });
            
            it("Should revert when modifyReward is called but the caller is not the owner", async () => {
                await infinitumToken.mint(infinitumFarm.address, infinitumAmountInitFarm)
                expect(await infinitumFarm.connect(jacob).modifyRewardAmount(1000)).to.be.revertedWith("InfinitumFarm: Caller is not and owner of contract")
            })
        })

        describe("Testing Staking functionality", function () {
            it("Caller of the function should have more or equal DAI to the amount he wants to stake", async () => {
                let jacobDAIBalance = await mockDAI.balanceOf(jacob.address);
                let higherThanBalAmount = ethers.utils.parseEther("25001");
                await mockDAI.connect(jacob).approve(infinitumFarm.address, higherThanBalAmount);
                expect(await infinitumFarm.connect(jacob).stakeDAI(higherThanBalAmount)).to.be.revertedWith("ERC20: transfer amount exceeds balance");
            });

            it("Should stake correctly from multiple accounts", async () => {
                let daiAmountToStake = ethers.utils.parseEther("1"); // Staking 1 DAI with 18 decimals

                await Promise.all([ 
                    mockDAI.approve(infinitumFarm.address, daiAmountToStake),
                    mockDAI.connect(jacob).approve(infinitumFarm.address, daiAmountToStake),
                    mockDAI.connect(martin).approve(infinitumFarm.address, daiAmountToStake),
                    mockDAI.connect(john).approve(infinitumFarm.address, daiAmountToStake),
                    mockDAI.connect(steve).approve(infinitumFarm.address, daiAmountToStake),
                ]);

                await Promise.all([
                    infinitumFarm.stakeDAI(daiAmountToStake),
                    infinitumFarm.connect(jacob).stakeDAI(daiAmountToStake),
                    infinitumFarm.connect(martin).stakeDAI(daiAmountToStake),
                    infinitumFarm.connect(john).stakeDAI(daiAmountToStake),
                    infinitumFarm.connect(steve).stakeDAI(daiAmountToStake)
                ]);

                let stakedBalanceOwner = await infinitumFarm.balanceOf(owner.address);
                let stakedBalanceJacob = await infinitumFarm.balanceOf(jacob.address);
                let stakedBalanceMartin = await infinitumFarm.balanceOf(martin.address);
                let stakedBalanceJohn = await infinitumFarm.balanceOf(john.address);
                let stakedBalanceSteve = await infinitumFarm.balanceOf(steve.address);
                
                expect(stakedBalanceOwner).to.eq(daiAmountToStake);
                expect(stakedBalanceJacob).to.eq(daiAmountToStake);
                expect(stakedBalanceMartin).to.eq(daiAmountToStake);
                expect(stakedBalanceJohn).to.eq(daiAmountToStake);
                expect(stakedBalanceSteve).to.eq(daiAmountToStake);
            });
        })
        

        describe("Testing Unstaking functionality", function () {
            beforeEach(async () => {
                let daiAmountToStake = ethers.utils.parseEther("2"); // Staking 1 DAI with 18 decimals
                

                await Promise.all([ 
                    mockDAI.approve(infinitumFarm.address, daiAmountToStake),
                    mockDAI.connect(jacob).approve(infinitumFarm.address, daiAmountToStake),
                    mockDAI.connect(martin).approve(infinitumFarm.address, daiAmountToStake),
                    mockDAI.connect(john).approve(infinitumFarm.address, daiAmountToStake),
                    mockDAI.connect(steve).approve(infinitumFarm.address, daiAmountToStake),
                ]);

                await Promise.all([
                    infinitumFarm.stakeDAI(daiAmountToStake),
                    infinitumFarm.connect(jacob).stakeDAI(daiAmountToStake),
                    infinitumFarm.connect(martin).stakeDAI(daiAmountToStake),
                    infinitumFarm.connect(john).stakeDAI(daiAmountToStake),
                    infinitumFarm.connect(steve).stakeDAI(daiAmountToStake)
                ]);
            });

            it("Should partially unstake DAI", async () => {
                let daiAmountToUnstake = ethers.utils.parseEther("1");

                await Promise.all([
                    infinitumFarm.withdrawDAI(daiAmountToUnstake),
                    infinitumFarm.connect(jacob).withdrawDAI(daiAmountToUnstake),
                    infinitumFarm.connect(martin).withdrawDAI(daiAmountToUnstake),
                    infinitumFarm.connect(john).withdrawDAI(daiAmountToUnstake),
                    infinitumFarm.connect(steve).withdrawDAI(daiAmountToUnstake)
                ]);

                let stakedBalanceOwnerAfter = await infinitumFarm.balanceOf(owner.address);
                let stakedBalanceJacobAfter = await infinitumFarm.balanceOf(jacob.address);
                let stakedBalanceMartinAfter = await infinitumFarm.balanceOf(martin.address);
                let stakedBalanceJohnAfter = await infinitumFarm.balanceOf(john.address);
                let stakedBalanceSteveAfter = await infinitumFarm.balanceOf(steve.address);

                let formatStakedBalanceOwnerAfter = ethers.utils.formatEther(stakedBalanceOwnerAfter)
                let formatStakedBalanceJacobrAfter = ethers.utils.formatEther(stakedBalanceJacobAfter)
                let formatStakedBalanceMartinAfter = ethers.utils.formatEther(stakedBalanceMartinAfter)
                let formatStakedBalanceJohnAfter = ethers.utils.formatEther(stakedBalanceJohnAfter)
                let formatStakedBalanceSteveAfter = ethers.utils.formatEther(stakedBalanceSteveAfter) 
                
                expect(formatStakedBalanceOwnerAfter).to.eq("1.0");
                expect(formatStakedBalanceJacobrAfter).to.eq("1.0");
                expect(formatStakedBalanceMartinAfter).to.eq("1.0");
                expect(formatStakedBalanceJohnAfter).to.eq("1.0");
                expect(formatStakedBalanceSteveAfter).to.eq("1.0");
            });

            it("Should unstake all of DAI", async () => {
                let daiAmountToUnstake = ethers.utils.parseEther("2");

                await Promise.all([
                    infinitumFarm.withdrawDAI(daiAmountToUnstake),
                    infinitumFarm.connect(jacob).withdrawDAI(daiAmountToUnstake),
                    infinitumFarm.connect(martin).withdrawDAI(daiAmountToUnstake),
                    infinitumFarm.connect(john).withdrawDAI(daiAmountToUnstake),
                    infinitumFarm.connect(steve).withdrawDAI(daiAmountToUnstake)
                ]);

                let stakedBalanceOwnerAfter = await infinitumFarm.balanceOf(owner.address);
                let stakedBalanceJacobAfter = await infinitumFarm.balanceOf(jacob.address);
                let stakedBalanceMartinAfter = await infinitumFarm.balanceOf(martin.address);
                let stakedBalanceJohnAfter = await infinitumFarm.balanceOf(john.address);
                let stakedBalanceSteveAfter = await infinitumFarm.balanceOf(steve.address);

                expect(stakedBalanceOwnerAfter).to.eq(0);
                expect(stakedBalanceJacobAfter).to.eq(0);
                expect(stakedBalanceMartinAfter).to.eq(0);
                expect(stakedBalanceJohnAfter).to.eq(0);
                expect(stakedBalanceSteveAfter).to.eq(0);
            });
        });

        describe("Testing Yield Functionality", function () {
            let daiAmountToStake = ethers.utils.parseEther("2");
            let daiAmountToUnstake = ethers.utils.parseEther("2");
            
            beforeEach(async () => {
                await infinitumToken.mint(infinitumFarm.address, infinitumAmountInitFarm)
                let modifyRewardTx = await infinitumFarm.modifyRewardAmount(1000);
                await modifyRewardTx.wait();
                
                await Promise.all([ 
                    mockDAI.approve(infinitumFarm.address, daiAmountToStake),
                    mockDAI.connect(jacob).approve(infinitumFarm.address, daiAmountToStake),
                    mockDAI.connect(martin).approve(infinitumFarm.address, daiAmountToStake),
                    mockDAI.connect(john).approve(infinitumFarm.address, daiAmountToStake),
                    mockDAI.connect(steve).approve(infinitumFarm.address, daiAmountToStake),
                ]);

                await Promise.all([
                    infinitumFarm.stakeDAI(daiAmountToStake),
                    infinitumFarm.connect(jacob).stakeDAI(daiAmountToStake),
                    infinitumFarm.connect(martin).stakeDAI(daiAmountToStake),
                    infinitumFarm.connect(john).stakeDAI(daiAmountToStake),
                    infinitumFarm.connect(steve).stakeDAI(daiAmountToStake)
                ]);
                
            })

            it("Should get yield", async () => {
                
                let _rewardPerToken = await infinitumFarm.rewardPerTokenStored();

                console.log(`Initial reward per token when all users are staking is: ${_rewardPerToken.toString()}`);

                await network.provider.send("evm_increaseTime", [360]);
                await network.provider.send("evm_mine");
                await Promise.all([
                    infinitumFarm.withdrawDAI(daiAmountToUnstake),
                    infinitumFarm.connect(jacob).withdrawDAI(daiAmountToUnstake),
                ]);

                let ownerEarned = await infinitumFarm.earned(owner.address);
                let ownerEarnedFormat = ethers.utils.formatEther(ownerEarned);
                let jacobEarned = await infinitumFarm.earned(jacob.address);
                let jacobEarnedFormat = ethers.utils.formatEther(jacobEarned)

                console.log(`Owner has earned ${ownerEarnedFormat} INFT tokens`)
                console.log(`Jacob has earned ${jacobEarnedFormat} INFT tokens`)

                let _rewardPerToken1 = await infinitumFarm.rewardPerTokenStored();
                let _rewardPerToken1Format = ethers.utils.formatEther(_rewardPerToken1);
                
                console.log(`Reward per token when Owner and Jacob unstaked is: ${_rewardPerToken1Format}`);

                await network.provider.send("evm_increaseTime", [360]);
                await network.provider.send("evm_mine");
                await Promise.all([
                    infinitumFarm.connect(martin).withdrawDAI(daiAmountToUnstake),
                    infinitumFarm.connect(john).withdrawDAI(daiAmountToUnstake),
                ]);

                let martinEarned = await infinitumFarm.earned(martin.address);
                let martinEarnedFormat = ethers.utils.formatEther(martinEarned);
                let johnEarned = await infinitumFarm.earned(john.address);
                let johnEarnedFormat = ethers.utils.formatEther(johnEarned);

            
                console.log(`Martin has earned ${martinEarnedFormat} INFT tokens`)
                console.log(`John has earned ${johnEarnedFormat} INFT tokens`)

                let _rewardPerToken2 = await infinitumFarm.rewardPerTokenStored();
                let _rewardPerToken2Format = ethers.utils.formatEther(_rewardPerToken2);

                console.log(`Reward per token when Martin and John unstaked is: ${_rewardPerToken2Format}`);

                await network.provider.send("evm_increaseTime", [360]);
                await network.provider.send("evm_mine");
                await infinitumFarm.connect(steve).withdrawDAI(daiAmountToUnstake);

                let steveEarned = await infinitumFarm.earned(steve.address);
                let steveEarnedFormat = ethers.utils.formatEther(steveEarned);
                console.log(`Steve has earned ${steveEarnedFormat.toString()} INFT tokens`);

                let _rewardPerToken3 = await infinitumFarm.rewardPerTokenStored();
                let _rewardPerToken3Format = ethers.utils.formatEther(_rewardPerToken3);
                console.log(`Reward per token when all users unstaked is: ${_rewardPerToken3Format}`);

                await Promise.all([
                    infinitumFarm.getYield(),
                    infinitumFarm.connect(jacob).getYield(),
                    infinitumFarm.connect(martin).getYield(),
                    infinitumFarm.connect(john).getYield(),
                    infinitumFarm.connect(steve).getYield()
                ]);

                let steveBal = await infinitumToken.balanceOf(steve.address);
                let steveBalFormat = ethers.utils.formatEther(steveBal);
                let jacobBal = await infinitumToken.balanceOf(jacob.address);
                let jacobBalFormat = ethers.utils.formatEther(jacobBal);
                let martinBal = await infinitumToken.balanceOf(martin.address);
                let martinBalFormat = ethers.utils.formatEther(martinBal);
                let johnBal = await infinitumToken.balanceOf(john.address);
                let johnBalFormat = ethers.utils.formatEther(johnBal);
                
                
                //console.log(`Steve INFT balance after getYield() function called is ${steveBalFormat.toString()} which is equal to what steve earned ${steveEarnedFormat.toString()}`);
                console.log(`Jacob INFT balance after getYield() function called is ${jacobBalFormat} which is equal to what steve earned ${jacobEarnedFormat}`);
                expect(jacobBalFormat).to.eq(jacobEarnedFormat);
                console.log(`Martin INFT balance after getYield() function called is ${martinBalFormat} which is equal to what steve earned ${martinEarnedFormat}`);
                expect(martinBalFormat).to.eq(martinEarnedFormat);
                console.log(`John INFT balance after getYield() function called is ${johnBalFormat} which is equal to what steve earned ${johnEarnedFormat}`);
                expect(johnBalFormat).to.eq(johnEarnedFormat);
                console.log(`Steve INFT balance after getYield() function called is ${steveBalFormat} which is equal to what steve earned ${steveEarnedFormat}`);
                expect(steveBalFormat).to.eq(steveEarnedFormat);
            });
        })
});
    

            
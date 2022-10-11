import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { network, deployments, ethers } from "hardhat";
import { developmentChains } from "../helper-hardhat-config";
import { BigNumber } from "ethers";
import { InfinitumToken, MockERC20, InfinitumFarm  } from "../typechain-types"
import { revertedWith } from "@nomiclabs/hardhat-waffle";


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
        })

        // DURATION 1000



        describe("Initialization", function () {
            it("Should deploy contracts without errors", async () => {
                expect(infinitumFarm).to.be.ok;
                expect(mockDAI).to.be.ok;
                expect(infinitumToken).to.be.ok                
            })

            it("Should return name", async () => {
                 expect(await mockDAI.name()).to.eq("DAI token")
                 expect(await infinitumToken.name()).to.eq("Infinitum token")
            })

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
                let ownerBalDai = await mockDAI.balanceOf(owner.address);
                console.log(`Owner balance of dai before staking is ${ownerBalDai.toString()}`)
                let daiAmountToStake = ethers.utils.parseEther("1")
                console.log(daiAmountToStake.toString())
                await mockDAI.approve(infinitumFarm.address, daiAmountToStake)
                await infinitumFarm.stakeDAI(daiAmountToStake);
                let daiAmountAfterStake = await mockDAI.balanceOf(owner.address);
                console.log(`Owner balance of dai after staking is ${daiAmountAfterStake.toString()}`)
            });

            it("Should stake correctly from multiple accounts", async () => {
                let ownerBalDaiBefore = await mockDAI.balanceOf(owner.address);
                let jacobBalDaiBefore = await mockDAI.balanceOf(jacob.address);
                let martinBalDaiBefore = await mockDAI.balanceOf(martin.address);
                let johnBalDaiBefore = await mockDAI.balanceOf(john.address);
                let steveBalDaiBefore = await mockDAI.balanceOf(steve.address);

                let daiAmountToStake = ethers.utils.parseEther("1"); // Staking 1 DAI with 18 decimals
                await mockDAI.approve(infinitumFarm.address, daiAmountToStake);
                await mockDAI.connect(jacob).approve(infinitumFarm.address, daiAmountToStake);
                await mockDAI.connect(martin).approve(infinitumFarm.address, daiAmountToStake);
                await mockDAI.connect(john).approve(infinitumFarm.address, daiAmountToStake);
                await mockDAI.connect(steve).approve(infinitumFarm.address, daiAmountToStake);
                
                await infinitumFarm.stakeDAI(daiAmountToStake);
                await infinitumFarm.connect(jacob).stakeDAI(daiAmountToStake);
                await infinitumFarm.connect(martin).stakeDAI(daiAmountToStake);
                await infinitumFarm.connect(john).stakeDAI(daiAmountToStake);
                await infinitumFarm.connect(steve).stakeDAI(daiAmountToStake);
       
            })
        })
        

        // describe("Unstaking functionality", function () {
            
        //     });
 })
    

            
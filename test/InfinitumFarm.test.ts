import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { assert, expect } from "chai";
import { network, deployments, ethers } from "hardhat";
import { developmentChains, networkConfig } from "../helper-hardhat-config";
import { BigNumber } from "ethers";
import { solidity } from "ethereum-waffle"
import { InfinitasFactory, InfinitumToken , Lottery, MockERC20, InfinitumFarm  } from "../typechain-types"
import { time } from "@openzeppelin/test-helpers"
import {  MockProvider  } from "ethereum-waffle";



!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Infinitum Farm testing", function() {
        let res: any;
        let accounts: SignerWithAddress[];
        let  owner: SignerWithAddress;
        let jacob: SignerWithAddress;
        let martin: SignerWithAddress;
        let peter: SignerWithAddress;
        let john: SignerWithAddress;
        let steve: SignerWithAddress;
        let infinitumFarm: InfinitumFarm;
        let mockDAI: MockERC20;
        let infinitumToken: InfinitumToken;
        let infinitasFactory: InfinitasFactory
        let lottery: Lottery;

        const timeTravel = async (provider: MockProvider, seconds: number) => {
            await provider.send("evm_increaseTime", [seconds]);
            await provider.send("evm_mine", []);
        }

        async function stakeAndTravel(stakingPool: InfinitumFarm, value: BigNumber, seconds: number, provider: any) {
            await stakingPool.stake({ value });
            await timeTravel(provider, seconds);
        }
        
        const daiAmount: BigNumber = ethers.utils.parseEther("25000");
        const nftPrice: BigNumber = ethers.utils.parseEther("1");

        beforeEach(async () => {
            [owner, jacob, martin, peter, john, steve ] = await ethers.getSigners();
            await deployments.fixture(["all"]);
            infinitumFarm = await ethers.getContract("InfinitumFarm");
            mockDAI = await ethers.getContract("MockERC20");
            infinitumToken = await ethers.getContract("InfinitumToken");
            infinitasFactory = await ethers.getContract("InfinitasFactory");
            lottery = await ethers.getContract("Lottery")


            // DAI TRANSFERS---------------
            await Promise.all([
                mockDAI.mint(owner.address, daiAmount),
                mockDAI.mint(jacob.address, daiAmount),
                mockDAI.mint(martin.address, daiAmount),
                mockDAI.mint(peter.address, daiAmount),
                mockDAI.mint(john.address, daiAmount),
                mockDAI.mint(steve.address, daiAmount)
            ])
        })

        describe("Initialization", function () {
            it("Should deploy contracts without errors", async () => {
                expect(infinitasFactory).to.be.ok;
                expect(infinitumFarm).to.be.ok;
                expect(mockDAI).to.be.ok;
                expect(infinitumToken).to.be.ok
                expect(lottery).to.be.ok
            })

            it("Should return name", async () => {
                expect(await infinitumFarm.name()).to.eq("Infinitum Farm")
                expect(await mockDAI.name()).to.eq("DAI token")
                expect(await infinitumToken.name()).to.eq("Infinitum token")
            })

            it("Should return correct mockDAI balance of accounts", async () => {
                expect(await mockDAI.balanceOf(owner.address)).to.eq(daiAmount);
                expect(await mockDAI.balanceOf(jacob.address)).to.eq(daiAmount);
                expect(await mockDAI.balanceOf(martin.address)).to.eq(daiAmount);
                expect(await mockDAI.balanceOf(peter.address)).to.eq(daiAmount);
                expect(await mockDAI.balanceOf(john.address)).to.eq(daiAmount);
                expect(await mockDAI.balanceOf(steve.address)).to.eq(daiAmount);
            });
        })

        describe("Staking functionality", async() => {
            it("Should stake and update mapping", async () => {
                let toTransfer = await ethers.utils.parseEther("100")
                await mockDAI.connect(jacob).approve(infinitumFarm.address, toTransfer)
                expect(await infinitumFarm.isStaking(jacob.address)).to.eq(false)
                expect(await infinitumFarm.connect(jacob).stake(toTransfer)).to.be.ok
                expect(await infinitumFarm.stakingBalance(jacob.address)).to.eq(toTransfer)
                expect(await infinitumFarm.isStaking(jacob.address)).to.eq(true)
            });

            it("Should transfer DAI from user", async () => {
                let toTransfer = await ethers.utils.parseEther("100")
                await mockDAI.connect(jacob).approve(infinitumFarm.address, toTransfer)
                await infinitumFarm.connect(jacob).stake(toTransfer)
                res = await mockDAI.balanceOf(jacob.address)
                expect(Number(res)).to.be.lessThan(Number(daiAmount))
            });

            it("Should update staking balance with multiple stakes", async () => {
                let toTransfer = await ethers.utils.parseEther("100")
                await mockDAI.connect(martin).approve(infinitumFarm.address, toTransfer)
                await infinitumFarm.connect(martin).stake(toTransfer)
                await mockDAI.connect(peter).approve(infinitumFarm.address, toTransfer)
                await infinitumFarm.connect(peter).stake(toTransfer)
                await mockDAI.connect(john).approve(infinitumFarm.address, toTransfer)
                await infinitumFarm.connect(john).stake(toTransfer)
                await mockDAI.connect(steve).approve(infinitumFarm.address, toTransfer)
                await infinitumFarm.connect(steve).stake(toTransfer)
                expect(await infinitumFarm.isStaking(martin.address)).to.eq(true)
                expect(await infinitumFarm.isStaking(peter.address)).to.eq(true)
                expect(await infinitumFarm.isStaking(john.address)).to.eq(true)
                expect(await infinitumFarm.isStaking(steve.address)).to.eq(true)
            });

            it("Should revert if user tries to stake 0 DAIs", async () => {
                await expect(infinitumFarm.connect(martin).stake(0)).to.be.revertedWith("InfinitumFarm: You want to stake 0 DAI or don't have enough tokens to stake")
            });

            it("Should revert stake without sufficient allowance", async () => {
                let toTransfer = await ethers.utils.parseEther("100") 
                await expect(infinitumFarm.connect(jacob).stake(toTransfer)).to.be.revertedWith('ERC20: insufficient allowance')
            });

            it("Should revert with not enough funds", async () => {
                let toTransfer = ethers.utils.parseEther("1000000")
                await mockDAI.connect(jacob).approve(infinitumFarm.address, toTransfer)
                await expect(infinitumFarm.connect(jacob).stake(toTransfer)).to.be.revertedWith("InfinitumFarm: You want to stake 0 DAI or don't have enough tokens to stake")
            })
        })

        describe("Unstaking functionality", function () {
            it("Should unstake balance from user", async () => {
                let toTransfer = await ethers.utils.parseEther("100") 
                await mockDAI.connect(jacob).approve(infinitumFarm.address, toTransfer)
                await infinitumFarm.connect(jacob).stake(toTransfer)
                res = await infinitumFarm.stakingBalance(jacob.address)
                expect(Number(res)).to.be.greaterThan(0)
                await infinitumFarm.connect(jacob).unstake(toTransfer)
                expect(await infinitumFarm.stakingBalance(jacob.address)).to.eq(0)
            });

            it("Should remove staking status", async () => {
                let toTransfer = await ethers.utils.parseEther("100") 
                await mockDAI.connect(jacob).approve(infinitumFarm.address, toTransfer)
                await infinitumFarm.connect(jacob).stake(toTransfer)
                await infinitumFarm.connect(jacob).unstake(toTransfer)
                expect(await infinitumFarm.isStaking(jacob.address)).to.eq(false)
            });

            it("Should transfer minter role of Infinitum token to Infinitum factory", async () => {
                let minter = await infinitumToken.MINTER_ROLE()
                await infinitumToken.grantRole(minter, infinitumFarm.address)
                expect(await infinitumToken.hasRole(minter, infinitumFarm.address)).to.eq(true)
            })
        })
    })


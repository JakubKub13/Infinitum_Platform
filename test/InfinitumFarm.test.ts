import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { assert, expect } from "chai";
import { network, deployments, ethers } from "hardhat";
import { developmentChains, networkConfig } from "../helper-hardhat-config";
import { BigNumber } from "ethers";
import { MockProvider, solidity } from "ethereum-waffle"
import { InfinitasFactory, InfinitumToken, MockERC20, InfinitumFarm  } from "../typechain-types"


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
        
        const daiAmount: BigNumber = ethers.utils.parseEther("25000");
        const infinitumAmount: BigNumber = ethers.utils.parseEther("1000000")
      

        beforeEach(async () => {
            [owner, jacob, martin, peter, john, steve ] = await ethers.getSigners();
            await deployments.fixture(["all"]);
            infinitumFarm = await ethers.getContract("InfinitumFarm");
            mockDAI = await ethers.getContract("MockERC20");
            infinitumToken = await ethers.getContract("InfinitumToken");

            // DAI TRANSFERS---------------
            await Promise.all([
                mockDAI.mint(owner.address, daiAmount),
                mockDAI.mint(jacob.address, daiAmount),
                mockDAI.mint(martin.address, daiAmount),
                mockDAI.mint(peter.address, daiAmount),
                mockDAI.mint(john.address, daiAmount),
                mockDAI.mint(steve.address, daiAmount),
            ])
            let durationTime: number = 1000
            await infinitumFarm.setRewardsDuration(durationTime)

            let minter = await infinitumToken.MINTER_ROLE()
            

            // Mint 1 000 000 infinitum tokens to staking contract-------
            await Promise.all([
                infinitumToken.mint(owner.address, infinitumAmount)
            ])
            await infinitumFarm.modifyRewardAmount(infinitumAmount)
        })

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
                expect(await mockDAI.balanceOf(owner.address)).to.eq(daiAmount);
                expect(await mockDAI.balanceOf(jacob.address)).to.eq(daiAmount);
                expect(await mockDAI.balanceOf(martin.address)).to.eq(daiAmount);
                expect(await mockDAI.balanceOf(peter.address)).to.eq(daiAmount);
                expect(await mockDAI.balanceOf(john.address)).to.eq(daiAmount);
                expect(await mockDAI.balanceOf(steve.address)).to.eq(daiAmount);
            });
            
            it("Should set the duration of staking", async () => {
                expect(await infinitumFarm.duration()).to.eq(1000)
            })
        })

        describe("Staking functionality", async() => {
            })

        describe("Unstaking functionality", function () {
            
            });
        })

            
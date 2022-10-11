import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { network, deployments, ethers } from "hardhat";
import { developmentChains } from "../helper-hardhat-config";
import { BigNumber } from "ethers";
import { InfinitumToken, MockERC20, InfinitumFarm  } from "../typechain-types"


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
            await infinitumToken.mint(infinitumFarm.address, infinitumAmountInitFarm)
            

            // Owner sends 1 000 000 Dai tokens to staking contract-------

            // // Reward user earns per second
            
            // }

            let modifyRewardTx = await infinitumFarm.modifyRewardAmount(1000);
            await modifyRewardTx.wait();
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
             })
             it("Balance of INFT tokens in farm should be greater than reward amount", async () => {
                let inftTokenFarmBal = await infinitumToken.balanceOf(infinitumFarm.address);
                console.log(infinitumAmountInitFarm.toString());
             }) 
        })

        // describe("Staking functionality", async() => {
        //     })

        // describe("Unstaking functionality", function () {
            
        //     });
 })
    

            
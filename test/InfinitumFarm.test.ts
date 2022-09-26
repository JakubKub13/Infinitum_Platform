import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { assert, expect } from "chai";
import { network, deployments, ethers } from "hardhat";
import { developmentChains, networkConfig } from "../helper-hardhat-config";
import { BigNumber } from "ethers";
import { solidity } from "ethereum-waffle"
import { InfinitasFactory, InfinitumToken , Lottery, MockERC20, InfinitumFarm  } from "../typechain-types"
import { time } from "@openzeppelin/test-helpers"


!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Infinitum Farm testing", function() {
        let accounts: SignerWithAddress[];
        let  owner: SignerWithAddress;
        let jacob: SignerWithAddress;
        let martin: SignerWithAddress;
        let peter: SignerWithAddress;
        let john: SignerWithAddress;
        let infinitumFarm: InfinitumFarm;
        let mockDAI: MockERC20;
        let infinitumToken: InfinitumToken;
        let infinitasFactory: InfinitasFactory
        let lottery: Lottery;

        const daiAmount: BigNumber = ethers.utils.parseEther("25000");
        const nftPrice: BigNumber = ethers.utils.parseEther("1");

        beforeEach(async () => {
            [owner, jacob, martin, peter, john ] = await ethers.getSigners();
            await deployments.fixture(["all"]);
            infinitumFarm = await ethers.getContract("InfinitumFarm");
            mockDAI = await ethers.getContract("MockERC20");
            infinitumToken = await ethers.getContract("InfinitumToken");
            infinitasFactory = await ethers.getContract("InfinitasFactory");
            lottery = await ethers.getContract("Lottery")


            // DAI TRANSFERS---------------
        })

        
    })
import { ethers, network } from "hardhat";
import { expect } from "chai";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { networkConfig } from "../helper-hardhat-config";

describe("Lottery contract", function () {
    let owner: SignerWithAddress;
    let jacob: SignerWithAddress;
    let martin: SignerWithAddress;
    let lottery: Contract;
    let infinitasFactory: Contract;
    let infinitumToken: Contract;
    let mockLinkToken: Contract;

    beforeEach(async () => {
        const Lottery = await ethers.getContractFactory("Lottery");
        const InfinitasFactory = await ethers.getContractFactory("InfinitasFactory");
        const InfinitumToken = await ethers.getContractFactory("InfinitumToken");
        const MockLinkToken = await ethers.getContractFactory("MockERC20");
        mockLinkToken = await MockLinkToken.deploy("MockLink", "mLINK");
        infinitasFactory = await InfinitasFactory.deploy();
        infinitumToken = await InfinitumToken.deploy();
        [owner, jacob, martin] = await ethers.getSigners();
        await mockLinkToken.mint(owner.address, ethers.utils.parseEther("9999"));

        let lotteryParams = [
            infinitasFactory.address,
            infinitumToken.address,
            mockLinkToken.address,
            networkConfig[network.config.chainId!]["vrfCoordinatorV2"],


        ]
    })
})
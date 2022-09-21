import { ethers } from "hardhat";
import { expect } from "chai";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("Infinitum token", () => {
    let owner: SignerWithAddress;
    let jacob: SignerWithAddress;
    let martin: SignerWithAddress;

    let infinitumToken: Contract;
    let differentContract: Contract;

    beforeEach(async () => {
        const InfinitumToken = await ethers.getContractFactory("InfinitumToken");
        const DifferentContract = await ethers.getContractFactory("InfinitumToken");
        [owner, jacob, martin] = await ethers.getSigners();
        infinitumToken = await InfinitumToken.deploy();
        differentContract = await DifferentContract.deploy();
    });

    describe("Initialization", async() => {
        it("Should deploy without errors", async () => {
            expect(infinitumToken).to.be.ok;
        });
    })
})
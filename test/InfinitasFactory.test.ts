import { ethers } from "hardhat";
import chai, { expect } from "chai";
import { Contract } from "ethers";
import { solidity } from "ethereum-waffle";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"

chai.use(solidity)

describe("Infinitas Factory contract", function () {
    let owner: SignerWithAddress;
    let jacob: SignerWithAddress;
    let martin: SignerWithAddress;
    let infinitasFactory: Contract;

    beforeEach(async () => {
        const InfinitasFactory = await ethers.getContractFactory("InfinitasFactory");
        [owner, jacob, martin] = await ethers.getSigners();
        infinitasFactory = await InfinitasFactory.deploy();
        let minter = await infinitasFactory.MINTER_ROLE();
        await infinitasFactory.grantRole(minter, owner.address);
    });
})
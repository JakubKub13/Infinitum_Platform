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

    describe("Initialize", async () => {
        it("Should deploy without errors", async () => {
            expect(infinitasFactory).to.be.ok;
        });

        it("Should have correct name", async () => {
            expect(await infinitasFactory.name()).to.eq("Infinitas");
        });

        it("Should track tokens", async () => {
            await infinitasFactory.safeMint(owner.address);
            await infinitasFactory.safeMint(owner.address);
            expect(await infinitasFactory.getTotalSupply()).to.eq(2);
        });

        it("Should be able to enumerate", async () => {
            await infinitasFactory.safeMint(owner.address);
            await infinitasFactory.safeMint(owner.address);
            await infinitasFactory.safeMint(owner.address);
            await infinitasFactory.safeMint(owner.address);
            await infinitasFactory.safeMint(owner.address);
            await infinitasFactory.transferFrom(owner.address, jacob.address, 4);
            let res = await infinitasFactory.tokenOfOwnerByIndex(jacob.address, 0);
            expect(res).to.equal(4);
            res = await infinitasFactory.balanceOf(jacob.address);
            expect(res).to.eq(1);
            res = await infinitasFactory.balanceOf(owner.address);
            expect(res).to.equal(4)
        })
    });
});
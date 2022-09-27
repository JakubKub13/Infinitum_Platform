import { ethers } from "hardhat";
import { expect } from "chai";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import exp from "constants";

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

    describe("Initialization", async () => {
        it("Should deploy without errors", async () => {
            expect(infinitumToken).to.be.ok;
        });

        it("Should have correct name", async () => {
            expect(await infinitumToken.name()).to.equal("Infinitum token");
        });

        it("Should have no supply after deployment", async () => {
            expect(await infinitumToken.totalSupply()).to.eq(0);
        });
    });

    describe("Test minter role", async () => {
        it("Should grant owner role to the deployer", async () => {
            let minter = await infinitumToken.MINTER_ROLE();
            await infinitumToken.grantRole(minter, owner.address);
            expect(await infinitumToken.hasRole(minter, owner.address)).to.eq(true)
        });
            
        it("Should mint token only when called by the owner", async () => {
            let minter = await infinitumToken.MINTER_ROLE();
            await infinitumToken.grantRole(minter, owner.address);
            expect(await infinitumToken.balanceOf(owner.address)).to.equal(0);
            await infinitumToken.mint(owner.address, 50);
            expect(await infinitumToken.totalSupply()).to.eq(50);
            expect(await infinitumToken.balanceOf(owner.address)).to.eq(50);
        });

        it("Should revert when non-minter tries to mint tokens", async () => {
            await expect(infinitumToken.connect(jacob).mint(martin.address, 20)).to.be.revertedWith("InfinitumToken: Caller is not the minter");
        });

        it("Should revert transfer from non-admin account", async () => {
            let minter = await infinitumToken.MINTER_ROLE();
            await expect(infinitumToken.connect(jacob).mint(martin.address, 88)).to.be.revertedWith("InfinitumToken: Caller is not the minter");
        });

        it("Should revert transfer from non default-admin" ,async () => {
            let minter = await infinitumToken.MINTER_ROLE();
            expect(await infinitumToken.grantRole(minter, martin.address)).to.be.ok;
            await expect( infinitumToken.connect(jacob).grantRole(minter, martin.address)).to.be.reverted;
        });
    });
});
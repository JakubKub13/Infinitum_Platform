import { pTokens } from 'ptokens'
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { assert, expect } from "chai";
import { network, deployments, ethers } from "hardhat";
import { developmentChains, networkConfig } from "../helper-hardhat-config";
import { InfinitasFactory, InfinitumToken ,Lottery, VRFCoordinatorV2Mock, MockERC20 } from "../typechain-types"

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Lottery testing", function() {
        let accounts: SignerWithAddress[];
        let  owner: SignerWithAddress;
        let jacob: SignerWithAddress;
        let martin: SignerWithAddress;

        let lottery: Lottery;
        let infinitasFactory: InfinitasFactory;
        let infinitumToken: InfinitumToken;
        let mockLink: MockERC20;
        let vrfCoordinatorV2Mock: VRFCoordinatorV2Mock;

        beforeEach(async () => {
            accounts = await ethers.getSigners();
            owner = accounts[0];
            jacob = accounts[1];
            martin = accounts[2];
            await deployments.fixture(["all"]);
            vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
            mockLink = await ethers.getContract("MockERC20");
            infinitumToken = await ethers.getContract("InfinitumToken");
            infinitasFactory = await ethers.getContract("InfinitasFactory");
            lottery = await ethers.getContract("Lottery");
        });

        describe("Initialization", async() => {
            it("Should deploy without errors", async () => {
                expect(lottery).to.be.ok
                expect(infinitasFactory).to.be.ok
                expect(infinitumToken).to.be.ok
                expect(vrfCoordinatorV2Mock).to.be.ok
                expect(mockLink).to.be.ok
            });

            it("Should track tokenIds", async function () {
                let minter = await infinitasFactory.MINTER_ROLE()
                await infinitasFactory.grantRole(minter, owner.address)
                await infinitasFactory.safeMint(jacob.address)
                await infinitasFactory.safeMint(jacob.address)
                let res = await infinitasFactory.getTotalSupply()
                expect(await infinitasFactory.getTotalSupply()).to.eq(2)
            })
        });
    })
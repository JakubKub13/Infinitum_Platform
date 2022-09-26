import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { assert, expect } from "chai";
import { network, deployments, ethers } from "hardhat";
import { developmentChains, networkConfig } from "../helper-hardhat-config";
import { InfinitasFactory, InfinitumToken ,Lottery, VRFCoordinatorV2Mock  } from "../typechain-types"

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
        let vrfCoordinatorV2Mock: VRFCoordinatorV2Mock;

        beforeEach(async () => {
            accounts = await ethers.getSigners();
            owner = accounts[0];
            jacob = accounts[1];
            martin = accounts[2];
            await deployments.fixture(["all"]);
            vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
            infinitumToken = await ethers.getContract("InfinitumToken");
            infinitasFactory = await ethers.getContract("InfinitasFactory");
            lottery = await ethers.getContract("Lottery");
        });

        describe("Initialization", async () => {
            it("Should deploy without errors", async () => {
                expect(lottery).to.be.ok
                expect(infinitasFactory).to.be.ok
                expect(infinitumToken).to.be.ok
                expect(vrfCoordinatorV2Mock).to.be.ok
            });

            it("Should track tokenIds", async function () {
                let minter = await infinitasFactory.MINTER_ROLE()
                await infinitasFactory.grantRole(minter, owner.address)
                await infinitasFactory.safeMint(jacob.address)
                await infinitasFactory.safeMint(jacob.address)
                let res = await infinitasFactory.getTotalSupply()
                expect(await infinitasFactory.getTotalSupply()).to.eq(2)
            });
        });

        describe("Testing Events", function () {
            beforeEach(async () => {
                let minter = await infinitasFactory.MINTER_ROLE();
                await Promise.all([
                    infinitasFactory.grantRole(minter, owner.address),
                    infinitumToken.grantRole(minter, owner.address),
                    infinitumToken.mint(owner.address, ethers.utils.parseEther("999")),
                    infinitasFactory.safeMint(jacob.address),
                    infinitasFactory.safeMint(martin.address),
                    infinitasFactory.safeMint(jacob.address),
                    infinitasFactory.safeMint(martin.address),
                    infinitasFactory.safeMint(jacob.address),
                    infinitasFactory.safeMint(martin.address),
                    infinitumToken.approve(lottery.address, ethers.utils.parseEther("25")),
                    lottery.addToLotteryPool(owner.address, ethers.utils.parseEther("25"))
                ])
            })

            it("Should emit LotteryStart", async () => {
                await lottery.getWinningNumber();
                expect(await lottery.getWinningNumber()).to.calledImmediatelyAfter(lottery, "LotteryStart")
            })
        })
    });
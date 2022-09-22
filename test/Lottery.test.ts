import { ethers } from "hardhat";
import { expect } from "chai";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Sign } from "crypto";

describe("Lottery contract", function () {
    let owner: SignerWithAddress;
    let jacob: SignerWithAddress;
    let martin: SignerWithAddress;
    let lottery: Contract;
    let infinitasFactory: Contract;
    let infinitumToken: Contract;
    let mockLinkToken: Contract;
})
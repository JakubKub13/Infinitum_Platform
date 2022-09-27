import { expect, use } from "chai";
import { InfinitasFactory, InfinitumToken , Lottery, MockERC20, InfinitumFarm  } from "../typechain-types"
import { deployContract, loadFixture, MockProvider, solidity } from "ethereum-waffle";
import { Wallet, utils, BigNumber } from "ethers";
import { developmentChains, networkConfig } from "../helper-hardhat-config";
import { network, deployments, ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
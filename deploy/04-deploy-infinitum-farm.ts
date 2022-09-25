import { Contract } from "ethers";
import { getNamedAccounts, deployments, network, run } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { NetworkConfig, developmentChains, VERIFICATION_BLOCK_CONFIRMATIONS } from "../helper-hardhat-config";
import { InfinitasFactory, InfinitumToken ,Lottery,   } from "../typechain-types"
import verify from "../verify";

const deployInfinitumFarm: DeployFunction = async function (
    hre: HardhatRuntimeEnvironment
) {
    const { deployments, getNamedAccounts, network, ethers } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;
    let daiStablecoin: Contract;
    let infinitumToken: InfinitumToken;
    let infinitasFactory: InfinitasFactory;
    let lottery: Lottery;

    if(chainId == 31337) {
        
    }


}
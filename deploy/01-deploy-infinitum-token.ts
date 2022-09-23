import { getNamedAccounts, deployments, network, run } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { NetworkConfig, developmentChains, VERIFICATION_BLOCK_CONFIRMATIONS } from "../helper-hardhat-config";
import verify from "../verify";

const deployINFTtoken: DeployFunction = async function (
    hre: HardhatRuntimeEnvironment
) {
    const { deployments, getNamedAccounts, network, ethers } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;
    const args = []
    
    log("Deploying Infinitum token.......");
    const infinitumToken = await deploy("InfinitumToken", {
        from: deployer,
        log: true,
        args: args
    })
    log("Infinitum token Deployed!");
    log("----------------------------------------------");
    log("You are deploying to a local network, you will need a local network running to interact");
    log("Please run npx hardhat console --network localhost to interact with deployed smart contracts");
    log("-----------------------------------------------");

    // Verify the deployment
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying......")
        await verify(infinitumToken.address, args)
    }
}

export default deployINFTtoken
deployINFTtoken.tags = ["all", "token"]
    
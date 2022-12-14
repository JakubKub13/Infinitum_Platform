import { BigNumber } from "ethers";
import { getNamedAccounts, deployments, network, ethers } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deployMocks: DeployFunction = async function (
    hre: HardhatRuntimeEnvironment
) {
    const { deployments, getNamedAccounts, network } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId

    if (chainId == 31337) {
        log("Local network detected! Deploying mocks.......")
        await deploy("MockERC20", {
            from: deployer,
            log: true,
            args: ["DAI token", "DAI"]
        })
        
        

        log("Mocks Deployed!")
        log("----------------------------------------------")

        log("You are deploying to a local network, you will need a local network running to interact")
        log("Please run npx hardhat console --network localhost to interact with deployed smart contracts")
        log("-----------------------------------------------")
    }
}

export default deployMocks
deployMocks.tags = ["all", "mocks"]
import { getNamedAccounts, deployments, network, run } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { networkConfig, developmentChains, VERIFICATION_BLOCK_CONFIRMATION, networkConfig } from "../helper-hardhat-config";
import verify from "../verify";

const FUND_AMOUNT = "1000000000000000000000";

const deployLottery: DeployFunction = async function (
    hre: HardhatRuntimeEnvironment
) {
    const { deployments, getNamedAccounts, network, ethers } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;
    let infinitumTokenAddress, infinitasFactoryAddress, vrfCoordinatorV2Address, subscriptionId;

    if(chainId == 31337) {
        // create VRFV2 subscription
        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
        const transactionResponse = await vrfCoordinatorV2Mock.createSubscription();
        const transactionReceipt = await transactionResponse.wait();
        subscriptionId = transactionReceipt.events[0].args.subId;
        // Fund subscription
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT);
        const infinitumToken = await ethers.getContract("InfinitumToken");
        infinitumTokenAddress = infinitumToken.address;
        const infinitasFactory = await ethers.getContract("InfinitasFactory");
        infinitasFactoryAddress = infinitasFactory.address;
    } else {
        infinitumTokenAddress = networkConfig[network.config.chainId!][""]
        infinitasFactoryAddress = networkConfig[network.config.chainId!][""]
        vrfCoordinatorV2Address = networkConfig[network.config.chainId!]["vrfCoordinatorV2"];
        subscriptionId = networkConfig[network.config.chainId!]["subscriptionId"];
    }
    const waitBlockConfirmation = developmentChains.includes(network.name) ? 1 : VERIFICATION_BLOCK_CONFIRMATION
    log("----------------------------------------------------------------")

    const args: any[] = [
        infinitasFactoryAddress,
        infinitumTokenAddress,
        vrfCoordinatorV2Address,
        networkConfig[network.config.chainId!]["gasLane"],
        networkConfig[network.config.chainId!]["subscriptionId"],
        networkConfig[network.config.chainId!]["callbackGasLimit"]
    ]

    const lottery = await deploy("Lottery", {
        from: deployer,
        log: true,
        args: args,
        waitConfirmation: waitBlockConfirmation
    })

    // Verify the deployment
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying......")
        await verify(lottery.address, args)
    }
}

export default deployLottery
deployLottery.tags = ["all", "lottery"]
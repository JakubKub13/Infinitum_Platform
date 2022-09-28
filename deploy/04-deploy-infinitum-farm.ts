import { BigNumber } from "ethers";
import { getNamedAccounts, deployments, network, run } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { networkConfig, developmentChains, VERIFICATION_BLOCK_CONFIRMATION } from "../helper-hardhat-config";
import { InfinitasFactory, InfinitumToken ,Lottery,  MockERC20 } from "../typechain-types"
import verify from "../verify";

const deployInfinitumFarm: DeployFunction = async function (
    hre: HardhatRuntimeEnvironment
) {
    const { deployments, getNamedAccounts, network, ethers } = hre;
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;
    let daiStablecoinAddr: MockERC20;
    let infinitumTokenAddr: InfinitumToken;
    let infinitasFactoryAddr: InfinitasFactory;
  
    const nftPrice: BigNumber = ethers.utils.parseEther("1");

    if(chainId == 31337) {
        const daiMock = await ethers.getContract("MockERC20");
        daiStablecoinAddr = daiMock.address;
        const infinitumToken = await ethers.getContract("InfinitumToken");
        infinitumTokenAddr = infinitumToken.address;
        const infinitasFactory = await ethers.getContract("InfinitasFactory");
        infinitasFactoryAddr = infinitasFactory.address;
       
        const lottery = await ethers.getContract("Lottery");
        lotteryAddr = lottery.address;
        

    } else {
        daiStablecoinAddr = networkConfig[network.config.chainId![""]]
        infinitumTokenAddress = networkConfig[network.config.chainId!][""]
        infinitasFactoryAddress = networkConfig[network.config.chainId!][""]
    }
    const waitBlockConfirmation = developmentChains.includes(network.name) ? 1 : VERIFICATION_BLOCK_CONFIRMATION
    log("-------------------------------------------------------------------------------------------")

    const args: any[] = [
        daiStablecoinAddr,
        infinitumTokenAddr,
        infinitasFactoryAddr,
        lotteryAddr,
        nftPrice
    ] 

    const infinitumFarm = await deploy("InfinitumFarm", {
        from: deployer,
        log: true,
        args: args,
        waitConfirmation: waitBlockConfirmation
    })

    // Verify the deployment
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying......")
        await verify(infinitumFarm.address, args)
    }
}

export default deployInfinitumFarm
deployInfinitumFarm.tags = ["all", "farm"]
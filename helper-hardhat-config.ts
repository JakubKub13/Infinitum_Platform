export interface networkConfigItem {
    name?: string
    subscriptionId?: string
    gasLane?: string
    callbackGasLimit?: string
    vrfCoordinatorV2: string
    infinitumTokenAddress: string
    infinitasFactoryAddress: string
    daiStableCoinAddress: string
}

export interface networkConfigInfo {
    [key: number]: networkConfigItem
}

export const networkConfig: networkConfigInfo = {
    31337: {
        name: "localhost",
        subscriptionId: "2111",
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        callbackGasLimit: "500000"
    },
    5: {
        name: "goerli",
        
        infinitumTokenAddress: "0x62802Bc90C72376020ad1edaCa0F3Ee7aDD07ac2",
        daiStableCoinAddress: "0x9D233A907E065855D2A9c7d4B552ea27fB2E5a36",
        infinitumFarm: "0xDf490312C83108F09c4F11B00b49bc24491d1903",
    },
    //1: {
    //    name: "mainnet",
    //    subscriptionId: "",
    //    gasLane: "",
    //    callbackGasLimit: "500000",
    //    vrfCoordinatorV2: ""
    //},
}

export const developmentChains = ["hardhat", "localhost"]
export const VERIFICATION_BLOCK_CONFIRMATION = 6
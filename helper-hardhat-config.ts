export interface networkConfigItem {
    name?: string
    subscriptionId?: string
    gasLane?: string
    callbackGasLimit?: string
    vrfCoordinatorV2: string
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
        subscriptionId: "2111",
        gasLane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        callbackGasLimit: "500000",
        vrfCoordinatorV2: "0x2Ca8E0C643bDe4C2E08ab1fA0da3401AdAD7734D"
    }
    1: {
        name: "mainnet",
        subscriptionId: "",
        gasLane: "",
        callbackGasLimit: "500000",
        vrfCoordinatorV2: ""
    },



}
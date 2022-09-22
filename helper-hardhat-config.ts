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
        subscriptionId: "",
        gasLane: "",
        callbackGasLimit: "500000"
    },
    5: {
        name: "goerli",
        subscriptionId: "",
        gasLane: "",
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
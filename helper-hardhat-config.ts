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
    4: {
        name: "rinkeby",
        subscriptionId: "",
        gasLane: "",
        callbackGasLimit: "500000"
    },
    1: {
        name: "mainnet",
    }


}
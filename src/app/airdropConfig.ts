import { optimismSepolia } from "viem/chains";

export const airdropConfigs = {
    [optimismSepolia.id]: {
        ETHx_address: "0x0043d7c85c8b96a49a72a92c0b48cdc4720437d7",
        vestingSchedulerV2_address: "0xAb6c6b7D7033e0cb8C693ACFd471614313eAE342",
        merkleDistributorFactory_address: "0x3a9cc7a0c01ccbaf1c6c46d67359025ad7af1416",
    }
} as const;
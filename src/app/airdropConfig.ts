import { optimismSepolia } from "viem/chains";

export const airdropConfigs = {
    [optimismSepolia.id]: {
        ETHx_address: "0x0043d7c85c8b96a49a72a92c0b48cdc4720437d7",
        vestingSchedulerV2_address: "0x908D8B2A9eDCE5ef2f449e9100b09b8446B9664D",
        merkleDistributorFactory_address: "0xC518eAADf1Ae753F8FB567Cc7455B08Bd1009899",
    }
} as const;
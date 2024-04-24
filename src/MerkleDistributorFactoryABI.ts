export const MerkleDistributorFactoryABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "contract MerkleDistributor",
        name: "distributor",
        type: "address",
      },
    ],
    name: "Created",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "contract ISuperToken",
        name: "superToken",
        type: "address",
      },
      { internalType: "bytes32", name: "merkleRoot", type: "bytes32" },
      { internalType: "address", name: "treasury", type: "address" },
      {
        internalType: "contract IVestingSchedulerV2",
        name: "vestingScheduler",
        type: "address",
      },
    ],
    name: "create",
    outputs: [
      {
        internalType: "contract MerkleDistributor",
        name: "distributor",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
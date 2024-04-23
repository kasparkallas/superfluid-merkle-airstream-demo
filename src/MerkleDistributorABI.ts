export const MerkleDistributorABI = [
  {
    type: "constructor",
    inputs: [
      { name: "token_", type: "address", internalType: "address" },
      { name: "merkleRoot_", type: "bytes32", internalType: "bytes32" },
      { name: "_treasury", type: "address", internalType: "address" },
      {
        name: "vestingScheduler_",
        type: "address",
        internalType: "contract IVestingSchedulerV2",
      },
    ],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "ONE_YEAR_IN_SECONDS",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "activationTimestamp",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "airdropTreasury",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "claim",
    inputs: [
      { name: "index", type: "uint256", internalType: "uint256" },
      { name: "account", type: "address", internalType: "address" },
      { name: "amount", type: "uint256", internalType: "uint256" },
      { name: "merkleProof", type: "bytes32[]", internalType: "bytes32[]" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "clawBack",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "isActive",
    inputs: [],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "isClaimed",
    inputs: [{ name: "index", type: "uint256", internalType: "uint256" }],
    outputs: [{ name: "", type: "bool", internalType: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "merkleRoot",
    inputs: [],
    outputs: [{ name: "", type: "bytes32", internalType: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "token",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "vestingScheduler",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "address",
        internalType: "contract IVestingSchedulerV2",
      },
    ],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "Claimed",
    inputs: [
      {
        name: "index",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "account",
        type: "address",
        indexed: false,
        internalType: "address",
      },
      {
        name: "amount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
  {
    type: "event",
    name: "Finalised",
    inputs: [
      {
        name: "calledBy",
        type: "address",
        indexed: true,
        internalType: "address",
      },
      {
        name: "timestamp",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
      {
        name: "unclaimedAmount",
        type: "uint256",
        indexed: false,
        internalType: "uint256",
      },
    ],
    anonymous: false,
  },
] as const;
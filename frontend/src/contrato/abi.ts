export const TEST_RISK_CONTRACT_ABI = [
  {
    type: "function",
    name: "normalAction",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: []
  },
  {
    type: "function",
    name: "suspiciousAction",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: []
  },
  {
    type: "function",
    name: "highImpactSimulation",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: []
  },
  {
    type: "function",
    name: "recordApprovalObservation",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "amount",
        type: "uint256"
      }
    ],
    outputs: []
  },
  {
    type: "function",
    name: "recordApprovalRevoked",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: []
  },
  {
    type: "function",
    name: "getUserState",
    stateMutability: "view",
    inputs: [
      {
        name: "user",
        type: "address"
      }
    ],
    outputs: [
      {
        name: "interactions",
        type: "uint256"
      },
      {
        name: "tokenAllowance",
        type: "uint256"
      }
    ]
  },
  {
    type: "event",
    name: "NormalAction",
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "user",
        type: "address"
      },
      {
        indexed: false,
        name: "timestamp",
        type: "uint256"
      },
      {
        indexed: false,
        name: "interactionNumber",
        type: "uint256"
      }
    ]
  },
  {
    type: "event",
    name: "SuspiciousAction",
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "user",
        type: "address"
      },
      {
        indexed: false,
        name: "timestamp",
        type: "uint256"
      },
      {
        indexed: true,
        name: "marker",
        type: "bytes32"
      }
    ]
  },
  {
    type: "event",
    name: "HighImpactSimulation",
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "user",
        type: "address"
      },
      {
        indexed: false,
        name: "timestamp",
        type: "uint256"
      },
      {
        indexed: false,
        name: "simulationLevel",
        type: "uint256"
      }
    ]
  },
  {
    type: "event",
    name: "ApprovalObserved",
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "user",
        type: "address"
      },
      {
        indexed: true,
        name: "token",
        type: "address"
      },
      {
        indexed: true,
        name: "spender",
        type: "address"
      },
      {
        indexed: false,
        name: "amount",
        type: "uint256"
      },
      {
        indexed: false,
        name: "timestamp",
        type: "uint256"
      }
    ]
  },
  {
    type: "event",
    name: "ApprovalRevoked",
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "user",
        type: "address"
      },
      {
        indexed: true,
        name: "token",
        type: "address"
      },
      {
        indexed: true,
        name: "spender",
        type: "address"
      },
      {
        indexed: false,
        name: "timestamp",
        type: "uint256"
      }
    ]
  }
] as const;

export const TEST_RISK_TOKEN_ABI = [
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "spender",
        type: "address"
      },
      {
        name: "value",
        type: "uint256"
      }
    ],
    outputs: [
      {
        name: "",
        type: "bool"
      }
    ]
  },
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      {
        name: "owner",
        type: "address"
      },
      {
        name: "spender",
        type: "address"
      }
    ],
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ]
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [
      {
        name: "account",
        type: "address"
      }
    ],
    outputs: [
      {
        name: "",
        type: "uint256"
      }
    ]
  },
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "to",
        type: "address"
      },
      {
        name: "value",
        type: "uint256"
      }
    ],
    outputs: [
      {
        name: "",
        type: "bool"
      }
    ]
  }
] as const;

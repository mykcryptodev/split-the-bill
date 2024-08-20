export const splitItAbi = [
  {
      "inputs": [
          {
              "internalType": "contract IERC20",
              "name": "_usdc",
              "type": "address"
          }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "target",
              "type": "address"
          }
      ],
      "name": "AddressEmptyCode",
      "type": "error"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "account",
              "type": "address"
          }
      ],
      "name": "AddressInsufficientBalance",
      "type": "error"
  },
  {
      "inputs": [],
      "name": "FailedInnerCall",
      "type": "error"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "token",
              "type": "address"
          }
      ],
      "name": "SafeERC20FailedOperation",
      "type": "error"
  },
  {
      "anonymous": false,
      "inputs": [
          {
              "indexed": true,
              "internalType": "uint256",
              "name": "splitId",
              "type": "uint256"
          },
          {
              "indexed": true,
              "internalType": "address",
              "name": "participant",
              "type": "address"
          },
          {
              "indexed": false,
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
          }
      ],
      "name": "Paid",
      "type": "event"
  },
  {
      "anonymous": false,
      "inputs": [
          {
              "indexed": true,
              "internalType": "uint256",
              "name": "splitId",
              "type": "uint256"
          },
          {
              "indexed": false,
              "internalType": "uint256",
              "name": "totalAmount",
              "type": "uint256"
          },
          {
              "indexed": false,
              "internalType": "uint256",
              "name": "amountPerPerson",
              "type": "uint256"
          }
      ],
      "name": "SplitCreated",
      "type": "event"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "_creator",
              "type": "address"
          },
          {
              "internalType": "uint256",
              "name": "_totalAmount",
              "type": "uint256"
          },
          {
              "internalType": "uint256",
              "name": "_amountPerPerson",
              "type": "uint256"
          }
      ],
      "name": "createSplit",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "uint256",
              "name": "_splitId",
              "type": "uint256"
          }
      ],
      "name": "getPayments",
      "outputs": [
          {
              "components": [
                  {
                      "internalType": "address",
                      "name": "payer",
                      "type": "address"
                  },
                  {
                      "internalType": "string",
                      "name": "name",
                      "type": "string"
                  },
                  {
                      "internalType": "string",
                      "name": "comment",
                      "type": "string"
                  }
              ],
              "internalType": "struct SplitIt.Payment[]",
              "name": "",
              "type": "tuple[]"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "uint256",
              "name": "_splitId",
              "type": "uint256"
          }
      ],
      "name": "getSplit",
      "outputs": [
          {
              "components": [
                  {
                      "internalType": "address",
                      "name": "creator",
                      "type": "address"
                  },
                  {
                      "internalType": "uint256",
                      "name": "totalAmount",
                      "type": "uint256"
                  },
                  {
                      "internalType": "uint256",
                      "name": "amountPerPerson",
                      "type": "uint256"
                  },
                  {
                      "internalType": "uint256",
                      "name": "totalPaid",
                      "type": "uint256"
                  }
              ],
              "internalType": "struct SplitIt.Split",
              "name": "",
              "type": "tuple"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "_address",
              "type": "address"
          }
      ],
      "name": "getSplitsByAddress",
      "outputs": [
          {
              "internalType": "uint256[]",
              "name": "",
              "type": "uint256[]"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "uint256",
              "name": "_splitId",
              "type": "uint256"
          },
          {
              "internalType": "address",
              "name": "_address",
              "type": "address"
          },
          {
              "internalType": "address",
              "name": "_fundedFrom",
              "type": "address"
          },
          {
              "internalType": "string",
              "name": "_name",
              "type": "string"
          },
          {
              "internalType": "string",
              "name": "_comment",
              "type": "string"
          }
      ],
      "name": "pay",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          },
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "name": "payments",
      "outputs": [
          {
              "internalType": "address",
              "name": "payer",
              "type": "address"
          },
          {
              "internalType": "string",
              "name": "name",
              "type": "string"
          },
          {
              "internalType": "string",
              "name": "comment",
              "type": "string"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "",
              "type": "address"
          },
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "name": "paymentsByAddress",
      "outputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "splitCounter",
      "outputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "name": "splits",
      "outputs": [
          {
              "internalType": "address",
              "name": "creator",
              "type": "address"
          },
          {
              "internalType": "uint256",
              "name": "totalAmount",
              "type": "uint256"
          },
          {
              "internalType": "uint256",
              "name": "amountPerPerson",
              "type": "uint256"
          },
          {
              "internalType": "uint256",
              "name": "totalPaid",
              "type": "uint256"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "",
              "type": "address"
          },
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "name": "splitsByAddress",
      "outputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "usdc",
      "outputs": [
          {
              "internalType": "contract IERC20",
              "name": "",
              "type": "address"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  }
] as const;
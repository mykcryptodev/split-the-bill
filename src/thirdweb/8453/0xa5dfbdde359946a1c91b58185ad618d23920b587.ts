import {
  type AbiParameterToPrimitiveType,
  type BaseTransactionOptions,
  prepareContractCall,
  prepareEvent,
  readContract,
} from "thirdweb";

/**
* Contract events
*/

/**
 * Represents the filters for the "Paid" event.
 */
export type PaidEventFilters = Partial<{
  splitId: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"uint256","name":"splitId","type":"uint256"}>
participant: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"address","name":"participant","type":"address"}>
}>;

/**
 * Creates an event object for the Paid event.
 * @param filters - Optional filters to apply to the event.
 * @returns The prepared event object.
 * @example
 * ```
 * import { getContractEvents } from "thirdweb";
 * import { paidEvent } from "TODO";
 * 
 * const events = await getContractEvents({
 * contract,
 * events: [
 *  paidEvent({
 *  splitId: ...,
 *  participant: ...,
 * })
 * ],
 * });
 * ```
 */ 
export function paidEvent(filters: PaidEventFilters = {}) {
  return prepareEvent({
    signature: "event Paid(uint256 indexed splitId, address indexed participant, uint256 amount, string comment, string name, uint256 timestamp)",
    filters,
  });
};
  

/**
 * Represents the filters for the "SplitCreated" event.
 */
export type SplitCreatedEventFilters = Partial<{
  splitId: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"uint256","name":"splitId","type":"uint256"}>
creator: AbiParameterToPrimitiveType<{"indexed":true,"internalType":"address","name":"creator","type":"address"}>
}>;

/**
 * Creates an event object for the SplitCreated event.
 * @param filters - Optional filters to apply to the event.
 * @returns The prepared event object.
 * @example
 * ```
 * import { getContractEvents } from "thirdweb";
 * import { splitCreatedEvent } from "TODO";
 * 
 * const events = await getContractEvents({
 * contract,
 * events: [
 *  splitCreatedEvent({
 *  splitId: ...,
 *  creator: ...,
 * })
 * ],
 * });
 * ```
 */ 
export function splitCreatedEvent(filters: SplitCreatedEventFilters = {}) {
  return prepareEvent({
    signature: "event SplitCreated(uint256 indexed splitId, address indexed creator, string creatorName, string billName, uint256 totalAmount, uint256 amountPerPerson)",
    filters,
  });
};
  

/**
* Contract read functions
*/

/**
 * Represents the parameters for the "getPayments" function.
 */
export type GetPaymentsParams = {
  splitId: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_splitId","type":"uint256"}>
};

/**
 * Calls the "getPayments" function on the contract.
 * @param options - The options for the getPayments function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { getPayments } from "TODO";
 * 
 * const result = await getPayments({
 *  splitId: ...,
 * });
 * 
 * ```
 */
export async function getPayments(
  options: BaseTransactionOptions<GetPaymentsParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0xfe365199",
  [
    {
      "internalType": "uint256",
      "name": "_splitId",
      "type": "uint256"
    }
  ],
  [
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
        },
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "internalType": "struct SplitIt.Payment[]",
      "name": "",
      "type": "tuple[]"
    }
  ]
],
    params: [options.splitId]
  });
};


/**
 * Represents the parameters for the "getSplit" function.
 */
export type GetSplitParams = {
  splitId: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_splitId","type":"uint256"}>
};

/**
 * Calls the "getSplit" function on the contract.
 * @param options - The options for the getSplit function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { getSplit } from "TODO";
 * 
 * const result = await getSplit({
 *  splitId: ...,
 * });
 * 
 * ```
 */
export async function getSplit(
  options: BaseTransactionOptions<GetSplitParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x514a6810",
  [
    {
      "internalType": "uint256",
      "name": "_splitId",
      "type": "uint256"
    }
  ],
  [
    {
      "components": [
        {
          "internalType": "address",
          "name": "creator",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "creatorName",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "billName",
          "type": "string"
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
        },
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "internalType": "struct SplitIt.Split",
      "name": "",
      "type": "tuple"
    }
  ]
],
    params: [options.splitId]
  });
};


/**
 * Represents the parameters for the "getSplitIdsCreatedByAddress" function.
 */
export type GetSplitIdsCreatedByAddressParams = {
  address: AbiParameterToPrimitiveType<{"internalType":"address","name":"_address","type":"address"}>
};

/**
 * Calls the "getSplitIdsCreatedByAddress" function on the contract.
 * @param options - The options for the getSplitIdsCreatedByAddress function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { getSplitIdsCreatedByAddress } from "TODO";
 * 
 * const result = await getSplitIdsCreatedByAddress({
 *  address: ...,
 * });
 * 
 * ```
 */
export async function getSplitIdsCreatedByAddress(
  options: BaseTransactionOptions<GetSplitIdsCreatedByAddressParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0xe84c83d8",
  [
    {
      "internalType": "address",
      "name": "_address",
      "type": "address"
    }
  ],
  [
    {
      "internalType": "uint256[]",
      "name": "",
      "type": "uint256[]"
    }
  ]
],
    params: [options.address]
  });
};


/**
 * Represents the parameters for the "getSplitIdsPaidByAddress" function.
 */
export type GetSplitIdsPaidByAddressParams = {
  address: AbiParameterToPrimitiveType<{"internalType":"address","name":"_address","type":"address"}>
};

/**
 * Calls the "getSplitIdsPaidByAddress" function on the contract.
 * @param options - The options for the getSplitIdsPaidByAddress function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { getSplitIdsPaidByAddress } from "TODO";
 * 
 * const result = await getSplitIdsPaidByAddress({
 *  address: ...,
 * });
 * 
 * ```
 */
export async function getSplitIdsPaidByAddress(
  options: BaseTransactionOptions<GetSplitIdsPaidByAddressParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x674ec14f",
  [
    {
      "internalType": "address",
      "name": "_address",
      "type": "address"
    }
  ],
  [
    {
      "internalType": "uint256[]",
      "name": "",
      "type": "uint256[]"
    }
  ]
],
    params: [options.address]
  });
};


/**
 * Represents the parameters for the "isSplitPaid" function.
 */
export type IsSplitPaidParams = {
  splitId: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_splitId","type":"uint256"}>
};

/**
 * Calls the "isSplitPaid" function on the contract.
 * @param options - The options for the isSplitPaid function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { isSplitPaid } from "TODO";
 * 
 * const result = await isSplitPaid({
 *  splitId: ...,
 * });
 * 
 * ```
 */
export async function isSplitPaid(
  options: BaseTransactionOptions<IsSplitPaidParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x4e7db005",
  [
    {
      "internalType": "uint256",
      "name": "_splitId",
      "type": "uint256"
    }
  ],
  [
    {
      "internalType": "bool",
      "name": "",
      "type": "bool"
    }
  ]
],
    params: [options.splitId]
  });
};


/**
 * Represents the parameters for the "payments" function.
 */
export type PaymentsParams = {
  arg_0: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"","type":"uint256"}>
arg_1: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"","type":"uint256"}>
};

/**
 * Calls the "payments" function on the contract.
 * @param options - The options for the payments function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { payments } from "TODO";
 * 
 * const result = await payments({
 *  arg_0: ...,
 *  arg_1: ...,
 * });
 * 
 * ```
 */
export async function payments(
  options: BaseTransactionOptions<PaymentsParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x2655bd73",
  [
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
  [
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
    },
    {
      "internalType": "uint256",
      "name": "timestamp",
      "type": "uint256"
    }
  ]
],
    params: [options.arg_0, options.arg_1]
  });
};


/**
 * Represents the parameters for the "paymentsByAddress" function.
 */
export type PaymentsByAddressParams = {
  arg_0: AbiParameterToPrimitiveType<{"internalType":"address","name":"","type":"address"}>
arg_1: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"","type":"uint256"}>
};

/**
 * Calls the "paymentsByAddress" function on the contract.
 * @param options - The options for the paymentsByAddress function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { paymentsByAddress } from "TODO";
 * 
 * const result = await paymentsByAddress({
 *  arg_0: ...,
 *  arg_1: ...,
 * });
 * 
 * ```
 */
export async function paymentsByAddress(
  options: BaseTransactionOptions<PaymentsByAddressParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x8601a96d",
  [
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
  [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ]
],
    params: [options.arg_0, options.arg_1]
  });
};




/**
 * Calls the "splitCounter" function on the contract.
 * @param options - The options for the splitCounter function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { splitCounter } from "TODO";
 * 
 * const result = await splitCounter();
 * 
 * ```
 */
export async function splitCounter(
  options: BaseTransactionOptions
) {
  return readContract({
    contract: options.contract,
    method: [
  "0xc854a85d",
  [],
  [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ]
],
    params: []
  });
};


/**
 * Represents the parameters for the "splitIdsByAddress" function.
 */
export type SplitIdsByAddressParams = {
  arg_0: AbiParameterToPrimitiveType<{"internalType":"address","name":"","type":"address"}>
arg_1: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"","type":"uint256"}>
};

/**
 * Calls the "splitIdsByAddress" function on the contract.
 * @param options - The options for the splitIdsByAddress function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { splitIdsByAddress } from "TODO";
 * 
 * const result = await splitIdsByAddress({
 *  arg_0: ...,
 *  arg_1: ...,
 * });
 * 
 * ```
 */
export async function splitIdsByAddress(
  options: BaseTransactionOptions<SplitIdsByAddressParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x60c0ac3f",
  [
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
  [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ]
],
    params: [options.arg_0, options.arg_1]
  });
};


/**
 * Represents the parameters for the "splits" function.
 */
export type SplitsParams = {
  arg_0: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"","type":"uint256"}>
};

/**
 * Calls the "splits" function on the contract.
 * @param options - The options for the splits function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { splits } from "TODO";
 * 
 * const result = await splits({
 *  arg_0: ...,
 * });
 * 
 * ```
 */
export async function splits(
  options: BaseTransactionOptions<SplitsParams>
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x884c3006",
  [
    {
      "internalType": "uint256",
      "name": "",
      "type": "uint256"
    }
  ],
  [
    {
      "internalType": "address",
      "name": "creator",
      "type": "address"
    },
    {
      "internalType": "string",
      "name": "creatorName",
      "type": "string"
    },
    {
      "internalType": "string",
      "name": "billName",
      "type": "string"
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
    },
    {
      "internalType": "uint256",
      "name": "timestamp",
      "type": "uint256"
    }
  ]
],
    params: [options.arg_0]
  });
};




/**
 * Calls the "usdc" function on the contract.
 * @param options - The options for the usdc function.
 * @returns The parsed result of the function call.
 * @example
 * ```
 * import { usdc } from "TODO";
 * 
 * const result = await usdc();
 * 
 * ```
 */
export async function usdc(
  options: BaseTransactionOptions
) {
  return readContract({
    contract: options.contract,
    method: [
  "0x3e413bee",
  [],
  [
    {
      "internalType": "contract IERC20",
      "name": "",
      "type": "address"
    }
  ]
],
    params: []
  });
};


/**
* Contract write functions
*/

/**
 * Represents the parameters for the "createSplit" function.
 */
export type CreateSplitParams = {
  creator: AbiParameterToPrimitiveType<{"internalType":"address","name":"_creator","type":"address"}>
creatorName: AbiParameterToPrimitiveType<{"internalType":"string","name":"_creatorName","type":"string"}>
billName: AbiParameterToPrimitiveType<{"internalType":"string","name":"_billName","type":"string"}>
totalAmount: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_totalAmount","type":"uint256"}>
amountPerPerson: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_amountPerPerson","type":"uint256"}>
};

/**
 * Calls the "createSplit" function on the contract.
 * @param options - The options for the "createSplit" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { createSplit } from "TODO";
 * 
 * const transaction = createSplit({
 *  creator: ...,
 *  creatorName: ...,
 *  billName: ...,
 *  totalAmount: ...,
 *  amountPerPerson: ...,
 * });
 * 
 * // Send the transaction
 * ...
 * 
 * ```
 */
export function createSplit(
  options: BaseTransactionOptions<CreateSplitParams>
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
  "0x2ac31193",
  [
    {
      "internalType": "address",
      "name": "_creator",
      "type": "address"
    },
    {
      "internalType": "string",
      "name": "_creatorName",
      "type": "string"
    },
    {
      "internalType": "string",
      "name": "_billName",
      "type": "string"
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
  []
],
    params: [options.creator, options.creatorName, options.billName, options.totalAmount, options.amountPerPerson]
  });
};


/**
 * Represents the parameters for the "pay" function.
 */
export type PayParams = {
  splitId: AbiParameterToPrimitiveType<{"internalType":"uint256","name":"_splitId","type":"uint256"}>
address: AbiParameterToPrimitiveType<{"internalType":"address","name":"_address","type":"address"}>
fundedFrom: AbiParameterToPrimitiveType<{"internalType":"address","name":"_fundedFrom","type":"address"}>
name: AbiParameterToPrimitiveType<{"internalType":"string","name":"_name","type":"string"}>
comment: AbiParameterToPrimitiveType<{"internalType":"string","name":"_comment","type":"string"}>
};

/**
 * Calls the "pay" function on the contract.
 * @param options - The options for the "pay" function.
 * @returns A prepared transaction object.
 * @example
 * ```
 * import { pay } from "TODO";
 * 
 * const transaction = pay({
 *  splitId: ...,
 *  address: ...,
 *  fundedFrom: ...,
 *  name: ...,
 *  comment: ...,
 * });
 * 
 * // Send the transaction
 * ...
 * 
 * ```
 */
export function pay(
  options: BaseTransactionOptions<PayParams>
) {
  return prepareContractCall({
    contract: options.contract,
    method: [
  "0x8f4ff32d",
  [
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
  []
],
    params: [options.splitId, options.address, options.fundedFrom, options.name, options.comment]
  });
};



import { SPLIT_IT_CONTRACT_ADDRESS } from "~/constants";
import { Split } from "~/types/split";

type Data = readonly [string, string, string, bigint, bigint, bigint] | undefined;

export const transformSplit = (data: Data) => {
  const split: Split = {
    creator: data?.[0] as `0x${string}` ?? SPLIT_IT_CONTRACT_ADDRESS,
    creatorName: data?.[1],
    billName: data?.[2],
    totalAmount: BigInt(data?.[3] ?? 0),
    amountPerPerson: BigInt(data?.[4] ?? 0),
    totalPaid: BigInt(data?.[5] ?? 0),
  };
  return split;
}
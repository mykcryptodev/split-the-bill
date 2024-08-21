import { type NextPage } from "next";
import Link from "next/link";
import { FC } from "react";
import { ZERO_ADDRESS } from "thirdweb";
import { useReadContract, useReadContracts, useAccount } from "wagmi";
import { SPLIT_IT_CONTRACT_ADDRESS } from "~/constants";
import { splitItAbi } from "~/constants/abi/splitIt";
import { transformSplit } from "~/helpers/transformSplit";
import { Split } from "~/types/split";

export const MySplits: NextPage = () => {
  const { address } = useAccount();
  const splitsContract = {
    address: SPLIT_IT_CONTRACT_ADDRESS,
    abi: splitItAbi,
  } as const;
  const loading = { result: [], status: 'loading' } as const;
  const { data: [createdSplits, paidSplits] = [loading, loading] } = useReadContracts({
    contracts: [
      {
        ...splitsContract,
        functionName: 'getSplitIdsCreatedByAddress',
        args: [address ?? ZERO_ADDRESS],
      },
      {
        ...splitsContract,
        functionName: 'getSplitIdsPaidByAddress',
        args: [address ?? ZERO_ADDRESS],
      },
    ],
  });

  const SplitRow: FC<{ splitId: bigint }> = ({ splitId }) => {
    const { data, isLoading } = useReadContract({
      abi: splitItAbi,
      address: SPLIT_IT_CONTRACT_ADDRESS,
      functionName: "splits",
      args: [splitId],
    });
    const split = transformSplit(data);
    if (!split) return null;
    return (
      <Link className="btn w-full" href={`/split/${splitId.toString()}`}>
        {split.billName ?? "Split"}
      </Link>
    )
  };

  return (
    <div className="flex flex-col gap-2 justify-center mx-auto">
      <div className="flex sm:flex-row flex-col gap-4">
        <div className="flex flex-col gap-2 w-full">
          <h2 className="text-lg font-bold">Created Splits</h2>
          <div className="flex flex-col gap-2 w-full">
            {createdSplits?.result?.map((splitId) => (
              <SplitRow key={splitId} splitId={splitId} />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2 w-full">
          <h2 className="text-lg font-bold">Paid Splits</h2>
          <div className="flex flex-col gap-2 w-full">
            {paidSplits?.result?.map((splitId) => (
              <SplitRow key={splitId} splitId={splitId} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MySplits;
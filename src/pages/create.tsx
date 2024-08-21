import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { isAddressEqual, type TransactionReceipt } from "viem";

import CreateSplit from "~/components/Create";
import CreateSplitEoaTw from "~/components/CreateEoaTw";
import { SPLIT_IT_CONTRACT_ADDRESS } from "~/constants";
import { maxDecimals } from "~/helpers/maxDecimals";
import { useIsSmartWallet } from "~/hooks/useIsSmartWallet";
import { readContract } from '@wagmi/core'
import { useAccount } from "wagmi";
import { wagmiConfig } from "~/providers/OnchainProviders";
import { splitItAbi } from "~/constants/abi/splitIt";

export const Create: NextPage = () => {
  const router = useRouter();
  const { address } = useAccount();
  const [totalAmount, setTotalAmount] = useState<number>();
  const [numberOfPeople, setNumberOfPeople] = useState<number>();

  const amountPerPerson = useMemo(() => {
    if (!numberOfPeople || !totalAmount) return 0;
    return totalAmount / numberOfPeople
  }, [totalAmount, numberOfPeople]);

  const isSmartWallet = useIsSmartWallet();

  const pushToSplitPage = async () => {
    if (!address) return;
    const splitIdsCreatedByAddress = await readContract(wagmiConfig, {
      abi: splitItAbi,
      address: SPLIT_IT_CONTRACT_ADDRESS,
      functionName: 'getSplitIdsByAddress',
      args: [address]
    });
    // get the largest splitId from the list
    const splitId = splitIdsCreatedByAddress.reduce((acc, val) => Math.max(acc, Number(val)), 0);
    void router.push(`/split/${splitId}`);
  };

  return (
    <div className="flex flex-col gap-2 justify-center max-w-md mx-auto">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-bold">Create a Split</h2>
        <label className="form-control w-full">
          <div className="label">
            <span className="label-text">Total Amount</span>
          </div>
          <input
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Total Amount"
            type="number"
            step="0.01" // Set the step to 0.01 for 2 maximum decimals
            value={totalAmount}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "") return setTotalAmount(undefined);
              setTotalAmount(Number(maxDecimals(e.target.value, 2)));
            }}
          />
        </label>
        <label className="form-control w-full">
          <div className="label">
            <span className="label-text">How many people?</span>
          </div>
          <input
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Number of People"
            type="number"
            value={numberOfPeople?.toString()}
            onChange={(e) => setNumberOfPeople(Number(e.target.value))}
          />
          <div className="label">
            <span />
            <span className="label-text-alt">Everyone will pay {amountPerPerson.toFixed(2)} each.</span>
          </div>
        </label>
        {isSmartWallet ? (
          <CreateSplit 
            isDisabled={!totalAmount || !numberOfPeople}
            totalAmount={totalAmount ?? 0} 
            amountPerPerson={amountPerPerson}
            onSplitCreated={() => void pushToSplitPage()}
          />
        ) : (
          <CreateSplitEoaTw 
            isDisabled={!totalAmount || !numberOfPeople}
            totalAmount={totalAmount ?? 0} 
            amountPerPerson={amountPerPerson}
            onSplitCreated={() => void pushToSplitPage()}
          />
        )}
      </div>
    </div>
  );
}

export default Create;
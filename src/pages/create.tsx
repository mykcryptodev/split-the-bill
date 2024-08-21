import { type NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

import CreateSplit from "~/components/Create";
import CreateSplitEoaTw from "~/components/CreateEoaTw";
import { SPLIT_IT_CONTRACT_ADDRESS } from "~/constants";
import { maxDecimals } from "~/helpers/maxDecimals";
import { useIsSmartWallet } from "~/hooks/useIsSmartWallet";
import { readContract } from '@wagmi/core';
import { useAccount } from "wagmi";
import { useEnsName } from "thirdweb/react";
import { thirdwebClient, wagmiConfig } from "~/providers/OnchainProviders";
import { splitItAbi } from "~/constants/abi/splitIt";

export const Create: NextPage = () => {
  const router = useRouter();
  const { address } = useAccount();
   // ens is not working if using the wagmi hook, must use thirdweb
  const { data: ensName } = useEnsName({ 
    client: thirdwebClient,
    address, 
  });
  const [totalAmount, setTotalAmount] = useState<number>();
  const [numberOfPeople, setNumberOfPeople] = useState<number>();
  const [name, setName] = useState<string>();
  const [title, setTitle] = useState<string>(`Split ${new Date().toLocaleDateString()}`);

  useEffect(() => {
    if (name === undefined && ensName) {
      setName(ensName);
    }
  }, [ensName, name])

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
      functionName: 'getSplitIdsCreatedByAddress',
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
            className="w-full p-2 border border-gray-300 rounded-lg"
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
            className="w-full p-2 border border-gray-300 rounded-lg"
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
        <div className="collapse collapse-arrow">
          <input type="checkbox" className="peer" />
          <div
            className="collapse-title">
            Advanced
          </div>
          <div className="collapse-content flex flex-col gap-2">
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">Your Name</span>
              </div>
              <input
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="Your Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">Title</span>
              </div>
              <input
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="Give this split a title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
          </div>
        </div>
        {isSmartWallet ? (
          <CreateSplit 
            isDisabled={!totalAmount || !numberOfPeople}
            totalAmount={totalAmount ?? 0} 
            amountPerPerson={amountPerPerson}
            name={name}
            title={title}
            onSplitCreated={() => void pushToSplitPage()}
          />
        ) : (
          <CreateSplitEoaTw 
            isDisabled={!totalAmount || !numberOfPeople}
            totalAmount={totalAmount ?? 0} 
            amountPerPerson={amountPerPerson}
            name={name}
            title={title}
            onSplitCreated={() => void pushToSplitPage()}
          />
        )}
      </div>
    </div>
  );
}

export default Create;
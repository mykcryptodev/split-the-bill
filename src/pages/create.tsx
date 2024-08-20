import { NextPage } from "next";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";
import { isAddressEqual, type TransactionReceipt } from "viem";
import CreateSplit from "~/components/Create";
import CreateSplitEoaTw from "~/components/CreateEoaTw";
import { SPLIT_IT_CONTRACT_ADDRESS } from "~/constants";
import { useIsSmartWallet } from "~/hooks/useIsSmartWallet";

export const Create: NextPage = () => {
  const router = useRouter();
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [numberOfPeople, setNumberOfPeople] = useState<number>(0);

  const amountPerPerson = useMemo(() => {
    if (numberOfPeople === 0) return 0;
    return totalAmount / numberOfPeople
  }, [totalAmount, numberOfPeople]);

  const isSmartWallet = useIsSmartWallet();

  const pushToSplitPage = (receipts: TransactionReceipt[]) => {
    const receipt = receipts[0];
    if (!receipt) return;
    const logs = receipt.logs;
    const logFromSplit = logs.find((log) => isAddressEqual(log.address, SPLIT_IT_CONTRACT_ADDRESS));
    if (logFromSplit) {
      const splitId = logFromSplit.topics[1];
      console.log({ splitId });
      router.push(`/split/${Number(splitId)}`);
    }
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
            value={totalAmount}
            onChange={(e) => setTotalAmount(Number(e.target.value))}
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
            value={numberOfPeople}
            onChange={(e) => setNumberOfPeople(Number(e.target.value))}
          />
          <div className="label">
            <span />
            <span className="label-text-alt">Everyone will pay {amountPerPerson} each.</span>
          </div>
        </label>
        {isSmartWallet ? (
          <CreateSplit 
            totalAmount={totalAmount} 
            amountPerPerson={amountPerPerson}
            onSplitCreated={(receipt) => {
              console.log({ receipt });
              pushToSplitPage(receipt as unknown as TransactionReceipt[]);
            }}
          />
        ) : (
          <CreateSplitEoaTw 
            totalAmount={totalAmount} 
            amountPerPerson={amountPerPerson}
            onSplitCreated={(receipt) => {
              console.log({ receipt });
              pushToSplitPage([receipt]);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default Create;
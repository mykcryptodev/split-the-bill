import { type FC } from "react";
import { useAccount, useWriteContract } from 'wagmi';

import { Wallet } from '~/components/Wallet';
import { MULTICALL, SPLIT_IT_CONTRACT_ADDRESS, USDC_ADDRESS, ZERO_ADDRESS } from '~/constants';
import { erc20Abi, encodeFunctionData, multicall3Abi } from 'viem';
import { type Split } from "~/types/split";
import { splitItAbi } from "~/constants/abi/splitIt";

type Props = {
  id: string;
  split: Split;
  formattedAmount: string;
  name: string;
  comment: string;
  onPaymentSuccessful: () => void;
}

export const PayEoa: FC<Props> = ({ split, id, formattedAmount, name, comment, onPaymentSuccessful }) => {
  const { address } = useAccount();

  const approveTransaction = encodeFunctionData({
    abi: erc20Abi,
    functionName: "approve",
    args: [SPLIT_IT_CONTRACT_ADDRESS, split.amountPerPerson],
  });

  const payTransaction = encodeFunctionData({
    abi: splitItAbi,
    functionName: "pay",
    args: [
      BigInt(id),
      address ?? ZERO_ADDRESS,
      address ?? ZERO_ADDRESS,
      name,
      comment,
    ],
  });

  const multicallData: readonly { target: string; allowFailure: boolean; callData: `0x${string}`; }[] = [
    { target: USDC_ADDRESS, allowFailure: false, callData: approveTransaction },
    { target: SPLIT_IT_CONTRACT_ADDRESS, allowFailure: false, callData: payTransaction },
  ];
  const { data: hash, writeContractAsync } = useWriteContract();

  const handleWriteTransaction = async () => {
    console.log("multicallData", multicallData);
    try {
      const tx = await writeContractAsync({
        address: MULTICALL,
        abi: multicall3Abi,
        functionName: "aggregate3",
        args: [multicallData],
      });
      console.log({ tx });
      onPaymentSuccessful();
    } catch (error) {
      console.error("error", error);
    }
  };

  return address ? (
    <button
      className="btn btn-primary btn-block"
      onClick={() => void handleWriteTransaction()}
    >
      Transact
      {hash && <span className="ml-2 text-sm text-gray-400">{hash}</span>}
    </button>
  ) : (
    <div className="w-full justify-center flex">
      <Wallet />
    </div>
  );
}

export default PayEoa;
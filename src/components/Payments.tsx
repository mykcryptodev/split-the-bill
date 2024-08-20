import { FC } from "react";
import { SPLIT_IT_CONTRACT_ADDRESS } from "~/constants";
import { splitItAbi } from "~/constants/abi/splitIt";
import { type Split } from "~/types/split";
import { useReadContract } from 'wagmi';
import { Avatar, Name } from "@coinbase/onchainkit/identity";

type Props = {
  id: string;
  split: Split;
}
export const Payments: FC<Props> = ({ split, id }) => {
  const { data, isLoading } = useReadContract({
    abi: splitItAbi,
    address: SPLIT_IT_CONTRACT_ADDRESS,
    functionName: "getPayments",
    args: [BigInt(id)],
  });
  const payments = data;
  return (
    <div>
      <h1>Payments</h1>
      <div>
        {payments?.map((payment) => (
          <div key={payment.payer} className="flex gap-4">
            <div className="flex items-start gap-1">
              <Avatar
                address={payment.payer}
                className="h-8 w-8"
              />
              <div className="flex flex-col">
                <div className="font-bold">{payment.name}</div>
                <Name address={payment.payer} className="font-normal text-xs" />
              </div>
            </div>
            <div>{payment.comment}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Payments;
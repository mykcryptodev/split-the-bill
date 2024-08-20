import { Avatar, Name } from "@coinbase/onchainkit/identity";
import { FC } from "react";
import { Payment } from "~/types/split";

type Props = {
  payments: Payment[] | undefined;
}
export const Payments: FC<Props> = ({ payments }) => {
  return (
    <div className="flex flex-col gap-2">
      <h1 className="font-bold text-xl mb-2">Payments</h1>
      <div className="flex flex-col gap-2">
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
        )).reverse()}
      </div>
    </div>
  );
};

export default Payments;
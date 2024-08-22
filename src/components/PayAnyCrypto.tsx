import { Token } from "@coinbase/onchainkit/token";
import { useState, type FC } from "react";
import { type Split } from "~/types/split";
import TokenPicker from "./TokenPicker";

type Props = {
  id: string;
  split: Split;
  formattedAmount: string;
  name: string;
  comment: string;
  onPaymentSuccessful: () => void;
}

export const PayAnyCrypto: FC<Props> = ({
  split,
  id,
  formattedAmount,
  name,
  comment,
  onPaymentSuccessful,
}) => {
  const [token, setToken] = useState<Token>();
  
  return (
    <div className="flex w-full justify-end">
      <TokenPicker 
        id={'any-crypto'}
        onTokenSelected={setToken}
        selectedToken={token}
      />
    </div>
  )
};

export default PayAnyCrypto;
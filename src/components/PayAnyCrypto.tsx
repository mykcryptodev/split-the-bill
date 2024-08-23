import { Token } from "@coinbase/onchainkit/token";
import { useEffect, useState, type FC } from "react";
import { type Split } from "~/types/split";
import TokenPicker from "./TokenPicker";
import { api } from "~/utils/api";
import { CHAIN, USDC_ADDRESS, USDC_DECIMALS, USDC_IMAGE } from "~/constants";
import { USDC_TOKEN } from "~/constants/defaultTokens";

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
  const [token, setToken] = useState<Token>(USDC_TOKEN);
  const { data: tokenPrice } = api.simpleHash.getTokenPrice.useQuery({
    address: token?.address,
  });
  const [priceInToken, setPriceInToken] = useState<string>('');
  useEffect(() => {
    if (tokenPrice) {
      setPriceInToken(
        (Number(formattedAmount.replace('$', '')) / tokenPrice).toString(),
      )
    }
  }, [tokenPrice, token, split.amountPerPerson]);
  
  return (
    <div className="flex items-center w-full rounded-xl">
      <div className="flex w-full justify-end items-center pt-1">
        {/* <input
          type="text"
          placeholder="Enter amount"
          value={Number(priceInToken).toLocaleString([], { maximumFractionDigits: 6 })}
          onChange={()=>{}}
          className="w-full text-right rounded-xl px-4 py-3 bg-transparent focus:outline-0"
        /> */}
        <TokenPicker 
          id={'any-crypto'}
          onTokenSelected={setToken}
          selectedToken={token}
        />
      </div>
    </div>
  )
};

export default PayAnyCrypto;
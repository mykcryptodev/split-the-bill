import { Token } from "@coinbase/onchainkit/token";
import { useEffect, useState, type FC } from "react";
import { type Split } from "~/types/split";
import TokenPicker from "./TokenPicker";
import { api } from "~/utils/api";
import { CHAIN, USDC_ADDRESS, USDC_DECIMALS, USDC_IMAGE } from "~/constants";

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
  const [token, setToken] = useState<Token>({
    address: USDC_ADDRESS,
    chainId: CHAIN.id,
    decimals: USDC_DECIMALS,
    image: USDC_IMAGE,
    name: "US Dollar Coin",
    symbol: "USDC",
  });
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
    <div className="flex items-center w-full bg-white rounded-xl">
      <div className="w-full">
        <input
          type="text"
          placeholder="Enter amount"
          value={Number(priceInToken).toLocaleString([], { maximumFractionDigits: 6 })}
          onChange={()=>{}}
          className="w-full rounded-xl p-4 focus:outline-0"
        />
      </div>
      <div className="flex justify-end px-4">
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
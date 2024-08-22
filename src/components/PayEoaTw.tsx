import { type FC,useEffect,useMemo, useState } from "react";
import { getContract, prepareContractCall } from 'thirdweb';
import { TransactionButton } from 'thirdweb/react';
import { useAccount, useReadContract } from 'wagmi';

import { Wallet } from '~/components/Wallet';
import { SPLIT_IT_CONTRACT_ADDRESS, THIRDWEB_CHAIN, ZERO_ADDRESS } from '~/constants';
import { erc20Abi } from 'viem';
import { thirdwebClient } from '~/providers/OnchainProviders';
import { type Split } from "~/types/split";
import { Token } from "@coinbase/onchainkit/token";
import { USDC_TOKEN } from "~/constants/defaultTokens";
import TokenPicker from "./TokenPicker";
import { api } from "~/utils/api";
import { maxDecimals } from "~/helpers/maxDecimals";

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

  const [paymentToken, setPaymentToken] = useState<Token>(USDC_TOKEN);
  const { data: paymentTokenPrice } = api.simpleHash.getTokenPrice.useQuery({
    address: paymentToken?.address,
  });
  const [priceInToken, setPriceInToken] = useState<string>('');
  useEffect(() => {
    if (paymentTokenPrice) {
      setPriceInToken(
        (Number(formattedAmount.replace('$', '')) / paymentTokenPrice).toString(),
      )
    }
  }, [paymentTokenPrice, paymentToken, split.amountPerPerson]);

  const { data: allowance, refetch } = useReadContract({
    abi: erc20Abi,
    address: paymentToken.address,
    functionName: "allowance",
    args: [address ?? ZERO_ADDRESS, SPLIT_IT_CONTRACT_ADDRESS],
  });

  const hasSufficientAllowance = useMemo(() => {
    if (!address) return true;
    return allowance && BigInt(allowance) >= split.amountPerPerson;
  }, [address, allowance, split.amountPerPerson]);

  if (!hasSufficientAllowance && address) {
    const transaction = prepareContractCall({
      contract: getContract({
        client: thirdwebClient,
        chain: THIRDWEB_CHAIN,
        address: paymentToken.address,
      }),
      method: "function approve(address spender, uint256 value) public returns (bool)",
      params: [SPLIT_IT_CONTRACT_ADDRESS, split.amountPerPerson],
    });
    return (
      <div className="flex items-center w-full bg-primary rounded-lg">
        <TransactionButton
          transaction={() => transaction}
          unstyled
          className="btn btn-primary grow"
          onTransactionConfirmed={() => void refetch()}
        >
          {`Approve ${maxDecimals(priceInToken, 2)} ${paymentToken.symbol}`}
        </TransactionButton>
        <TokenPicker 
          id={`pay-eoa-picker`}
          className="h-12 rounded-l-none pl-4"
          onTokenSelected={setPaymentToken}
          selectedToken={paymentToken}
        />
      </div>
    );
  }

  const transaction = prepareContractCall({
    contract: getContract({
      client: thirdwebClient,
      chain: THIRDWEB_CHAIN,
      address: SPLIT_IT_CONTRACT_ADDRESS,
    }),
    method: "function pay(uint256 _splitId, address _address, address _fundedFrom, string memory _name, string memory _comment)",
    params: [
      BigInt(id),
      address ?? ZERO_ADDRESS,
      address ?? ZERO_ADDRESS,
      name,
      comment,
    ],
  });

  return address ? (
    <div className="flex items-center w-full bg-primary rounded-lg">
      <TransactionButton
        transaction={() => transaction}
        unstyled
        className="btn btn-primary grow"
        onTransactionConfirmed={() => void onPaymentSuccessful()}
      >
        {`Pay ${maxDecimals(priceInToken, 2)} ${paymentToken.symbol}`}
      </TransactionButton>
      <TokenPicker 
        id={`pay-eoa-picker`}
        className="h-12 rounded-l-none pl-4"
        onTokenSelected={setPaymentToken}
        selectedToken={paymentToken}
      />
    </div>
  ) : (
    <div className="w-full justify-center flex">
      <Wallet />
    </div>
  );
}

export default PayEoa;
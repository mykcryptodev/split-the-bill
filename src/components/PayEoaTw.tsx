import { type FC,useMemo } from "react";
import { getContract, prepareContractCall } from 'thirdweb';
import { TransactionButton } from 'thirdweb/react';
import { useAccount, useReadContract } from 'wagmi';

import { Wallet } from '~/components/Wallet';
import { SPLIT_IT_CONTRACT_ADDRESS, THIRDWEB_CHAIN, USDC_ADDRESS, ZERO_ADDRESS } from '~/constants';
import { erc20Abi } from 'viem';
import { thirdwebClient } from '~/providers/OnchainProviders';
import { type Split } from "~/types/split";

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

  const { data: allowance, refetch } = useReadContract({
    abi: erc20Abi,
    address: USDC_ADDRESS,
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
        address: USDC_ADDRESS,
      }),
      method: "function approve(address spender, uint256 value) public returns (bool)",
      params: [SPLIT_IT_CONTRACT_ADDRESS, split.amountPerPerson],
    });
    return (
      <TransactionButton
        transaction={() => transaction}
        unstyled
        className="btn btn-primary btn-block"
        onTransactionConfirmed={() => void refetch()}
      >
        {`Approve ${formattedAmount} USDC`}
      </TransactionButton>
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
    <TransactionButton
      transaction={() => transaction}
      unstyled
      className="btn btn-primary btn-block"
      onTransactionConfirmed={() => void onPaymentSuccessful()}
    >
      {`Pay ${formattedAmount} USDC`}
    </TransactionButton> 
  ) : (
    <div className="w-full justify-center flex">
      <Wallet />
    </div>
  );
}

export default PayEoa;
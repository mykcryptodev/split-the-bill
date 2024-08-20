import { useMemo, type FC } from "react";
import { getContract, prepareContractCall } from 'thirdweb';
import { TransactionButton } from 'thirdweb/react';
import { useAccount, useReadContract } from 'wagmi';
import { Wallet } from '~/components/Wallet';
import { SPLIT_IT_CONTRACT_ADDRESS, THIRDWEB_CHAIN, USDC_ADDRESS, ZERO_ADDRESS } from '~/constants';
import { erc20Abi } from "~/constants/abi/erc20";
import { thirdwebClient } from '~/providers/OnchainProviders';
import { type Split } from "~/types/split";

type Props = {
  id: string;
  split: Split;
  formattedAmount: string;
}

export const PayEoa: FC<Props> = ({ split, id, formattedAmount }) => {
  const { address } = useAccount();

  const { data: allowance } = useReadContract({
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
        className="btn btn-primary"
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
    method: "function pay(string memory id) public",
    params: [id],
  });

  return address ? (
    <TransactionButton
      transaction={() => transaction}
      unstyled
      className="btn btn-primary"
    >
      {`Pay ${formattedAmount} USDC`}
    </TransactionButton> 
  ) : (
    <Wallet />
  );
}

export default PayEoa;
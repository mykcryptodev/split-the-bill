import { Avatar, Name } from '@coinbase/onchainkit/identity';
import {
  Transaction,
  TransactionButton,
  TransactionSponsor,
  TransactionStatus,
  TransactionStatusAction,
  TransactionStatusLabel,
} from '@coinbase/onchainkit/transaction';
import { ConnectWallet, Wallet } from '@coinbase/onchainkit/wallet';
import { useMemo, type FC } from "react";
import { useAccount, useReadContract } from 'wagmi';
import { CHAIN, SPLIT_IT_CONTRACT_ADDRESS, USDC_ADDRESS, ZERO_ADDRESS } from '~/constants';
import { erc20Abi } from "~/constants/abi/erc20";
import { splitItAbi } from '~/constants/abi/splitIt';
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
    return (
      <Transaction
        address={address}
        chainId={CHAIN.id}
        capabilities={undefined}
        contracts={[
          {
            address: USDC_ADDRESS,
            abi: erc20Abi,
            functionName: 'approve',
            args: [SPLIT_IT_CONTRACT_ADDRESS, split.amountPerPerson],
          },
        ]}
      >
        <TransactionButton text={`Approve ${formattedAmount} USDC`} />
        <TransactionSponsor />
        <TransactionStatus>
          <TransactionStatusLabel />
          <TransactionStatusAction />
        </TransactionStatus>
      </Transaction>
    );
  }

  return address ? (
    <Transaction
      address={address}
      chainId={CHAIN.id}
      contracts={[
        {
          address: SPLIT_IT_CONTRACT_ADDRESS,
          abi: splitItAbi,
          functionName: 'pay',
          args: [
            BigInt(id),
            address,
            address,
            "test name",
            "test comment"
          ],
        },
      ]}
    >
      <TransactionButton text={`Approve ${formattedAmount} USDC`} />
      <TransactionSponsor />
      <TransactionStatus>
        <TransactionStatusLabel />
        <TransactionStatusAction />
      </TransactionStatus>
    </Transaction>  
  ) : (
    <Wallet>
      <ConnectWallet>
        <Avatar className='h-6 w-6' />
        <Name />
      </ConnectWallet>
    </Wallet>
  );
}

export default PayEoa;
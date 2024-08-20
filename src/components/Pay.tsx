import {
  Transaction,
  TransactionButton,
  TransactionSponsor,
  TransactionStatus,
  TransactionStatusAction,
  TransactionStatusLabel,
} from '@coinbase/onchainkit/transaction';
import { type FC } from "react";
import { useAccount } from 'wagmi';
import { Wallet } from '~/components/Wallet';
import { CHAIN, SPLIT_IT_CONTRACT_ADDRESS, USDC_ADDRESS } from '~/constants';
import { erc20Abi } from "~/constants/abi/erc20";
import { splitItAbi } from '~/constants/abi/splitIt';
import { type Split } from "~/types/split";

type Props = {
  id: string;
  split: Split;
  formattedAmount: string;
}

export const Pay: FC<Props> = ({ split, id, formattedAmount }) => {
  const { address } = useAccount();

  return address ? (
    <Transaction
      address={address}
      chainId={CHAIN.id}
      contracts={[
        {
          address: USDC_ADDRESS,
          abi: erc20Abi,
          functionName: 'approve',
          args: [SPLIT_IT_CONTRACT_ADDRESS, split.amountPerPerson],
        },
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
      <TransactionButton text={`Pay ${formattedAmount}`} />
      <TransactionSponsor />
      <TransactionStatus>
        <TransactionStatusLabel />
        <TransactionStatusAction />
      </TransactionStatus>
    </Transaction>  
  ) : (
    <Wallet />
  );
}

export default Pay;
import {
  Transaction,
  TransactionButton,
  TransactionSponsor,
  TransactionStatus,
  TransactionStatusAction,
  TransactionStatusLabel
} from '@coinbase/onchainkit/transaction';
import { FC } from 'react';
import { parseUnits, type TransactionReceipt } from 'viem';
import { useAccount } from 'wagmi';
import { Wallet } from '~/components/Wallet';
import { CHAIN, SPLIT_IT_CONTRACT_ADDRESS, USDC_DECIMALS } from '~/constants';
import { splitItAbi } from '~/constants/abi/splitIt';

type Props = {
  totalAmount: number;
  amountPerPerson: number;
  onSplitCreated: (receipts: TransactionReceipt) => void;
}

const CreateSplit: FC<Props> = ({ totalAmount = 0, amountPerPerson = 0, onSplitCreated }) => {
  const { address } = useAccount();
 
  const contracts = [
    {
      address: SPLIT_IT_CONTRACT_ADDRESS,
      abi: splitItAbi,
      functionName: 'createSplit',
      args: [
        address,
        BigInt(parseUnits(totalAmount.toString(), USDC_DECIMALS)),
        BigInt(parseUnits(amountPerPerson.toString(), USDC_DECIMALS)),
      ],
    },
  ];
 
  return address ? (
    <Transaction
      address={SPLIT_IT_CONTRACT_ADDRESS}
      chainId={CHAIN.id}
      contracts={contracts}
      onSuccess={(receipt) => onSplitCreated(receipt.transactionReceipts[0] as TransactionReceipt)}
    >
      <TransactionButton text="Split The Bill" />
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

export default CreateSplit;
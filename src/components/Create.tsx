import {
  Transaction,
  TransactionButton,
  TransactionSponsor,
  TransactionStatus,
  TransactionStatusAction,
  TransactionStatusLabel
} from '@coinbase/onchainkit/transaction';
import { type FC } from 'react';
import { parseUnits } from 'viem';
import { useAccount } from 'wagmi';

import { Wallet } from '~/components/Wallet';
import { CHAIN, SPLIT_IT_CONTRACT_ADDRESS, USDC_DECIMALS } from '~/constants';
import { splitItAbi } from '~/constants/abi/splitIt';

type Props = {
  isDisabled: boolean;
  totalAmount: number;
  amountPerPerson: number;
  name?: string;
  title?: string;
  onSplitCreated: () => void;
}

const CreateSplit: FC<Props> = ({ 
  totalAmount = 0, 
  amountPerPerson = 0,
  name = '',
  title = '',
  onSplitCreated, 
  isDisabled
}) => {
  const { address } = useAccount();
 
  const contracts = [
    {
      address: SPLIT_IT_CONTRACT_ADDRESS,
      abi: splitItAbi,
      functionName: 'createSplit',
      args: [
        address,
        name,
        title,
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
      onSuccess={() => onSplitCreated()}
    >
      <TransactionButton text="Split The Bill" disabled={isDisabled} />
      <TransactionSponsor />
      <TransactionStatus>
        <TransactionStatusLabel />
        <TransactionStatusAction />
      </TransactionStatus>
    </Transaction>  
  ) : (
    <div className="w-full justify-center flex">
      <Wallet />
    </div>
  );
}

export default CreateSplit;
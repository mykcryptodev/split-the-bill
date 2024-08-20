import { Avatar, Name } from '@coinbase/onchainkit/identity';
import { 
  Transaction, 
  TransactionButton, 
  TransactionSponsor, 
  TransactionStatus, 
  TransactionStatusLabel, 
  TransactionStatusAction, 
} from '@coinbase/onchainkit/transaction'; 
import { Wallet, ConnectWallet } from '@coinbase/onchainkit/wallet';
import { FC } from 'react';
import { useAccount } from 'wagmi';
import { CHAIN, SPLIT_IT_CONTRACT_ADDRESS, USDC_DECIMALS } from '~/constants';
import { splitItAbi } from '~/constants/abi/splitIt';
import { parseUnits } from 'viem';

type Props = {
  totalAmount: number;
  amountPerPerson: number;
}

const CreateSplit: FC<Props> = ({ totalAmount = 0, amountPerPerson = 0 }) => {
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
      // @ts-ignore
      contracts={contracts}
    >
      <TransactionButton />
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

export default CreateSplit;
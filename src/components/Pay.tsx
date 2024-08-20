import { useEffect, useMemo, useState, type FC } from "react";
import { type Split } from "~/types/split";
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
import { useAccount } from 'wagmi';
import { CHAIN, MULTICALL, SPLIT_IT_CONTRACT_ADDRESS, USDC_ADDRESS } from '~/constants';
import { splitItAbi } from '~/constants/abi/splitIt';
import { erc20Abi } from "~/constants/abi/erc20";

import { isWalletACoinbaseSmartWallet } from '@coinbase/onchainkit/wallet';
import type { UserOperation } from 'permissionless';
import { publicClient } from "~/providers/OnchainProviders";
import { multicallAbi } from "~/constants/abi/multicall";
import { encodeFunctionData, type EncodeFunctionDataParameters } from 'viem';

type Props = {
  id: string;
  split: Split;
}

export const Pay: FC<Props> = ({ split, id }) => {
  const { address } = useAccount();

  const userOp = { sender: address } as UserOperation<'v0.6'>;

  const [shouldUseMulticall, setShouldUseMulticall] = useState<boolean>(false);

  useEffect(() => {
    const detectIfWalletIsSmartWallet = async () => {
      const smartWalletCheck = await isWalletACoinbaseSmartWallet({ client: publicClient, userOp });
      console.log('isSmartWallet', smartWalletCheck);
      setShouldUseMulticall(!smartWalletCheck.isCoinbaseSmartWallet);
    };
    void detectIfWalletIsSmartWallet();
  }, [address]);

  console.log({ split });

  const transaction = useMemo(() => {
    const address = shouldUseMulticall ? MULTICALL : SPLIT_IT_CONTRACT_ADDRESS;
    const approveTx: EncodeFunctionDataParameters = {
      abi: erc20Abi,
      functionName: 'approve',
      args: [SPLIT_IT_CONTRACT_ADDRESS, split.amountPerPerson],
    };
    const payTx: EncodeFunctionDataParameters = {
      abi: splitItAbi,
      functionName: 'pay',
      args: [
        BigInt(id),
        address,
        address,
        "test name",
        "test comment"
      ],
    };
    if (shouldUseMulticall) {
      const calls = [
        {
          target: USDC_ADDRESS,
          callData: encodeFunctionData(approveTx),
        },
        {
          target: SPLIT_IT_CONTRACT_ADDRESS,
          callData: encodeFunctionData(payTx),
        },
      ];
      return {
        contracts: [
          {
            address: MULTICALL,
            abi: multicallAbi,
            functionName: 'aggregate',
            args: calls,
          },
        ],
      }
    }
    console.log('returning mom multicall');
    return {
      contracts: [
        {
          address: USDC_ADDRESS,
          functionName: 'approve',
          ...approveTx,
        },
        {
          address: SPLIT_IT_CONTRACT_ADDRESS,
          functionName: 'pay',
          ...payTx,
        },
      ],
    }
  }, [shouldUseMulticall]);

  console.log({ transaction });
 
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
      <TransactionButton text="Pay" />
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

export default Pay;
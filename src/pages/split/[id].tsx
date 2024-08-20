import { Avatar, Name } from "@coinbase/onchainkit/identity";
import { formatAmount } from "@coinbase/onchainkit/token";
import { isWalletACoinbaseSmartWallet } from "@coinbase/onchainkit/wallet";
import { type NextPage, GetServerSideProps } from "next";
import type { UserOperation } from 'permissionless';
import { useEffect, useState } from "react";
import { formatUnits } from "viem";
import { useAccount, useReadContract } from 'wagmi';
import Pay from "~/components/Pay";
import PayEoa from "~/components/PayEoa";
import Payments from "~/components/Payments";
import { SPLIT_IT_CONTRACT_ADDRESS, USDC_DECIMALS } from "~/constants";
import { splitItAbi } from "~/constants/abi/splitIt";
import { publicClient } from "~/providers/OnchainProviders";
import { type Split as SplitT } from "~/types/split";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const id = ctx.params?.id as string;
  return {
    props: {
      id,
    },
  };
}

type Props = {
  id: string;
}

export const Split: NextPage<Props> = ({ id }) => {
  const { data, isLoading } = useReadContract({
    abi: splitItAbi,
    address: SPLIT_IT_CONTRACT_ADDRESS,
    functionName: "splits",
    args: [BigInt(id)],
  });
  const split: SplitT = {
    creator: data?.[0] ?? SPLIT_IT_CONTRACT_ADDRESS,
    totalAmount: BigInt(data?.[1] ?? 0),
    amountPerPerson: BigInt(data?.[2] ?? 0),
    totalPaid: BigInt(data?.[3] ?? 0),
  };

  const { address } = useAccount();

  const userOp = { sender: address } as UserOperation<'v0.6'>;

  const [isSmartWallet, setIsSmartWallet] = useState<boolean>(false);

  useEffect(() => {
    const detectIfWalletIsSmartWallet = async () => {
      const smartWalletCheck = await isWalletACoinbaseSmartWallet({ client: publicClient, userOp });
      console.log('isSmartWallet', smartWalletCheck);
      setIsSmartWallet(smartWalletCheck.isCoinbaseSmartWallet);
    };
    void detectIfWalletIsSmartWallet();
  }, [address]);

  const formattedAmount = Number(formatUnits(split.amountPerPerson, USDC_DECIMALS)).toLocaleString([], {
    style: 'currency',
    currency: 'USD',
  });
  
  return (
    <div className="flex flex-col gap-2">
      <h1>Split Page: {id}</h1>
      <div className="flex items-center gap-1">
        <Avatar
          address={split.creator}
          className="h-6 w-6"
        />
        <Name address={split.creator} />
      </div>
      <div>is requesting</div>
      <div>
        {formatAmount(
          formatUnits(split.amountPerPerson, USDC_DECIMALS)
        )}
      </div>
      {isSmartWallet ? (
        <Pay split={split} id={id} formattedAmount={formattedAmount} />
      ) : (
        <PayEoa split={split} id={id}  formattedAmount={formattedAmount} />
      )}
      <div className="divider" />
      <Payments split={split} id={id} />
    </div>
  );
}

export default Split;
import { Avatar, Name } from "@coinbase/onchainkit/identity";
import { formatAmount } from "@coinbase/onchainkit/token";
import { type NextPage, GetServerSideProps } from "next";
import { useReadContract } from 'wagmi';
import { formatUnits } from "viem";
import { SPLIT_IT_CONTRACT_ADDRESS, USDC_DECIMALS } from "~/constants";
import { splitItAbi } from "~/constants/abi/splitIt";
import Pay from "~/components/Pay";
import { type Split as SplitT } from "~/types/split";
import Payments from "~/components/Payments";

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
  }
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
      <Pay split={split} id={id} />
      <div className="divider" />
      <Payments split={split} id={id} />
    </div>
  );
}

export default Split;
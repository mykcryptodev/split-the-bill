import { Avatar } from "@coinbase/onchainkit/identity";
import { type NextPage, GetServerSideProps } from "next";
import { useReadContract } from 'wagmi';
import { SPLIT_IT_CONTRACT_ADDRESS } from "~/constants";
import { splitItAbi } from "~/constants/abi/splitIt";

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
  return (
    <div className="flex flex-col gap-2">
      <h1>Split Page: {id}</h1>
      <Avatar
        address={data?.[0] ?? SPLIT_IT_CONTRACT_ADDRESS}
        className="h-6 w-6"
      />
    </div>
  );
}

export default Split;
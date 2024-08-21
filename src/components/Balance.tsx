import { TokenChip } from "@coinbase/onchainkit/token";
import { type FC } from "react";
import { useReadContracts } from 'wagmi';
import { CHAIN, USDC_IMAGE } from "~/constants";
import { erc20Abi, formatUnits } from 'viem';
import { maxDecimals } from "~/helpers/maxDecimals";

type Props = {
  token: string;
  address: string;
  className?: string;
};
export const Balance: FC<Props> = ({ address, token, className }) => {
  const { 
    data: [decimals, balance] = [6, BigInt(0)],
  } = useReadContracts({ 
    allowFailure: false, 
    contracts: [ 
      { 
        address: token, 
        abi: erc20Abi, 
        functionName: 'decimals', 
      },
      {
        address: token,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [address],
      }
    ] 
  });
  const tokenData = {
    address: token,
    chainId: CHAIN.id,
    decimals,
    image: USDC_IMAGE, // usdc only for now
    name: `${maxDecimals(formatUnits(balance, decimals), 2)}`,
    symbol: `${maxDecimals(formatUnits(balance, decimals), 2)}`,
  };

  return (
    <TokenChip 
      token={tokenData} 
      className={`shadow-none bg-transparent ${className}`}
    />
  )
};

export default Balance;
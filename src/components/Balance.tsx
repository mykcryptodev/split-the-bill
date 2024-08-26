import { TokenChip } from "@coinbase/onchainkit/token";
import { type FC } from "react";
import { erc20Abi, formatUnits } from 'viem';
import { useReadContracts } from 'wagmi';

import { USDC_IMAGE } from "~/constants";
import { maxDecimals } from "~/helpers/maxDecimals";

type Props = {
  token: string;
  address: string;
  chainId: number;
  className?: string;
};
export const Balance: FC<Props> = ({ address, token, className, chainId }) => {
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
    chainId,
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
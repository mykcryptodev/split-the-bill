import { getTokens, TokenChip, TokenRow, TokenSearch, type Token } from "@coinbase/onchainkit/token";
import { useCallback, useState, type FC } from "react";
import { useReadContract, useAccount } from "wagmi";
import { erc20Abi, formatUnits } from "viem";
import { ZERO_ADDRESS } from "thirdweb";
import { Portal } from "~/components/Portal";
import { DEFAULT_TOKENS, ETH_TOKEN } from "~/constants/defaultTokens";

type Props = {
  onTokenSelected: (token: Token) => void;
  selectedToken?: Token;
  id: string;
  className?: string;
}

export const TokenPicker: FC<Props> = ({ onTokenSelected, selectedToken, id, className }) => {
  const { address } = useAccount();
  const [tokenOptions, setTokenOptions] = useState<Token[]>(DEFAULT_TOKENS);

  const handleChange = useCallback((q: string) => {
    async function getData(q: string) {
      const tokens = await getTokens({ search: q }); 
      // Do something with tokens here
      console.log({ tokens });
      if (tokens instanceof Array) {
        setTokenOptions(tokens);
      }
    }
    getData(q)
  }, []);

  const handleSelectToken = (token: Token) => {
    onTokenSelected(token);
    // close modal
    document.getElementById(`token-picker-modal-${id}`)?.click();
  }

  const TokenOption: FC<{ token: Token }> = ({ token }) => {
    const { data: balance } = useReadContract({
      abi: erc20Abi,
      address: token.address,
      functionName: "balanceOf",
      args: [address ?? ZERO_ADDRESS],
    });

    return (
      <TokenRow 
        key={token.address}
        onClick={handleSelectToken}
        token={token} 
        amount={formatUnits(balance ?? BigInt(0), token.decimals)} 
        className="rounded-lg"
      />
    )
  }

  return (
    <>
      <label htmlFor={`token-picker-modal-${id}`} className="cursor-pointer">
        <TokenChip token={selectedToken ?? ETH_TOKEN} className={`pointer-events-none down-chevron shadow-none ${className}`} />
      </label>

      <Portal>
        <input type="checkbox" id={`token-picker-modal-${id}`} className="modal-toggle" />
        <div className="modal modal-bottom sm:modal-middle" role="dialog">
          <div className="modal-box flex flex-col gap-2">
            <h3 className="text-lg font-bold">Select a token</h3>
            <TokenSearch onChange={handleChange} delayMs={200} />
            <div className="flex justify-between items-center gap-2 overflow-x-auto w-full">
              {DEFAULT_TOKENS.map((token) => (
                <TokenChip 
                  token={token} 
                  key={token.address} 
                  onClick={handleSelectToken} 
                  className="shadow-none"
                />
              ))}
            </div>
            <div className="flex flex-col gap-2 mt-4 overflow-y-auto max-h-96 min-h-80">
              {tokenOptions.map((token) => (
                <TokenOption token={token} key={token.address} />
              ))}
            </div>
          </div>
          <label className="modal-backdrop" htmlFor={`token-picker-modal-${id}`}>Close</label>
        </div>
      </Portal>
    </>
  )

};

export default TokenPicker;
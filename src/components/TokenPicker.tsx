import { getTokens, TokenChip, TokenRow, TokenSearch, type Token } from "@coinbase/onchainkit/token";
import { useCallback, useState, type FC } from "react";
import { useReadContract, useAccount } from "wagmi";
import { wagmiConfig } from "~/providers/OnchainProviders";
import { erc20Abi, formatUnits } from "viem";
import { ZERO_ADDRESS } from "thirdweb";

type Props = {
  onTokenSelected: (token: Token) => void;
  selectedToken?: Token;
  id: string;
}

export const TokenPicker: FC<Props> = ({ onTokenSelected, selectedToken, id }) => {
  const { address } = useAccount();
  const [token, setToken] = useState<Token>();
  const [tokenOptions, setTokenOptions] = useState<Token[]>([]);

  const defaultToken = {
    address: '',
    chainId: 8453,
    decimals: 18,
    image:
      'https://dynamic-assets.coinbase.com/dbb4b4983bde81309ddab83eb598358eb44375b930b94687ebe38bc22e52c3b2125258ffb8477a5ef22e33d6bd72e32a506c391caa13af64c00e46613c3e5806/asset_icons/4113b082d21cc5fab17fc8f2d19fb996165bcce635e6900f7fc2d57c4ef33ae9.png',
    name: 'Ethereum',
    symbol: 'ETH',
  };

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
        onClick={() => {
          setToken(token);
          onTokenSelected(token);
          // close modal
          document.getElementById(`token-picker-modal-${id}`)?.click();
        }}
        token={token} 
        amount={formatUnits(balance ?? BigInt(0), token.decimals)} 
        className="rounded-lg"
      />
    )
  }

  return (
    <>
      <label htmlFor={`token-picker-modal-${id}`} className="cursor-pointer">
        <TokenChip token={selectedToken ?? defaultToken} className="pointer-events-none" />
      </label>

      <input type="checkbox" id={`token-picker-modal-${id}`} className="modal-toggle" />
      <div className="modal modal-bottom sm:modal-middle" role="dialog">
        <div className="modal-box">
          <TokenSearch onChange={handleChange} delayMs={200} />
          <div className="flex flex-col gap-2 mt-4 max-h-96 overflow-y-auto">
            {tokenOptions.map((token) => (
              <TokenOption token={token} key={token.address} />
            ))}
          </div>
        </div>
        <label className="modal-backdrop" htmlFor={`token-picker-modal-${id}`}>Close</label>
      </div>
    </>
  )

};

export default TokenPicker;
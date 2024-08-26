import { getTokens, type Token,TokenChip, TokenRow, TokenSearch } from "@coinbase/onchainkit/token";
import { type FC,useCallback } from "react";
import { type Chain } from "viem";
import { base, optimism } from "viem/chains";
import { useAccount,useReadContract } from "wagmi";

import { Portal } from "~/components/Portal";

const CHAIN_OPTIONS: Chain[] = [base, optimism];

type Props = {
  onChainSelected: (chain: Chain) => void;
  selectedChain?: Chain;
  id: string;
  className?: string;
}

export const ChainPicker: FC<Props> = ({ onChainSelected, selectedChain, id, className }) => {
  const { address } = useAccount();

  const handleSelectChain = (chain: Chain) => {
    onChainSelected(chain);
    // close modal
    document.getElementById(`chain-picker-modal-${id}`)?.click();
  }

  return (
    <>
      <label htmlFor={`chain-picker-modal-${id}`} className="cursor-pointer">
        {selectedChain?.name ?? "Select a chain"}
      </label>

      <Portal>
        <input type="checkbox" id={`chain-picker-modal-${id}`} className="modal-toggle" />
        <div className="modal modal-bottom sm:modal-middle" role="dialog">
          <div className="modal-box flex flex-col gap-2">
            <h3 className="text-lg font-bold">Select a chain</h3>
            <div className="flex flex-col gap-2 mt-4 overflow-y-auto max-h-96 min-h-80">
              {CHAIN_OPTIONS.map((chain) => (
                <div key={chain.id}>
                  <button
                    onClick={() => handleSelectChain(chain)}
                    className="btn btn-primary w-full"
                  >
                    {chain.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
          <label className="modal-backdrop" htmlFor={`chain-picker-modal-${id}`}>Close</label>
        </div>
      </Portal>
    </>
  )

};

export default ChainPicker;
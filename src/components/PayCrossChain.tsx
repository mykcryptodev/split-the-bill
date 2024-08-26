import { type Token } from "@coinbase/onchainkit/token";
import { chains,createSession, currencies, executeSession } from "@paywithglide/glide-js";
import { type FC,useState } from "react";
import { type Chain } from 'viem';
import { base,optimism } from 'viem/chains';
import { useAccount, useChainId, useSendTransaction, useSignTypedData,useSwitchChain } from "wagmi";

import ChainPicker from "~/components/ChainPicker";
import { SPLIT_IT_CONTRACT_ADDRESS } from "~/constants";
import { splitItAbi } from "~/constants/abi/splitIt";
import { glideConfig } from "~/providers/OnchainProviders";
import { type Split } from "~/types/split";

const PAYMENT_TOKEN: Token = {
  address: '0x0b2c639c533813f4aa9d7837caf62653d097ff85',
  chainId: 10,
  decimals: 6,
  image: 'https://s2.coinmarketcap.com/static/img/coins/200x200/11840.png',
  name: 'USDC',
  symbol: 'USDC',
};

type Props = {
  id: string;
  split: Split;
  formattedAmount: string;
  name: string;
  comment: string;
  onPaymentSuccessful: () => void;
}

export const PayCrossChain: FC<Props> = ({
  id,
  split,
  formattedAmount,
  name,
  comment,
  onPaymentSuccessful
}) => {
  const [sourceChain, setSourceChain] = useState<Chain>(optimism);
  const { address } = useAccount();
  const currentChainId = useChainId();
  const { switchChainAsync } = useSwitchChain(); 
  const { sendTransactionAsync } = useSendTransaction(); 
  const { signTypedDataAsync } = useSignTypedData(); 

  const payCrossChain = async () => {
    if (!address) return;
    try {
      console.log({ address: SPLIT_IT_CONTRACT_ADDRESS });
      const optimismEth = currencies.eth.on(chains.optimism);
      const session = await createSession(glideConfig, {
        chainId: chains.base.id,
        account: address as `0x${string}`,
       
        paymentCurrency: optimismEth,
        preferGaslessPayment: true,
       
        abi: splitItAbi,
        address: SPLIT_IT_CONTRACT_ADDRESS,
        functionName: "pay",
        args: [
          BigInt(id),
          address,
          address,
          name,
          comment,
        ],
      });
      console.log({ session });
      // await switchChainAsync({
      //   chainId: sourceChain.id,
      // });
      const transactionHash = await executeSession(glideConfig, {
        session,
        currentChainId, 
        switchChainAsync,
        sendTransactionAsync, 
        signTypedDataAsync, 
      });
      console.log(transactionHash);
      // await switchChainAsync({
      //   chainId: base.id,
      // });
    } catch (e) {
      console.log({ error: e });
    }
  };
  return (
    <>
      <button
        onClick={payCrossChain}
        className="btn btn-primary w-full"
      >
        Pay Cross Chain
      </button>
      <ChainPicker 
        id={`pay-sw-chain-picker`}
        onChainSelected={(chain) => {
          setSourceChain(chain);
        }}
        selectedChain={sourceChain}
        className="h-full min-h-12 pl-4"
      />
    </>
  )
};

export default PayCrossChain;
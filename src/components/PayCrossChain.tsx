import { chains,createSession, currencies, executeSession, listPaymentOptions, type PaymentOption } from "@paywithglide/glide-js";
import Image from "next/image";
import { useSnackbar } from "notistack";
import { type FC,useEffect,useMemo,useState } from "react";
import { base } from "thirdweb/chains";
import { PayEmbed } from "thirdweb/react";
import { erc20Abi } from "viem";
import { useAccount, useChainId, useReadContract,useSendTransaction, useSignTypedData,useSwitchChain } from "wagmi";

import { GLIDE_RELAYER, SPLIT_IT_CONTRACT_ADDRESS, type SUPPORTED_CHAINS, USDC_ADDRESS, ZERO_ADDRESS } from "~/constants";
import { splitItAbi } from "~/constants/abi/splitIt";
import { maxDecimals } from "~/helpers/maxDecimals";
import { useIsSmartWallet } from "~/hooks/useIsSmartWallet";
import { glideConfig, thirdwebClient } from "~/providers/OnchainProviders";

type Props = {
  id: string;
  formattedAmount: string;
  name: string;
  comment: string;
  onPaymentSuccessful: () => void;
}

export const PayCrossChain: FC<Props> = ({
  id,
  formattedAmount,
  name,
  comment,
  onPaymentSuccessful
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const { address } = useAccount();
  const currentChainId = useChainId();
  const { switchChainAsync } = useSwitchChain(); 
  const { sendTransactionAsync } = useSendTransaction(); 
  const { signTypedDataAsync } = useSignTypedData(); 
  const isSmartWallet = useIsSmartWallet();

  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([]);
  const [paymentOptionsIsLoading, setPaymentOptionsIsLoading] = useState<boolean>(false);
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<PaymentOption>();
  const [paymentIsLoading, setPaymentIsLoading] = useState<boolean>(false);

  const { data: usdcBalance } = useReadContract({
    abi: erc20Abi,
    address: USDC_ADDRESS,
    functionName: "balanceOf",
    args: [address ?? ZERO_ADDRESS],
  });

  const [showPayEmbed, setShowPayEmbed] = useState<boolean>(false);

  const payTx = useMemo(() => ({
    chainId: chains.base.id,
    account: address as `0x${string}`,
   
    abi: splitItAbi,
    address: SPLIT_IT_CONTRACT_ADDRESS,
    functionName: "pay",
    args: [
      BigInt(id),
      address,
      GLIDE_RELAYER,
      name,
      comment,
    ],
  }), [address, comment, id, name]);

  const payCrossChain = async () => {
    if (!address) return;
    try {
      setPaymentIsLoading(true);
      const session = await createSession(glideConfig, {
        ...payTx,
        paymentCurrency: selectedPaymentOption ? selectedPaymentOption.paymentCurrency : currencies.usdc.on(chains.base),
        preferGaslessPayment: !isSmartWallet, // awaiting glide to support smart wallet gasless
      });
      await executeSession(glideConfig, {
        session,
        currentChainId: currentChainId as typeof SUPPORTED_CHAINS[number]['id'], 
        switchChainAsync,
        sendTransactionAsync, 
        signTypedDataAsync, 
      });
      onPaymentSuccessful();
    } catch (e) {
      const error = e as Error;
      enqueueSnackbar(error.message.split('\n')[0], { variant: 'error' });
    } finally {
      setPaymentIsLoading(false);
    }
  };

  useEffect(() => {
    if (!address) return;

    const getPaymentOptions = async () => {
      try {
        setPaymentOptionsIsLoading(true);
        const paymentOptions = await listPaymentOptions(glideConfig, payTx);
        console.log({ paymentOptions});
        setPaymentOptions(paymentOptions);
        if (paymentOptions.length === 0) {
          setShowPayEmbed(true);
        }
      } catch (e) {
        console.log({ error: e });
      } finally {
        setPaymentOptionsIsLoading(false);
      }
    }
    void getPaymentOptions();
  }, [address, comment, enqueueSnackbar, id, name, payTx]);

  return (
    <div className="flex flex-col w-full gap-2">
      <div className={`flex items-center w-full bg-primary rounded-r-xl rounded-l-lg`}>
        <button
          onClick={payCrossChain}
          disabled={paymentIsLoading || (!selectedPaymentOption && !usdcBalance)}
          className="btn btn-primary grow rounded-r-none"
        >
          {paymentIsLoading && (
            <div className="loading-spinner loading" />
          )}
          {(!selectedPaymentOption && !usdcBalance) ? (
            'Insufficient Balance...'
          ) : (
            `Pay ${!selectedPaymentOption ? formattedAmount : maxDecimals(selectedPaymentOption.paymentAmount, 4)} ${!selectedPaymentOption ? 'USDC' : selectedPaymentOption.currencySymbol}`
          )}
        </button>
        <label 
          htmlFor={address ? `pay-cross-chain-modal` : 'disabled'}
          className={`btn rounded-l-none down-chevron no-animation ${!address && 'cursor-not-allowed'}`}
        >
          {selectedPaymentOption ? (
            <div className="flex items-center gap-2">
              <div className="relative">
                <Image
                  src={selectedPaymentOption.currencyLogoUrl}
                  alt={selectedPaymentOption.currencyName}
                  className="w-6 h-6 rounded-full"
                  width={24}
                  height={24}
                />
                <Image 
                  src={selectedPaymentOption.chainLogoUrl} 
                  alt={selectedPaymentOption.chainName} 
                  className="w-3 h-3 rounded-full absolute bottom-0 -right-0.5"
                  width={32}
                  height={32}
                />
              </div>
              <div>{selectedPaymentOption.currencySymbol}</div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="relative">
                <Image
                  src={'/images/usdc.png'}
                  alt={'USDC'}
                  className="w-6 h-6 rounded-full"
                  width={24}
                  height={24}
                />
                <Image 
                  src={'https://logo.synthfinance.com/base.org'} 
                  alt={'USDC'} 
                  className="w-3 h-3 rounded-full absolute bottom-0 -right-0.5"
                  width={32}
                  height={32}
                />
              </div>
              <div>USDC</div>
            </div>
          )}
        </label>

        <input type="checkbox" id="pay-cross-chain-modal" className="modal-toggle" />
        <div className="modal modal-bottom sm:modal-middle" role="dialog">
          <div className="modal-box">
            <h3 className="text-lg font-bold mb-2">Select a token</h3>
            <div className="flex flex-col gap-2 h-80 overflow-y-auto">
              {paymentOptionsIsLoading && !paymentOptions.length && Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center w-full justify-between gap-2 cursor-pointer bg-base-200 p-2 rounded-lg">
                  <div className="flex items-center gap-1">
                    <div className="w-8 h-8 rounded-full bg-base-300 animate-pulse" />
                    <div className="flex flex-col gap-1">
                      <span className="w-20 h-4 bg-base-300 animate-pulse rounded-lg" />
                      <span className="w-10 h-3 bg-base-300 animate-pulse rounded-lg" />
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="w-20 h-4 bg-base-300 animate-pulse rounded-lg" />
                    <span className="w-10 h-3 bg-base-300 animate-pulse rounded-lg" />
                  </div>
                </div>
              ))}
              {paymentOptions.map((paymentOption) => (
                <div 
                  key={paymentOption.paymentCurrency} 
                  className="flex items-center w-full justify-between gap-2 cursor-pointer bg-base-200 hover:bg-base-300 p-2 rounded-lg"
                  onClick={() => {
                    setSelectedPaymentOption(paymentOption);
                    document.getElementById('pay-cross-chain-modal')?.click();
                  }}
                >
                  <div className="flex items-center gap-1">
                    <div className="relative">
                      <Image 
                        src={paymentOption.currencyLogoUrl} 
                        alt={paymentOption.currencyName} 
                        className="w-8 h-8 rounded-full"
                        width={32}
                        height={32}
                      />
                      <Image 
                        src={paymentOption.chainLogoUrl} 
                        alt={paymentOption.chainName} 
                        className="w-3 h-3 rounded-full absolute bottom-0 right-0"
                        width={32}
                        height={32}
                      />
                    </div>
                    <div className="flex flex-col">
                      <span>{paymentOption.currencyName}</span>
                      <span className="text-xs opacity-50 -mt-1">{paymentOption.chainName}</span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span>{maxDecimals(paymentOption.balance, 4)}</span>
                    <span className="text-xs opacity-50 -mt-1 text-right">${maxDecimals(paymentOption.balanceUSD, 2)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-action mt-2">
              <label htmlFor="pay-cross-chain-modal" className="btn btn-ghost">Close</label>
            </div>
          </div>
          <label className="modal-backdrop" htmlFor="pay-cross-chain-modal">Close</label>
        </div>
      </div>
      {showPayEmbed ? (
        <div className="relative">
          <button
            className="absolute top-0 right-0 p-2 z-10"
            onClick={() => setShowPayEmbed(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <PayEmbed 
            client={thirdwebClient}
            theme={"light"}
            style={{ width: "100%", backgroundColor: "transparent", border: "none" }}
            payOptions={{
              prefillBuy: {
                token: {
                  address: USDC_ADDRESS,
                  name: "USDC",
                  symbol: "USDC",
                  icon: "/images/usdc.png",
                },
                amount: formattedAmount.replace(/,/g, '').replace(/\$/g, ''),
                chain: base,
                allowEdits: {
                  amount: true, // allow editing buy amount
                  token: true, // disable selecting buy token
                  chain: true, // disable selecting buy chain
                },
              },
              buyWithCrypto: false,
              mode: "fund_wallet",
            }}
          />
        </div>
      ) : (
        <div className="flex w-full justify-center">
          <button
            onClick={() => setShowPayEmbed(true)}
            className="btn btn-ghost btn-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
            </svg>

            Deposit Funds
          </button>
        </div>
      )}
    </div>
  )
};

export default PayCrossChain;
import { chains,createSession, currencies, executeSession, listPaymentOptions, type PaymentOption } from "@paywithglide/glide-js";
import Image from "next/image";
import { useSnackbar } from "notistack";
import { type FC,useEffect,useState } from "react";
import { useAccount, useChainId, useSendTransaction, useSignTypedData,useSwitchChain } from "wagmi";

import { GLIDE_RELAYER, SPLIT_IT_CONTRACT_ADDRESS, type SUPPORTED_CHAINS } from "~/constants";
import { splitItAbi } from "~/constants/abi/splitIt";
import { maxDecimals } from "~/helpers/maxDecimals";
import { glideConfig } from "~/providers/OnchainProviders";

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

  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([]);
  const [paymentOptionsIsLoading, setPaymentOptionsIsLoading] = useState<boolean>(false);
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<PaymentOption>();
  const [paymentIsLoading, setPaymentIsLoading] = useState<boolean>(false);


  const payCrossChain = async () => {
    if (!address) return;
    try {
      setPaymentIsLoading(true);
      const session = await createSession(glideConfig, {
        chainId: chains.base.id,
        account: address as `0x${string}`,
       
        paymentCurrency: selectedPaymentOption ? selectedPaymentOption.paymentCurrency : currencies.usdc.on(chains.base),
        preferGaslessPayment: false,
       
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
        const paymentOptions = await listPaymentOptions(glideConfig, {
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
        });
        console.log({ paymentOptions});
        setPaymentOptions(paymentOptions);
      } catch (e) {
        console.log({ error: e });
      } finally {
        setPaymentOptionsIsLoading(false);
      }
    }
    void getPaymentOptions();
  }, [address, comment, enqueueSnackbar, id, name]);

  return (
    <div className="flex items-center w-full bg-primary rounded-r-xl rounded-l-lg">
      <button
        onClick={payCrossChain}
        disabled={paymentIsLoading}
        className="btn btn-primary grow rounded-r-none"
      >
        {paymentIsLoading && (
          <div className="loading-spinner loading" />
        )}
        {`Pay ${!selectedPaymentOption ? formattedAmount : maxDecimals(selectedPaymentOption.paymentAmount, 4)} ${!selectedPaymentOption ? 'USDC' : selectedPaymentOption.currencySymbol}`}
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
  )
};

export default PayCrossChain;
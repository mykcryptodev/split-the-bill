import { chains,createSession, currencies, estimatePaymentAmount, executeSession, listPaymentOptions, type PaymentOption } from "@paywithglide/glide-js";
import { Elements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe, type Stripe} from '@stripe/stripe-js';
import Image from "next/image";
import { useSnackbar } from "notistack";
import { type FC,useEffect,useMemo,useState } from "react";
import { useAccount, useChainId, useSendTransaction, useSignTypedData,useSwitchChain } from "wagmi";

import PayWithFiat from "~/components/PayWithFiat";
import { GLIDE_RELAYER, GLIDE_SPONSOR_WALLET_ADDRESS, SPLIT_IT_CONTRACT_ADDRESS, type SUPPORTED_CHAINS } from "~/constants";
import { splitItAbi } from "~/constants/abi/splitIt";
import { env } from "~/env";
import { maxDecimals } from "~/helpers/maxDecimals";
import { useIsSmartWallet } from "~/hooks/useIsSmartWallet";
import { glideConfig } from "~/providers/OnchainProviders";
import { api } from "~/utils/api";

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

  const stripe = loadStripe(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  const { mutateAsync: fetchStripePaymentIntent } = api.stripe.getPaymentIntent.useMutation();
  const [stripePaymentIntentClientSecret, setStripePaymentIntentClientSecret] = useState<string>();
  const [stripePaymentAmount, setStripePaymentAmount] = useState<number>();

  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([]);
  const [paymentOptionsIsLoading, setPaymentOptionsIsLoading] = useState<boolean>(false);
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<PaymentOption>();
  const [paymentIsLoading, setPaymentIsLoading] = useState<boolean>(false);

  const railOptions = ["crypto", "credit card"];
  const [selectedRail, setSelectedRail] = useState<string>(railOptions[0]!);


  const payTx = useMemo(() => ({
    chainId: chains.base.id,
   
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
    if (!address || !payTx) return;

    const getPaymentOptions = async () => {
      try {
        setPaymentOptionsIsLoading(true);
        const paymentOptions = await listPaymentOptions(glideConfig, {
          ...payTx,
          account: address as `0x${string}`,
        });
        setPaymentOptions(paymentOptions);
      } catch (e) {
        console.log({ error: e });
      } finally {
        setPaymentOptionsIsLoading(false);
      }
    }

    const getPaymentIntent = async () => {
      console.log("getting intent...");
      const { paymentAmountUSD } = await estimatePaymentAmount(glideConfig, {
        account: GLIDE_SPONSOR_WALLET_ADDRESS,
        // The currency and the chain that the sponsor wallet holds
        paymentCurrency: currencies.usdc.on(chains.base),
        // Optional: Add an extra commission to the transaction to account
        // for the payment processor fees
        commissionUSD: 1,
        // the transaction
        ...payTx,
      });
      // Use the paymentAmountUSD to create a stripe payment intent
      const paymentIntent = await fetchStripePaymentIntent({
        amount: Number(paymentAmountUSD),
      });
      console.log({ paymentIntent });
      if (paymentIntent) {
        setStripePaymentAmount(Number(paymentAmountUSD));
        setStripePaymentIntentClientSecret(paymentIntent);
      }
    }
    void getPaymentOptions();
    void getPaymentIntent();
  }, [address, fetchStripePaymentIntent, payTx]);

  return (
    <div className="flex flex-col gap-2">
      <div role="tablist" className="tabs tabs-boxed mx-auto mb-2">
        {railOptions.map((railOption) => (
          <a 
            key={railOption}
            role="tab"
            className={`tab ${selectedRail === railOption ? 'tab-active' : ''}`}
            onClick={() => setSelectedRail(railOption)}
          >
            {railOption}
          </a>
        ))}
      </div>
      {selectedRail === "credit card" && stripePaymentIntentClientSecret && stripePaymentIntentClientSecret && (
        <Elements 
          stripe={stripe}
          options={{
            clientSecret: stripePaymentIntentClientSecret,
          }}
        >
          <PayWithFiat 
            clientSecret={stripePaymentIntentClientSecret}
          />
        </Elements>
      )}
      {selectedRail === "crypto" && (
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
      )}
    </div>
  )
};

export default PayCrossChain;
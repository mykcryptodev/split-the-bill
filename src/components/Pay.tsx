import {
  Transaction,
  TransactionButton,
  TransactionSponsor,
  TransactionStatus,
  TransactionStatusAction,
  TransactionStatusLabel,
} from '@coinbase/onchainkit/transaction';
import { useEffect, useState, type FC } from "react";
import { useAccount } from 'wagmi';
import { useSendCalls } from 'wagmi/experimental'

import { Wallet } from '~/components/Wallet';
import { AGGREGATOR_ADDRESS, CHAIN, MULTICALL, SPLIT_IT_CONTRACT_ADDRESS, THIRDWEB_CHAIN, TRANSFER_BALANCE_ADDRESS, USDC_ADDRESS, ZERO_ADDRESS } from '~/constants';
import { erc20Abi, isAddressEqual, parseUnits, encodeFunctionData } from 'viem';
import { splitItAbi } from '~/constants/abi/splitIt';
import { type Split } from "~/types/split";
import { Token } from '@coinbase/onchainkit/token';
import { USDC_TOKEN } from '~/constants/defaultTokens';
import { api } from '~/utils/api';
import { useSnackbar } from 'notistack';
import { maxUint256 } from 'thirdweb/utils';
import { TransactionButton as TransactionButtonTw } from 'thirdweb/react';
import { transferHelperAbi } from '~/constants/abi/transferHelper';
import { multicallAbi } from '~/constants/abi/multicall';
import TokenPicker from '~/components/TokenPicker';
import { maxDecimals } from '~/helpers/maxDecimals';
import { getContract, prepareContractCall, prepareTransaction } from 'thirdweb';
import { thirdwebClient } from '~/providers/OnchainProviders';

type Props = {
  id: string;
  split: Split;
  formattedAmount: string;
  name: string;
  comment: string;
  onPaymentSuccessful: () => void;
}

export const Pay: FC<Props> = ({ split, id, formattedAmount, name, comment, onPaymentSuccessful }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { sendCalls } = useSendCalls();
  const { address } = useAccount();
  const [paymentToken, setPaymentToken] = useState<Token>(USDC_TOKEN);
  const [priceInToken, setPriceInToken] = useState<string>('');
  const { data: paymentTokenPrice } = api.simpleHash.getTokenPrice.useQuery({
    address: paymentToken?.address,
  });
  const { mutateAsync: getConversionEncodedData } = api.kyberswap.getConversionData.useMutation();

  useEffect(() => {
    if (paymentTokenPrice) {
      const TWO_AND_A_HALF_PERCENT = 1.025;
      const SLIPPAGE = isAddressEqual(paymentToken.address, USDC_ADDRESS) ? 1 : TWO_AND_A_HALF_PERCENT;
      setPriceInToken(
        ((Number(formattedAmount.replace('$', '')) / paymentTokenPrice) * SLIPPAGE).toString(),
      )
    }
  }, [paymentTokenPrice, paymentToken, split.amountPerPerson]);

  const [isPaymentLoading, setIsPaymentLoading] = useState<boolean>(false);

  const payWithAnyCrypto = async () => {
    if (!address) return;
    setIsPaymentLoading(true);
    try {
      const converTokensToUsdcTx = await getConversionEncodedData({
        from: address,
        to: address,
        chainId: CHAIN.id,
        paymentToken: paymentToken.address,
        paymentAmount: parseUnits(priceInToken, paymentToken.decimals).toString(),
      });
      const calls = [
        {
          to: paymentToken.address as `0x${string}`,
          data: encodeFunctionData({
            abi: erc20Abi,
            functionName: 'approve',
            args: [AGGREGATOR_ADDRESS, parseUnits(priceInToken, paymentToken.decimals)],
          }),
          value: BigInt(0),
        },
        {
          to: AGGREGATOR_ADDRESS as `0x${string}`,
          data: converTokensToUsdcTx.data.data as `0x${string}`,
          value: BigInt(0),
        },
        {
          to: USDC_ADDRESS,
          data: encodeFunctionData({
            abi: erc20Abi,
            functionName: 'approve',
            args: [SPLIT_IT_CONTRACT_ADDRESS, split.amountPerPerson],
          }),
        },
        {
          to: SPLIT_IT_CONTRACT_ADDRESS,
          data: encodeFunctionData({
            abi: splitItAbi,
            functionName: 'pay',
            args: [
              BigInt(id),
              address,
              address,
              name,
              comment,
            ],
          }),
          value: BigInt(0),
        },
      ];
      sendCalls({
        calls,
        capabilities: {
          auxiliaryFunds: {
            supported: true
          },
          paymasterService: {
            url: `https://${CHAIN.id}.bundler.thirdweb.com/${thirdwebClient.clientId}`
          }
        }
      }, {
        onSuccess() {
          void onPaymentSuccessful();
        },
        onError(error) {
          enqueueSnackbar(error.message, { variant: 'error' });
        },
        onSettled() {
          setIsPaymentLoading(false);
        }
      });
    } catch (e) {
      const error = e as Error;
      enqueueSnackbar(error.message, { variant: 'error' });
      setIsPaymentLoading(false);
    }
  }

  if (address && !isAddressEqual(paymentToken.address, USDC_ADDRESS)) {
    return (
      <div className="flex items-center w-full rounded-lg gap-2">
        <button
          onClick={payWithAnyCrypto}
          disabled={isPaymentLoading}
          className="btn btn-primary grow"
        >
          {isPaymentLoading ? (
            <div className="loading-spinner loading" />
          ) : (
            `Pay ${maxDecimals(priceInToken, 2)} ${paymentToken.symbol}`
          )}
        </button>
        <TokenPicker 
          id={`pay-sw-picker`}
          className="h-full min-h-12 pl-4"
          onTokenSelected={setPaymentToken}
          selectedToken={paymentToken}
        />
      </div>
    )
  }

  return address && isAddressEqual(paymentToken.address, USDC_ADDRESS) ? (
    <div className="flex items-center w-full rounded-lg gap-2">
      <Transaction
        address={address}
        chainId={CHAIN.id}
        contracts={[
          {
            address: USDC_ADDRESS,
            abi: erc20Abi,
            functionName: 'approve',
            args: [SPLIT_IT_CONTRACT_ADDRESS, split.amountPerPerson],
          },
          {
            address: SPLIT_IT_CONTRACT_ADDRESS,
            abi: splitItAbi,
            functionName: 'pay',
            args: [
              BigInt(id),
              address,
              address,
              name,
              comment,
            ],
          },
        ]}
        onSuccess={() => void onPaymentSuccessful()}
        onError={(error) => {
          console.log({ error });
          enqueueSnackbar(error.message.split('\n')[0], { variant: 'error' });
        }}
      >
        <TransactionButton 
          text={`Pay ${maxDecimals(priceInToken, 2)} ${paymentToken.symbol}`}
          className="btn btn-primary m-0 mt-2"
        />
        <TransactionSponsor />
        <TransactionStatus>
          <TransactionStatusLabel />
          <TransactionStatusAction />
        </TransactionStatus>
      </Transaction>
      <TokenPicker 
        id={`pay-sw-picker`}
        className="h-full min-h-12 pl-4"
        onTokenSelected={setPaymentToken}
        selectedToken={paymentToken}
      />
    </div>
  ) : (
    <div className="w-full justify-center flex">
      <Wallet />
    </div>
  );
}

export default Pay;
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

  const getPaySplitTx = async () => {
    let addr = address ?? ZERO_ADDRESS;
    if (paymentToken.address === USDC_ADDRESS) {
      return prepareContractCall({
        contract: getContract({
          client: thirdwebClient,
          chain: THIRDWEB_CHAIN,
          address: SPLIT_IT_CONTRACT_ADDRESS,
        }),
        method: "function pay(uint256 _splitId, address _address, address _fundedFrom, string memory _name, string memory _comment) external",
        params: [BigInt(id), addr, addr, name, comment],
      });
    };
    const userTransfersTokensToMulticallTx = encodeFunctionData({
      abi: erc20Abi,
      functionName: "transferFrom",
      args: [addr, MULTICALL, parseUnits(priceInToken, paymentToken.decimals)],
    });
    const multicallApprovesAggregatorTx = encodeFunctionData({
      abi: erc20Abi,
      functionName: "approve",
      args: [AGGREGATOR_ADDRESS, parseUnits(priceInToken, paymentToken.decimals)],
    });
    const multicallConvertsTokensToUsdcTx = await getConversionEncodedData({
      from: MULTICALL,
      to: MULTICALL,
      chainId: CHAIN.id,
      paymentToken: paymentToken.address,
      paymentAmount: parseUnits(priceInToken, paymentToken.decimals).toString(),
    });
    const multicallApprovesSplitItTx = encodeFunctionData({
      abi: erc20Abi,
      functionName: "approve",
      args: [SPLIT_IT_CONTRACT_ADDRESS, parseUnits(priceInToken, paymentToken.decimals)],
    });
    const splitItPayTx = encodeFunctionData({
      abi: splitItAbi,
      functionName: "pay",
      args: [
        BigInt(id),
        addr,
        MULTICALL,
        name,
        comment,
      ],
    });
    const approveTransferHelperTx = encodeFunctionData({
      abi: erc20Abi,
      functionName: "approve",
      args: [TRANSFER_BALANCE_ADDRESS, maxUint256],
    });
    const refundExcessUsdcTx = encodeFunctionData({
      abi: transferHelperAbi,
      functionName: "transferAllBalance",
      args: [USDC_ADDRESS, addr],
    });
    const multicallData = [
      {
        target: paymentToken.address,
        allowFailure: false,
        callData: userTransfersTokensToMulticallTx,
        value: BigInt(0),
      },
      {
        target: paymentToken.address,
        allowFailure: false,
        callData: multicallApprovesAggregatorTx,
        value: BigInt(0),
      },
      {
        target: AGGREGATOR_ADDRESS,
        allowFailure: true,
        callData: multicallConvertsTokensToUsdcTx.data.data as `0x${string}`,        value: BigInt(0),
      },
      {
        target: USDC_ADDRESS,
        allowFailure: false,
        callData: multicallApprovesSplitItTx,
        value: BigInt(0),
      },
      {
        target: SPLIT_IT_CONTRACT_ADDRESS,
        allowFailure: false,
        callData: splitItPayTx,
        value: BigInt(0),
      },
      {
        target: USDC_ADDRESS,
        allowFailure: false,
        callData: approveTransferHelperTx,
        value: BigInt(0),
      },
      {
        target: TRANSFER_BALANCE_ADDRESS,
        allowFailure: false,
        callData: refundExcessUsdcTx,
        value: BigInt(0),
      },
    ];
    const encodedMulticall = encodeFunctionData({
      abi: multicallAbi,
      functionName: "aggregate3Value",
      args: [multicallData],
    });
    return prepareTransaction({
      to: MULTICALL,
      chain: THIRDWEB_CHAIN,
      client: thirdwebClient,
      data: encodedMulticall,
      value: BigInt(0),
    });
  }

  if (address && !isAddressEqual(paymentToken.address, USDC_ADDRESS)) {
    return (
      <div className="flex items-center w-full rounded-lg gap-2">
        <TransactionButtonTw
          transaction={async () =>  await getPaySplitTx()}
          unstyled
          className="btn btn-primary grow"
          onTransactionConfirmed={() => void onPaymentSuccessful()}
          onError={(error) => {
            console.log({ error });
            enqueueSnackbar(error.message.split('\n')[0], { variant: 'error' });
          }}
        >
          {`Pay ${maxDecimals(priceInToken, 2)} ${paymentToken.symbol}`}
        </TransactionButtonTw>
        <TokenPicker 
          id={`pay-sw-picker`}
          className="h-full min-h-12"
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
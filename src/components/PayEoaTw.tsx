import { type FC,useEffect,useMemo, useState } from "react";
import { getContract, prepareContractCall } from 'thirdweb';
import { TransactionButton } from 'thirdweb/react';
import { useAccount, useReadContract } from 'wagmi';
import { sendTransaction, writeContract } from '@wagmi/core';

import { Wallet } from '~/components/Wallet';
import { AGGREGATOR_ADDRESS, CHAIN, MULTICALL, SPLIT_IT_CONTRACT_ADDRESS, THIRDWEB_CHAIN, TRANSFER_BALANCE_ADDRESS, USDC_ADDRESS, ZERO_ADDRESS } from '~/constants';
import { erc20Abi, isAddressEqual, parseUnits, encodeFunctionData } from 'viem';
import { thirdwebClient, wagmiConfig } from '~/providers/OnchainProviders';
import { type Split } from "~/types/split";
import { formatAmount, Token } from "@coinbase/onchainkit/token";
import { USDC_TOKEN } from "~/constants/defaultTokens";
import TokenPicker from "./TokenPicker";
import { api } from "~/utils/api";
import { maxDecimals } from "~/helpers/maxDecimals";
import { splitItAbi } from "~/constants/abi/splitIt";
import { multicallAbi } from "~/constants/abi/multicall";
import { maxUint256 } from "thirdweb/utils";
import { transferHelperAbi } from "~/constants/abi/transferHelper";

type Props = {
  id: string;
  split: Split;
  formattedAmount: string;
  name: string;
  comment: string;
  onPaymentSuccessful: () => void;
}

export const PayEoa: FC<Props> = ({ split, id, formattedAmount, name, comment, onPaymentSuccessful }) => {
  const { address } = useAccount();

  const [paymentToken, setPaymentToken] = useState<Token>(USDC_TOKEN);
  const { mutateAsync: getConversionEncodedData } = api.kyberswap.getConversionData.useMutation();
  const { data: paymentTokenPrice } = api.simpleHash.getTokenPrice.useQuery({
    address: paymentToken?.address,
  });
  const [priceInToken, setPriceInToken] = useState<string>('');
  useEffect(() => {
    if (paymentTokenPrice) {
      const TWO_AND_A_HALF_PERCENT = 1.025;
      const SLIPPAGE = isAddressEqual(paymentToken.address, USDC_ADDRESS) ? 1 : TWO_AND_A_HALF_PERCENT;
      setPriceInToken(
        ((Number(formattedAmount.replace('$', '')) / paymentTokenPrice) * SLIPPAGE).toString(),
      )
    }
  }, [paymentTokenPrice, paymentToken, split.amountPerPerson]);

  const allowanceAddress = useMemo(() => {
    if (isAddressEqual(paymentToken.address, USDC_ADDRESS)) {
      return SPLIT_IT_CONTRACT_ADDRESS;
    }
    return MULTICALL;
  }, [paymentToken.address]);

  console.log({ paymentToken, paymentTokenPrice, priceInToken, formatAmount })

  const { data: allowance, refetch } = useReadContract({
    abi: erc20Abi,
    address: paymentToken.address,
    functionName: "allowance",
    args: [address ?? ZERO_ADDRESS, allowanceAddress],
  });

  const hasSufficientAllowance = useMemo(() => {
    if (!address) return true;
    return allowance && BigInt(allowance) >= parseUnits(priceInToken, paymentToken.decimals);
  }, [address, allowance, paymentToken, priceInToken]);

  if (!hasSufficientAllowance && address) {
    const transaction = prepareContractCall({
      contract: getContract({
        client: thirdwebClient,
        chain: THIRDWEB_CHAIN,
        address: paymentToken.address,
      }),
      method: "function approve(address spender, uint256 value) public returns (bool)",
      params: [allowanceAddress, parseUnits(priceInToken, paymentToken.decimals)],
    });
    return (
      <div className="flex items-center w-full bg-primary rounded-lg">
        <TransactionButton
          transaction={() => transaction}
          unstyled
          className="btn btn-primary grow"
          onTransactionConfirmed={() => void refetch()}
        >
          {`Approve ${maxDecimals(priceInToken, 2)} ${paymentToken.symbol}`}
        </TransactionButton>
        <TokenPicker 
          id={`pay-eoa-picker`}
          className="h-12 rounded-l-none pl-4"
          onTokenSelected={setPaymentToken}
          selectedToken={paymentToken}
        />
      </div>
    );
  }

  const transaction = prepareContractCall({
    contract: getContract({
      client: thirdwebClient,
      chain: THIRDWEB_CHAIN,
      address: SPLIT_IT_CONTRACT_ADDRESS,
    }),
    method: "function pay(uint256 _splitId, address _address, address _fundedFrom, string memory _name, string memory _comment)",
    params: [
      BigInt(id),
      address ?? ZERO_ADDRESS,
      address ?? ZERO_ADDRESS,
      name,
      comment,
    ],
  });

  const handleSendTransaction = async () => {
    if (!address) return;
    const userTransfersTokensToMulticallTx = encodeFunctionData({
      abi: erc20Abi,
      functionName: "transferFrom",
      args: [address, MULTICALL, parseUnits(priceInToken, paymentToken.decimals)],
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
        address,
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
      args: [paymentToken.address, address],
    });
    console.log({ multicallConvertsTokensToUsdcTx });
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
      // {
      //   target: TRANSFER_BALANCE_ADDRESS,
      //   allowFailure: false,
      //   callData: refundExcessUsdcTx,
      //   value: BigInt(0),
      // },
    ];
    const encodedMulticall = encodeFunctionData({
      abi: multicallAbi,
      functionName: "aggregate3Value",
      args: [multicallData],
    });
    // console.log({ encodedMulticall });
    const result = await sendTransaction(wagmiConfig, {
      to: MULTICALL,
      data: encodedMulticall,
      value: BigInt(0),
    });
    // const result = await writeContract(wagmiConfig, {
    //   abi: multicall3Abi,
    //   address: MULTICALL,
    //   functionName: "aggregate3",
    //   args: [multicallData],
    // });
    // const result = await sendTransaction(wagmiConfig, {
    //   to: AGGREGATOR_ADDRESS,
    //   data: conversionTransaction.data.data as `0x${string}`,
    //   value: BigInt(0),
    // });
    console.log({ result });
  }

  return address ? (
    <div className="flex items-center w-full bg-primary rounded-lg">
      {/* <TransactionButton
        transaction={async () => {
          // return {
          //   to: MULTICALL,
          //   data: encodedMulticall,
          //   value: 0,
          // }
          const conversionTransaction = await getConversionEncodedData({
            from: address,
            to: MULTICALL,
            chainId: CHAIN.id,
            paymentToken: paymentToken.address,
            paymentAmount: parseUnits(priceInToken, paymentToken.decimals).toString(),
          });
          const multicallData = [
            {
              target: AGGREGATOR_ADDRESS,
              allowFailure: false,
              callData: conversionTransaction.data.data as `0x${string}`,
            },
            {
              target: USDC_ADDRESS,
              allowFailure: false,
              callData: encodeFunctionData({
                abi: erc20Abi,
                functionName: "approve",
                args: [SPLIT_IT_CONTRACT_ADDRESS, parseUnits(priceInToken, paymentToken.decimals)],
              }),
            },
            {
              target: SPLIT_IT_CONTRACT_ADDRESS,
              allowFailure: false,
              callData: encodeFunctionData({
                abi: splitItAbi,
                functionName: "pay",
                args: [
                  BigInt(id),
                  address,
                  MULTICALL,
                  name,
                  comment,
                ],
              }),
            }
          ];
          const multicall = prepareContractCall({
            contract: getContract({
              client: thirdwebClient,
              chain: THIRDWEB_CHAIN,
              address: MULTICALL,
            }),
            method: "function aggregate3(bytes[] calls)",
            params: [multicallData],
          });
          console.log({ multicallData, multicall });
          return multicall;
          // return transaction;
        }}
        unstyled
        className="btn btn-primary grow"
        onError={(error) => console.error({ error })}
        onTransactionConfirmed={() => void onPaymentSuccessful()}
      >
        {`Pay ${maxDecimals(priceInToken, 2)} ${paymentToken.symbol}`}
      </TransactionButton> */}
      <button
        onClick={handleSendTransaction}
        className="btn btn-primary grow"
      >
        {`Pay ${maxDecimals(priceInToken, 2)} ${paymentToken.symbol}`}
      </button>
      <TokenPicker 
        id={`pay-eoa-picker`}
        className="h-12 rounded-l-none pl-4"
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

export default PayEoa;
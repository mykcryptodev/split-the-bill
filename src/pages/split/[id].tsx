import { Avatar, Name } from "@coinbase/onchainkit/identity";
import { type GetServerSideProps, type NextPage } from "next";
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from "react";
import { formatUnits, isAddressEqual } from "viem";
import { useAccount, useReadContract } from 'wagmi';

import Pay from "~/components/Pay";
import { PayEoa } from "~/components/PayEoaTw";
import Payments from "~/components/Payments";
import { Share } from "~/components/Share";
import SuccessfulPayment from "~/components/SuccessfulPayment";
import { SPLIT_IT_CONTRACT_ADDRESS, USDC_DECIMALS } from "~/constants";
import { splitItAbi } from "~/constants/abi/splitIt";
import { transformSplit } from "~/helpers/transformSplit";
import { useIsSmartWallet } from "~/hooks/useIsSmartWallet";
import { type Payment } from "~/types/split";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const id = ctx.params?.id as string;
  return {
    props: {
      id,
    },
  };
}

type Props = {
  id: string;
}

export const Split: NextPage<Props> = ({ id }) => {
  const { enqueueSnackbar } = useSnackbar();
  const { data, refetch: refetchSplit } = useReadContract({
    abi: splitItAbi,
    address: SPLIT_IT_CONTRACT_ADDRESS,
    functionName: "splits",
    args: [BigInt(id)],
  });
  const split = transformSplit(data);

  const { data: payments, refetch: refetchPayments } = useReadContract({
    abi: splitItAbi,
    address: SPLIT_IT_CONTRACT_ADDRESS,
    functionName: "getPayments",
    args: [BigInt(id)],
  });

  const splitIsFullyPaid = useMemo(() => {
    if (!payments) return false;
    // count the number of payments, multiply it by the amount per person
    // if that number is equal to the total amount, then the split is paid
    const totalPaid = BigInt(payments.length) * split.amountPerPerson;
    return totalPaid >= split.totalAmount;
  }, [payments, split]);

  const { address } = useAccount();
  const isSmartWallet = useIsSmartWallet();

  const formattedAmount = Number(formatUnits(split.amountPerPerson, USDC_DECIMALS)).toLocaleString([], {
    style: 'currency',
    currency: 'USD',
  });

  const [showInputs, setShowInputs] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [comment, setComment] = useState<string>('');

  const [showPayButton, setShowPayButton] = useState<boolean>(true);
  const [userHasPaid, setUserHasPaid] = useState<boolean>(false);

  useEffect(() => {
    if (!address || !payments) return;
    const hasPaid = payments.some((payment) => isAddressEqual(payment.payer, address));
    setUserHasPaid(hasPaid);
  }, [payments, address]);

  useEffect(() => {
    if (userHasPaid && showPayButton) {
      setShowPayButton(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userHasPaid]);

  const refetchAndPopNotification = () => {
    setUserHasPaid(true);
    setShowPayButton(false);
    setShowInputs(false);
    enqueueSnackbar('Payment successful', { variant: 'success' });
    // wait 5s for the transaction index and refetch
    setTimeout(() => {
      console.log('refetching...');
      void refetchSplit();
      void refetchPayments();
    }, 5000);
  }
  
  return (
    <div className="flex flex-col gap-1 mt-4">
      <div className="flex w-full justify-center relative">
        <div className="flex items-center gap-1">
          <Avatar
            address={split.creator}
            className="h-6 w-6"
          />
          {split.creatorName ? (
            <span className="font-bold text-lg">{split.creatorName}</span>
          ) : (
            <Name address={split.creator} />
          )}
        </div>
        <div className="absolute right-0">
          <Share splitId={id} split={split} formattedAmount={formattedAmount} />
        </div>
      </div>
      <div className="text-center text-sm">is requesting</div>
      <div className="text-center text-2xl font-bold">
        {formattedAmount} USDC
      </div>
      {split.billName && (
        <div className="text-center text-sm">for {split.billName}</div>
      )}
      {splitIsFullyPaid && (
        <div className="badge badge-success mx-auto">fully paid</div>
      )}
      <div className="my-2" />
      {showPayButton && (
        <button
          className={`btn btn-primary ${showInputs || !address ? 'hidden' : ''}`}
          onClick={() => setShowInputs(true)}
        >
          {`Pay ${formattedAmount}`}
        </button>
      )}
      <SuccessfulPayment 
        onPayAgain={() => setShowPayButton(true)}
        splitIsFullyPaid={splitIsFullyPaid}
        hide={showPayButton}
      />
      {showInputs && (
        <div className="my-2">
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Your Name</span>
            </div>
            <input 
              type="text" 
              placeholder="Type here" 
              className="input input-bordered w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Comment</span>
            </div>
            <textarea 
              placeholder="Type here" 
              className="textarea textarea-bordered w-full"
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="label">
              <span />
              <span className="label-text-alt flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m6.115 5.19.319 1.913A6 6 0 0 0 8.11 10.36L9.75 12l-.387.775c-.217.433-.132.956.21 1.298l1.348 1.348c.21.21.329.497.329.795v1.089c0 .426.24.815.622 1.006l.153.076c.433.217.956.132 1.298-.21l.723-.723a8.7 8.7 0 0 0 2.288-4.042 1.087 1.087 0 0 0-.358-1.099l-1.33-1.108c-.251-.21-.582-.299-.905-.245l-1.17.195a1.125 1.125 0 0 1-.98-.314l-.295-.295a1.125 1.125 0 0 1 0-1.591l.13-.132a1.125 1.125 0 0 1 1.3-.21l.603.302a.809.809 0 0 0 1.086-1.086L14.25 7.5l1.256-.837a4.5 4.5 0 0 0 1.528-1.732l.146-.292M6.115 5.19A9 9 0 1 0 17.18 4.64M6.115 5.19A8.965 8.965 0 0 1 12 3c1.929 0 3.716.607 5.18 1.64" />
                </svg>
                Public
              </span>
            </div>
          </label>
          {isSmartWallet ? (
            <Pay 
              split={split} 
              id={id} 
              formattedAmount={formattedAmount}
              name={name}
              comment={comment}
              onPaymentSuccessful={() => void refetchAndPopNotification()}
            />
          ) : (
            <PayEoa 
              split={split} 
              id={id}  
              formattedAmount={formattedAmount} 
              name={name}
              comment={comment}
              onPaymentSuccessful={() => void refetchAndPopNotification()}
            />
          )}
          {/* <PayAnyCrypto 
            split={split} 
            id={id}  
            formattedAmount={formattedAmount} 
            name={name}
            comment={comment}
            onPaymentSuccessful={() => void refetch()}
          /> */}
        </div>
      )}
      <div className="my-2" />
      <Payments payments={payments as Payment[] | undefined} />
    </div>
  );
}

export default Split;
import { Avatar, Name } from "@coinbase/onchainkit/identity";
import { type FC } from "react";
import { useEnsName } from "thirdweb/react";
import { thirdwebClient } from "~/providers/OnchainProviders";

import { type Payment } from "~/types/split";

type Props = {
  payments: Payment[] | undefined;
}
export const Payments: FC<Props> = ({ payments }) => {
  const DisplayedName: FC<{ payment: Payment, className?:string }> = ({ payment, className }) => {
    // ens is not working if using the wagmi hook, must use thirdweb
    const { data: ensName } = useEnsName({ 
      client: thirdwebClient,
      address: payment.payer, 
    });
    console.log({
      ensName,
      payment,
    })
    if (ensName?.toLowerCase() === payment.name.toLowerCase()) {
      return <span className={className}>{payment.payer}</span>
    }
    if (!payment.name) {
      return (
        <Name address={payment.payer} className={className} />
      )
    }
    return (
      <div className="flex items-center">
        <span>{payment.name}</span>
        <span className="mx-1">•</span>
        <Name address={payment.payer} className={className} />
      </div>
    )
  };
  if (!payments?.length) return null;
  return (
    <div className="flex flex-col gap-2 mb-8">
      <h2 className="text-sm font-semibold leading-6">Activity</h2>
      <ul role="list" className="space-y-6">
        {payments?.map((payment, i) => (
          <li key={`${payment.payer}-${i}`} className="relative flex gap-x-4">
            <div
              className={classNames(
                i === 0 ? 'h-6' : '-bottom-6',
                'absolute left-0 top-0 flex w-6 justify-center',
              )}
            >
              <div className="w-px bg-base-300" />
            </div>
            {payment.comment !== '' ? (
              <>
                <Avatar
                  address={payment.payer}
                  className="relative mt-3 h-6 w-6 flex-none rounded-full bg-base-100"
                />
                <div className="flex-auto rounded-md p-3 ring-1 ring-inset ring-base-300">
                  <div className="flex justify-between gap-x-4">
                    <div className="py-0.5 text-xs leading-5 text-opacity-50">
                      <DisplayedName payment={payment} className="text-xs font-medium" />
                    </div>
                    <time
                      dateTime={new Date(Number(payment.timestamp) * 1000).getTime().toString()}
                      className="flex-none py-0.5 text-xs leading-5 opacity-50"
                    >
                      {new Date(Number(payment.timestamp) * 1000).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                      })}
                    </time>
                  </div>
                  <p className="text-sm leading-6 text-gray-500">{payment.comment}</p>
                </div>
              </>
            ) : (
              <>
                <Avatar
                  address={payment.payer}
                  className="relative h-6 w-6 flex-none rounded-full bg-base-100"
                />
                <p className="flex-auto py-0.5 text-xs leading-5">
                  <DisplayedName payment={payment} className="font-medium text-xs" />{' '}
                  <span className="opacity-50">paid the split</span>
                </p>
                <time
                  dateTime={new Date(Number(payment.timestamp) * 1000).getTime().toString()}
                  className="flex-none py-0.5 text-xs leading-5 opacity-50"
                >
                  {new Date(Number(payment.timestamp) * 1000).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                  })}
                </time>
              </>
            )}
          </li>
        )).reverse()}
      </ul>
    </div>
  );
};

export default Payments;

function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
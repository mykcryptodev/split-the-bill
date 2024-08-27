import { Avatar, Name } from "@coinbase/onchainkit/identity";
import Link from "next/link";
import React from "react";
import { type FC } from "react";

import { classNames } from "~/helpers/classNames";
import { api } from '~/utils/api';

const Feed: FC = () => {
  const { data, isLoading } = api.split.getFeed.useQuery();
  console.log({ data, isLoading });

  return (
    <div className="flex flex-col gap-2 mb-8 w-full max-w-md">
      <h2 className="text-sm font-semibold leading-6">Feed</h2>
      <ul role="list" className="space-y-6">         
        {data?.map((split, i) => {
          if (!split.payment) {
            return (
              <li key={split.id}>
                <Link 
                  href={`/split/${split.id}`}
                  className="relative flex flex-col gap-x-4 text-sm"
                >
                  <div
                    className={classNames(
                      i === data.length - 1 ? 'h-6' : '-bottom-6',
                      'absolute left-0 top-0 flex w-6 justify-center',
                    )}
                  >
                    <div className="w-px bg-base-300" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Avatar
                      address={split.creator}
                      className="relative h-6 w-6 flex-none rounded-full bg-base-100"
                    />
                    <div className="flex gap-1 py-0.5 leading-5">
                      {split.creatorName ? split.creatorName : <Name address={split.creator} className="font-normal text-sm" />}
                      <span className="opacity-50">requested a split</span>
                    </div>
                  </div>
                  {split.billName && (
                    <div className="pl-7 opacity-50">{split.billName}</div>
                  )}
                  <time
                    dateTime={new Date(Number(split.timestamp) * 1000).getTime().toString()}
                    className="flex-none py-0.5 text-xs leading-5 opacity-50 text-end"
                  >
                    {new Date(Number(split.timestamp) * 1000).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: 'numeric',
                    })}
                  </time>
                </Link>
              </li>
            );
          }
          if (split.payment) return (
            <li key={`${split.id}-${split.payment.id}`}>
              <Link 
                href={`/split/${split.id}`}
                className="relative flex flex-col gap-x-4 w-full text-sm"
              >
                <div
                  className={classNames(
                    i === data.length - 1 ? 'h-6' : '-bottom-6',
                    'absolute left-0 top-0 flex w-6 justify-center',
                  )}
                >
                  <div className="w-px bg-base-300" />
                </div>
                <div className="flex items-center gap-1">
                  <Avatar
                    address={split.payment.payee}
                    className="relative h-6 w-6 flex-none rounded-full bg-base-100"
                  />
                  <div className="flex items-center gap-1 py-0.5 leading-5">
                    {split.payment.payeeName ? split.payment.payeeName : <Name address={split.payment.payee} className="font-normal text-sm" />}
                    <span className="opacity-50">paid</span>
                    <span>{split.creatorName}</span>
                  </div>
                </div>
                {split.payment.comment && (
                  <div className="pl-7 opacity-50">{split.payment.comment}</div>
                )}
                <time
                  dateTime={new Date(Number(split.timestamp) * 1000).getTime().toString()}
                  className="flex-none py-0.5 text-xs leading-5 opacity-50 text-end"
                >
                  {new Date(Number(split.timestamp) * 1000).toLocaleDateString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                  })}
                </time>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  );
};

export default Feed;

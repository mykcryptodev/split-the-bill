import Head from "next/head";
import Link from "next/link";

import { APP_NAME } from "~/constants";

export default function Home() {
  return (
    <>
      <Head>
        <title>{APP_NAME}</title>
        <meta name="description" content="Split the bill with your friends" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Split <span className="text-primary">The</span> Bill
          </h1>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
              href="/create"
            >
              <h3 className="text-2xl font-bold">Create New Split</h3>
              <div className="text-lg">
                Split a bill with your friends
              </div>
            </Link>
            <Link
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
              href="/split/join"
            >
              <h3 className="text-2xl font-bold">Pay Split →</h3>
              <div className="text-lg">
                Pay your share of the bill
              </div>
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

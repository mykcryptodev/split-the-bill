import { type FC, type ReactNode } from "react";

import { Wallet } from "~/components/Wallet";
import { useAccount } from "wagmi";
import Image from "next/image";
import Link from "next/link";

type Props = {
  children: ReactNode;
};

export const Layout: FC<Props> = ({ children }) => {
  const { address } = useAccount();
  return (
    <div className="w-full h-full min-h-screen min-w-screen bg-gradient-to-b from-[#DCCFBF] via-[#fff6eb] to-[#fffcf9]">
      <div className="flex flex-col gap-2 max-w-2xl mx-auto px-2">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto my-4 mb-20">
          <Link href="/">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Image src="/images/logo.png" width={48} height={48} alt="Split The Bill Logo" />
              <span className="sm:flex hidden">Split The Bill</span>
            </h1>
          </Link>
          <div className="flex items-center gap-2">
            <Wallet />
          </div>
        </div>
        <div className="container mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
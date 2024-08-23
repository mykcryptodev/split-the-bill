import { type FC, type ReactNode } from "react";

import { Wallet } from "~/components/Wallet";
import { useAccount } from "wagmi";
import Image from "next/image";
import Link from "next/link";
import { APP_NAME } from "~/constants";

type Props = {
  children: ReactNode;
};

export const Layout: FC<Props> = ({ children }) => {
  const { address } = useAccount();
  return (
    <div>
      <div className="bg-[#fffcf9] h-full w-full fixed -z-10" />
      <div className="w-full max-h-72 min-w-screen bg-gradient-to-b from-[#DCCFBF] via-[#fff6eb] to-[#fffcf9]">
        <div className="flex flex-col gap-2 max-w-2xl mx-auto px-2">
          <div className="flex items-center justify-between w-full max-w-7xl mx-auto my-4 mb-20">
            <Link href="/">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Image src="/images/icon.png" width={48} height={48} alt={`${APP_NAME} Logo`} />
                <span className="sm:flex hidden">{APP_NAME}</span>
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
    </div>
  );
};

export default Layout;
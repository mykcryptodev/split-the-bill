import { isWalletACoinbaseSmartWallet } from "@coinbase/onchainkit/wallet";
import type { UserOperation } from 'permissionless';
import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";

import { publicClient } from "~/providers/OnchainProviders";

export const useIsSmartWallet = () => {
  const { address } = useAccount();

  const userOp = useMemo(() => {
    return { sender: address } as UserOperation<'v0.6'>;
  }, [address]); 

  const [isSmartWallet, setIsSmartWallet] = useState<boolean>(false);

  useEffect(() => {
    const detectIfWalletIsSmartWallet = async () => {
      const smartWalletCheck = await isWalletACoinbaseSmartWallet({ client: publicClient, userOp });
      console.log('isSmartWallet', smartWalletCheck);
      setIsSmartWallet(smartWalletCheck.isCoinbaseSmartWallet);
    };
    void detectIfWalletIsSmartWallet();
  }, [address, userOp]);

  return isSmartWallet;
}
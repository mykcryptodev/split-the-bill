import { isWalletACoinbaseSmartWallet } from "@coinbase/onchainkit/wallet";
import type { UserOperation } from 'permissionless';
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { publicClient } from "~/providers/OnchainProviders";

export const useIsSmartWallet = () => {
  const { address } = useAccount();

  const userOp = { sender: address } as UserOperation<'v0.6'>;

  const [isSmartWallet, setIsSmartWallet] = useState<boolean>(false);

  useEffect(() => {
    const detectIfWalletIsSmartWallet = async () => {
      const smartWalletCheck = await isWalletACoinbaseSmartWallet({ client: publicClient, userOp });
      console.log('isSmartWallet', smartWalletCheck);
      setIsSmartWallet(smartWalletCheck.isCoinbaseSmartWallet);
    };
    void detectIfWalletIsSmartWallet();
  }, [address]);

  return isSmartWallet;
}
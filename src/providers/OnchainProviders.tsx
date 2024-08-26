import { OnchainKitProvider } from '@coinbase/onchainkit';
import { createGlideConfig } from "@paywithglide/glide-js";
import {
  connectorsForWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import {
  coinbaseWallet,
  metaMaskWallet,
  rainbowWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { createThirdwebClient } from 'thirdweb';
import { ThirdwebProvider } from 'thirdweb/react';
import { createPublicClient, http as viemHttp } from "viem";
import { type PublicClient } from "viem";
import { createConfig, http,WagmiProvider } from 'wagmi';

import { APP_NAME, CHAIN, CHAIN_RPC, SUPPORTED_CHAINS } from '~/constants';
import { env } from '~/env';
import { getThirdwebChain } from '~/helpers/getThirdwebChain';

import '@coinbase/onchainkit/styles.css';
import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();
 
const connectors = connectorsForWallets( 
  [
    {
      groupName: 'Recommended Wallet',
      wallets: [coinbaseWallet],
    },
    {
      groupName: 'Other Wallets',
      wallets: [
        rainbowWallet, 
        metaMaskWallet, 
        walletConnectWallet,
      ],
    },
  ],
  {
    appName: APP_NAME,
    projectId: env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
  },
); 
 
export const wagmiConfig = createConfig({
  connectors,
  chains: SUPPORTED_CHAINS,
  syncConnectedChain: true,
  transports: {
    1: http(getThirdwebChain(1).rpc),       // Ethereum Mainnet
    10: http(getThirdwebChain(10).rpc),      // Optimism
    137: http(getThirdwebChain(137).rpc),     // Polygon
    42161: http(getThirdwebChain(42161).rpc),   // Arbitrum
    43114: http(getThirdwebChain(43114).rpc),   // Avalanche
    8453: http(CHAIN_RPC),    // Base
    84532: http(CHAIN_RPC),   // Base Sepolia
  },
});

export const publicClient = createPublicClient({
  chain: CHAIN,
  transport: viemHttp(CHAIN_RPC),
}) as PublicClient;

export const thirdwebClient = createThirdwebClient({
  clientId: env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
});

export const glideConfig = createGlideConfig({
  projectId: env.NEXT_PUBLIC_GLIDE_PROJECT_ID,
  chains: SUPPORTED_CHAINS,
});

type Props = {
  children: React.ReactNode;
}

function OnchainProviders({ children }: Props) {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={CHAIN}
        >
          <RainbowKitProvider modalSize="compact">
            <ThirdwebProvider>
              {children}
            </ThirdwebProvider>
          </RainbowKitProvider>
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
} 
 
export default OnchainProviders;
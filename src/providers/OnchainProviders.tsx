import { OnchainKitProvider } from '@coinbase/onchainkit';
import {
  RainbowKitProvider,
  connectorsForWallets,
} from '@rainbow-me/rainbowkit';
import {
  coinbaseWallet,
  metaMaskWallet,
  rainbowWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createPublicClient, http as viemHttp } from "viem";
import { WagmiProvider, createConfig, http } from 'wagmi';
 
import '@coinbase/onchainkit/styles.css';
import '@rainbow-me/rainbowkit/styles.css';
import { useEffect, useState } from 'react';
import { createThirdwebClient } from 'thirdweb';
import { ThirdwebProvider } from 'thirdweb/react';
import { type PublicClient } from "viem";
import { APP_NAME, CHAIN } from '~/constants';
import { env } from '~/env';

const queryClient = new QueryClient();
 
const connectors = connectorsForWallets( 
  [
    {
      groupName: 'Recommended Wallet',
      wallets: [coinbaseWallet],
    },
    {
      groupName: 'Other Wallets',
      wallets: [rainbowWallet, metaMaskWallet],
    },
  ],
  {
    appName: APP_NAME,
    projectId: env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID,
  },
); 
 
export const wagmiConfig = createConfig({
  connectors,
  chains: [CHAIN],
  transports: {
    [CHAIN.id]: http(),
  },
});

export const publicClient = createPublicClient({
  chain: CHAIN,
  transport: viemHttp(),
}) as PublicClient;

export const thirdwebClient = createThirdwebClient({
  clientId: env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
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
          apiKey={process.env.PUBLIC_ONCHAINKIT_API_KEY}
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
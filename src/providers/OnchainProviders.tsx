import { OnchainKitProvider } from '@coinbase/onchainkit';
import { 
  RainbowKitProvider, 
  connectorsForWallets,
} from '@rainbow-me/rainbowkit'; 
import { 
  metaMaskWallet, 
  rainbowWallet, 
  coinbaseWallet, 
} from '@rainbow-me/rainbowkit/wallets'; 
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { createPublicClient, http as viemHttp } from "viem";
 
import '@coinbase/onchainkit/styles.css';
import '@rainbow-me/rainbowkit/styles.css'; 
import { APP_NAME, CHAIN } from '~/constants';
import { env } from '~/env';
import { type PublicClient } from "viem";

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

type Props = {
  children: React.ReactNode;
}

function OnchainProviders({ children }: Props) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={process.env.PUBLIC_ONCHAINKIT_API_KEY}
          chain={CHAIN}
        >
          <RainbowKitProvider modalSize="compact">
            {children}
          </RainbowKitProvider>
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
} 
 
export default OnchainProviders;
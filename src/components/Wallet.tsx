import {
  Address,
  Avatar,
  EthBalance,
  Identity,
  Name,
} from '@coinbase/onchainkit/identity';
import { color } from '@coinbase/onchainkit/theme';
import {
  ConnectWallet,
  Wallet as WalletComponent,
  WalletDropdown,
  WalletDropdownDisconnect,
  WalletDropdownFundLink,
  WalletDropdownLink,
} from '@coinbase/onchainkit/wallet';
import { useEffect } from 'react';
import { defineChain } from 'thirdweb';
import { viemAdapter } from "thirdweb/adapters/viem";
import { useSetActiveWallet } from 'thirdweb/react';
import { createWalletAdapter } from 'thirdweb/wallets';
import { useDisconnect, useSwitchChain, useWalletClient, useAccount } from "wagmi";

import { thirdwebClient } from '~/providers/OnchainProviders';
import Balance from './Balance';
import { USDC_ADDRESS } from '~/constants';

export function Wallet() {
  const { address } = useAccount();

  const setActiveWallet = useSetActiveWallet();
  const { data: walletClient } = useWalletClient();
  const { disconnectAsync } = useDisconnect();
  const { switchChainAsync } = useSwitchChain();

  useEffect(() => {
    const setActive = async () => {
      if (walletClient) {
        // adapt the walletClient to a thirdweb account
        const adaptedAccount = viemAdapter.walletClient.fromViem({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
          walletClient: walletClient as any, // accounts for wagmi/viem version mismatches
        });
        // create the thirdweb wallet with the adapted account
        const thirdwebWallet = createWalletAdapter({
          client: thirdwebClient,
          adaptedAccount,
          chain: defineChain(await walletClient.getChainId()),
          onDisconnect: async () => {
            await disconnectAsync();
          },
          switchChain: async (chain) => {
            await switchChainAsync({ chainId: chain.id });
          },
        });
        console.log({ thirdwebWallet });
        void setActiveWallet(thirdwebWallet);
      }
    };
    void setActive();
  }, [disconnectAsync, setActiveWallet, switchChainAsync, walletClient]);

  return (
    <div className="flex">
      <WalletComponent>
        <ConnectWallet withWalletAggregator>
          <div className="flex items-center gap-1">
            <Avatar className="h-6 w-6" />
            <Name />
            {address && (<Balance className="ml-2" token={USDC_ADDRESS} address={address} />)}
          </div>
        </ConnectWallet>
        <WalletDropdown>
          <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
            <Avatar />
            <Name />
            <Address className={color.foregroundMuted} />
            <EthBalance />
          </Identity>
          <WalletDropdownLink
            href="/my"
            rel="noopener noreferrer"
          >
            My Splits
          </WalletDropdownLink>
          <WalletDropdownLink icon="wallet" href="https://wallet.coinbase.com">
            Wallet
          </WalletDropdownLink>
          <WalletDropdownFundLink />
          <WalletDropdownDisconnect />
        </WalletDropdown>
      </WalletComponent>
    </div>
  );
}
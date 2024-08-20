import { 
  ConnectWallet, 
  Wallet as WalletComponent, 
  WalletDropdown, 
  WalletDropdownLink,
  WalletDropdownFundLink,
  WalletDropdownDisconnect, 
} from '@coinbase/onchainkit/wallet'; 
import {
  Address,
  Avatar,
  Name,
  Identity,
  EthBalance,
} from '@coinbase/onchainkit/identity';
import { color } from '@coinbase/onchainkit/theme';
 
export function Wallet() {
  return (
    <div className="flex justify-end">
      <WalletComponent>
        <ConnectWallet withWalletAggregator>
          <Avatar className="h-6 w-6" />
          <Name />
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
import { type FC } from 'react';
import { getContract, prepareContractCall, ZERO_ADDRESS } from 'thirdweb';
import { TransactionButton } from 'thirdweb/react';
import { parseUnits } from 'viem';
import { useAccount } from 'wagmi';

import { Wallet } from '~/components/Wallet';
import { SPLIT_IT_CONTRACT_ADDRESS, THIRDWEB_CHAIN, USDC_DECIMALS } from '~/constants';
import { thirdwebClient } from '~/providers/OnchainProviders';

type Props = {
  isDisabled: boolean;
  totalAmount: number;
  amountPerPerson: number;
  name?: string;
  title?: string;
  onSplitCreated: () => void;
}

const CreateSplitEoaTw: FC<Props> = ({ 
  totalAmount = 0, 
  amountPerPerson = 0,
  name = '',
  title = '',
  onSplitCreated, 
  isDisabled
}) => {
  const { address } = useAccount();

  const transaction = prepareContractCall({
    contract: getContract({
      client: thirdwebClient,
      chain: THIRDWEB_CHAIN,
      address: SPLIT_IT_CONTRACT_ADDRESS,
    }),
    method: "function createSplit(address _creator, string _creatorName, string _billName, uint256 _totalAmount, uint256 _amountPerPerson) public",
    params: [
      address ?? ZERO_ADDRESS,
      name,
      title,
      BigInt(parseUnits(totalAmount.toString(), USDC_DECIMALS)),
      BigInt(parseUnits(amountPerPerson.toString(), USDC_DECIMALS)),
    ],
  });
 
  return address ? (
    <TransactionButton
      disabled={isDisabled}
      transaction={() => transaction}
      unstyled
      className="btn btn-primary btn-block"
      onTransactionConfirmed={() => onSplitCreated()}
    >
      Split The Bill
    </TransactionButton>
  ) : (
    <div className="w-full justify-center flex">
      <Wallet />
    </div>
  );
}

export default CreateSplitEoaTw;
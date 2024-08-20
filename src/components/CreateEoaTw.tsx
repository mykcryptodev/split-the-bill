import { FC } from 'react';
import { getContract, prepareContractCall, ZERO_ADDRESS } from 'thirdweb';
import { TransactionButton } from 'thirdweb/react';
import { TransactionReceipt } from 'thirdweb/transaction';
import { parseUnits } from 'viem';
import { useAccount } from 'wagmi';
import { Wallet } from '~/components/Wallet';
import { SPLIT_IT_CONTRACT_ADDRESS, THIRDWEB_CHAIN, USDC_DECIMALS } from '~/constants';
import { thirdwebClient } from '~/providers/OnchainProviders';

type Props = {
  totalAmount: number;
  amountPerPerson: number;
  onSplitCreated: (receipt: TransactionReceipt) => void;
}

const CreateSplitEoaTw: FC<Props> = ({ totalAmount = 0, amountPerPerson = 0, onSplitCreated }) => {
  const { address } = useAccount();

  const transaction = prepareContractCall({
    contract: getContract({
      client: thirdwebClient,
      chain: THIRDWEB_CHAIN,
      address: SPLIT_IT_CONTRACT_ADDRESS,
    }),
    method: "function createSplit(address _creator, uint256 _totalAmount, uint256 _amountPerPerson) public",
    params: [
      address ?? ZERO_ADDRESS,
      BigInt(parseUnits(totalAmount.toString(), USDC_DECIMALS)),
      BigInt(parseUnits(amountPerPerson.toString(), USDC_DECIMALS)),
    ],
  });
 
  return address ? (
    <TransactionButton
      transaction={() => transaction}
      unstyled
      className="btn btn-primary btn-block"
      onTransactionConfirmed={(receipt) => onSplitCreated(receipt)}
    >
      Split The Bill
    </TransactionButton>
  ) : (
    <Wallet />
  );
}

export default CreateSplitEoaTw;
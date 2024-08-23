export type Split = {
  creator: `0x${string}`;
  creatorName?: string;
  billName?: string;
  totalAmount: bigint;
  amountPerPerson: bigint;
  totalPaid: bigint;
  timestamp: bigint;
}

export type Payment = {
  payer: string;
  name: string;
  comment: string;
  timestamp: bigint;
}
export type TokenPriceResponse = {
  fungible_id: string;
  name: string;
  symbol: string;
  decimals: number;
  chain: string;
  prices: {
    marketplace_id: string;
    marketplace_name: string;
    value_usd_cents: number;
    value_usd_string: string;
  }[];
};
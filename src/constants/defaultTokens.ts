import { type Token } from "@coinbase/onchainkit/token";

import { CHAIN, USDC_ADDRESS, USDC_DECIMALS } from "~/constants";

export const ETH_TOKEN: Token = {
  address: '',
  chainId: CHAIN.id,
  decimals: 18,
  image:
    'https://dynamic-assets.coinbase.com/dbb4b4983bde81309ddab83eb598358eb44375b930b94687ebe38bc22e52c3b2125258ffb8477a5ef22e33d6bd72e32a506c391caa13af64c00e46613c3e5806/asset_icons/4113b082d21cc5fab17fc8f2d19fb996165bcce635e6900f7fc2d57c4ef33ae9.png',
  name: 'Ethereum',
  symbol: 'ETH',
};

export const USDC_TOKEN: Token = {
  address: USDC_ADDRESS,
  chainId: CHAIN.id,
  decimals: USDC_DECIMALS,
  image: "/images/usdc.png",
  name: 'USD Coin',
  symbol: 'USDC',
};

const BRETT: Token = {
  address: "0x532f27101965dd16442e59d40670faf5ebb142e4",
  chainId: CHAIN.id,
  decimals: 18,
  image: "https://s2.coinmarketcap.com/static/img/coins/64x64/29743.png",
  name: 'Brett',
  symbol: 'BRETT',
};

const MOCHI: Token = {
  address: "0xf6e932ca12afa26665dc4dde7e27be02a7c02e50",
  chainId: CHAIN.id,
  decimals: 18,
  image: "https://s2.coinmarketcap.com/static/img/coins/64x64/28478.png",
  name: 'Mochi',
  symbol: 'MOCHI',
};

const DEGEN: Token = {
  address: "0x4ed4e862860bed51a9570b96d89af5e1b0efefed",
  chainId: CHAIN.id,
  decimals: 18,
  image: "https://s2.coinmarketcap.com/static/img/coins/64x64/30096.png",
  name: 'Degen',
  symbol: 'DEGEN',
};

const WELL: Token = {
  address: "0xa88594d404727625a9437c3f886c7643872296ae",
  chainId: CHAIN.id,
  decimals: 18,
  image: "https://s2.coinmarketcap.com/static/img/coins/64x64/20734.png",
  name: 'Well',
  symbol: 'WELL',
};

const AERO: Token = {
  address: "0x940181a94a35a4569e4529a3cdfb74e38fd98631",
  chainId: CHAIN.id,
  decimals: 18,
  image: "https://s2.coinmarketcap.com/static/img/coins/64x64/29270.png",
  name: 'Aerodrome',
  symbol: 'AERO',
};

export const DEFAULT_TOKENS = [
  ETH_TOKEN,
  USDC_TOKEN,
  WELL,
  AERO,
  BRETT,
  MOCHI,
  DEGEN,
];
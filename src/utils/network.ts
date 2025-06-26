export const networkMap: Record<string, string> = {
  Ethereum: "eth",
  Bitcoin: "btc",
  Base: "base",
  Arbitrum: "arb",
  Starknet: "stark",
  BeraChain: "bera",
  Corn: "corn",
  Unichain: "uni",
  HyperEVM: "hyp",
};

export const getShortName = (network: string): string | undefined => {
  return networkMap[network];
};
const ethers = require("ethers");
const { providers } = require("@0xsequence/multicall");
const { BLOCKCHAIN_TO_CHAIN_ID } = require("../helpers/constants");

module.exports = (chainId) => {
  const infuraProjectId = process.env.INFURA_PROJECT_ID;
  const bscRpcUrl = process.env.BSC_RPC_URL;
  if (chainId === BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"])
    return new providers.MulticallProvider(
      new ethers.getDefaultProvider(
        `https://arbitrum-mainnet.infura.io/v3/${infuraProjectId}`,
        "any"
      )
    );
  else if (chainId === BLOCKCHAIN_TO_CHAIN_ID["BINANCE"])
    return new providers.MulticallProvider(
      new ethers.providers.JsonRpcProvider(
        bscRpcUrl,
        BLOCKCHAIN_TO_CHAIN_ID["BINANCE"]
      )
    );
};

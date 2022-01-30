const { Addresses, ERC20SSOV__factory } = require("@dopex-io/sdk");
const { providers } = require("@0xsequence/multicall");
const ethers = require("ethers");
const BN = require("bignumber.js");
const { BLOCKCHAIN_TO_CHAIN_ID } = require("../helpers/constants");

module.exports = async (token, chainId) => {
  const infuraProjectId = process.env.INFURA_PROJECT_ID;
  const bscRpcUrl = process.env.BSC_RPC_URL;

  const contractAddresses = Addresses[chainId];

  const provider = new providers.MulticallProvider(
    chainId === BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"] ? new ethers.getDefaultProvider(
      `https://arbitrum-mainnet.infura.io/v3/${infuraProjectId}`,
      "any"
    ) : new ethers.providers.JsonRpcProvider(
      bscRpcUrl,
      BLOCKCHAIN_TO_CHAIN_ID["BINANCE"]
    )
  );

  const ssovContract = ERC20SSOV__factory.connect(
    contractAddresses.SSOV[token].Vault,
    provider
  );

  let epoch = await ssovContract.currentEpoch();

  if (epoch.isZero()) {
    epoch = 1;
  }

  const strikes = await ssovContract.getEpochStrikes(epoch);

  const optionsUsage = {};
  let totalCallsPurchased = 0;
  const epochCallsPurchased = await ssovContract.getTotalEpochCallsPurchased(epoch);
  let i;

  for (i in strikes) {
    const callsPurchased = epochCallsPurchased[i];
    totalCallsPurchased = callsPurchased.add(totalCallsPurchased);
    optionsUsage[BN(strikes[i].toString()).dividedBy(1e8)] = BN(callsPurchased.toString()).dividedBy(chainId === BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"] ? 1e18 :  1e8)
  }

  return {
    'total': BN(totalCallsPurchased.toString()).dividedBy(chainId === BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"] ? 1e18 :  1e8),
    'strikes': optionsUsage
  }
};
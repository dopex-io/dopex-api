const { Addresses, ERC20SSOV__factory } = require("@dopex-io/sdk");
const { providers } = require("@0xsequence/multicall");
const ethers = require("ethers");
const BN = require("bignumber.js");
const getPrice = require("./getPrice");

const TOKEN_TO_CG_ID = {
  DPX: "dopex",
  RDPX: "dopex-rebate-token",
  GOHM: "governance-ohm",
  ETH: "ethereum",
  GMX: "gmx",
  BNB: "binancecoin"
};

module.exports = async (token) => {
  const infuraProjectId = process.env.INFURA_PROJECT_ID;

  const contractAddresses = Addresses[42161];

  const provider = new providers.MulticallProvider(
    new ethers.getDefaultProvider(
      `https://arbitrum-mainnet.infura.io/v3/${infuraProjectId}`,
      "any"
    )
  );

  const ssovContract = ERC20SSOV__factory.connect(
    contractAddresses.SSOV[token].Vault,
    provider
  );

  const epoch = await ssovContract.currentEpoch();

  const strikes = await ssovContract.getEpochStrikes(epoch);

  const optionsUsage = {};
  let totalCallsPurchased = 0;
  const epochCallsPurchased = await ssovContract.getTotalEpochCallsPurchased(epoch);
  let i;

  for (i in strikes) {
    const callsPurchased = epochCallsPurchased[i];
    totalCallsPurchased = callsPurchased.add(totalCallsPurchased);
    optionsUsage[BN(strikes[i].toString()).dividedBy(1e8)] = BN(callsPurchased.toString()).dividedBy(1e18)
  }

  return {
    'total': BN(totalCallsPurchased.toString()).dividedBy(1e18),
    'strikes': optionsUsage
  }
};
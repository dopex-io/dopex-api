const { Addresses, ERC20SSOV__factory } = require("@dopex-io/sdk");
const { providers } = require("@0xsequence/multicall");
const ethers = require("ethers");
const BN = require("bignumber.js");
const getPrice = require("./getPrice");
const { TOKEN_TO_CG_ID } = require("../helpers/constants");

module.exports = async (token, chainId) => {
  const infuraProjectId = process.env.INFURA_PROJECT_ID;

  const contractAddresses = Addresses[chainId];

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

  let epoch = await ssovContract.currentEpoch();

  if (epoch.isZero()) {
    epoch = 1;
  }

  const [deposits, tokenPrice] = await Promise.all([
    ssovContract.totalEpochDeposits(epoch),
    getPrice(TOKEN_TO_CG_ID[token]),
  ]);

  let tvl = deposits;
  const allStrikesPremiums = await ssovContract.getTotalEpochPremium(epoch);
  allStrikesPremiums.map(premium => tvl = tvl.add(premium));

  return new BN(tvl.toString())
    .dividedBy(1e18)
    .multipliedBy(tokenPrice.usd);
};
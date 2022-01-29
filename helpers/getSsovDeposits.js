const { Addresses, ERC20SSOV__factory } = require("@dopex-io/sdk");
const { providers } = require("@0xsequence/multicall");
const ethers = require("ethers");
const BN = require("bignumber.js");
const getPrice = require("./getPrice");
const { TOKEN_TO_CG_ID } = require("./constants");

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

  const [strikes, deposits, tokenPrice] = await Promise.all([
    ssovContract.getEpochStrikes(epoch),
    ssovContract.getTotalEpochStrikeDeposits(epoch),
    getPrice(TOKEN_TO_CG_ID[token]),
  ]);

  const ssovDeposits = {};
  for (let i in strikes) {
    const amount = BN(deposits[i].toString()).dividedBy(1e18);
    ssovDeposits[BN(strikes[i].toString()).dividedBy(1e8)] = {
      'amount': amount,
      'usd': amount.multipliedBy(tokenPrice.usd)
    };
  }

  return ssovDeposits
};
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

  const [strikes, tokenPrice] = await Promise.all([
    ssovContract.getEpochStrikes(epoch),
    getPrice(TOKEN_TO_CG_ID[token]),
  ]);

  const optionsPrices = {};
  const currentPrice = await ssovContract.getUsdPrice();
  const amount = "1000000000000000000"; // 1
  let i;

  for (i in strikes) {
    const strike = strikes[i].toNumber();
    const premium = await ssovContract.calculatePremium(strike, amount);
    const fees = await ssovContract.calculatePurchaseFees(currentPrice, strike, amount);
    optionsPrices[BN(strikes[i].toString()).dividedBy(1e8)] = {
      'premium': BN(premium.toString()).dividedBy(1e18),
      'fees': BN(fees.toString()).dividedBy(1e18),
      'total': BN(premium.add(fees).toString()).dividedBy(1e18),
      'usd': BN(premium.add(fees).toString()).dividedBy(1e18).multipliedBy(tokenPrice.usd)
    }
  }

  return optionsPrices
};
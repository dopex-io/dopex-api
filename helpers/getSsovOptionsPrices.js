const { Addresses, ERC20SSOV__factory } = require("@dopex-io/sdk");
const BN = require("bignumber.js");
const getPrice = require("./getPrice");
const { TOKEN_TO_CG_ID } = require("./constants");
const getProvider = require("./getProvider");
const { ethers } = require("ethers");

module.exports = async (token, chainId) => {
  const contractAddresses = Addresses[chainId];
  const provider = getProvider(chainId);

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
  const amount = 1e18;
  let i;

  const converter = token === "BNB" && new ethers.Contract(
    ssovContract.address,
    ["function vbnbToBnb(uint256 vbnbAmount) public view returns (uint256)"],
    provider
  );

  for (i in strikes) {
    const strike = strikes[i].toNumber();
    let premium = await ssovContract.calculatePremium(strike, amount.toString());
    let fees = await ssovContract.calculatePurchaseFees(currentPrice, strike, amount.toString());

    if (token === 'BNB') {
      premium = await converter.vbnbToBnb(premium);
      fees = await converter.vbnbToBnb(fees);
    }

    optionsPrices[BN(strikes[i].toString()).dividedBy(1e8)] = {
      'premium': BN(premium.toString()).dividedBy(1e18),
      'fees': BN(fees.toString()).dividedBy(1e18),
      'total': BN(premium.add(fees).toString()).dividedBy(1e18),
      'usd': BN(premium.add(fees).toString()).dividedBy(1e18).multipliedBy(tokenPrice.usd)
    }
  }

  return optionsPrices
};
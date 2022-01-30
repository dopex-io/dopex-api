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

  const [strikes, deposits, tokenPrice] = await Promise.all([
    ssovContract.getEpochStrikes(epoch),
    ssovContract.getTotalEpochStrikeDeposits(epoch),
    getPrice(TOKEN_TO_CG_ID[token]),
  ]);

  const converter = token === "BNB" && new ethers.Contract(
    ssovContract.address,
    ["function vbnbToBnb(uint256 vbnbAmount) public view returns (uint256)"],
    provider
  );

  const ssovDeposits = {};
  for (let i in strikes) {
    const amount = token === "BNB" ? await converter.vbnbToBnb(deposits[i]) : deposits[i];
    ssovDeposits[BN(strikes[i].toString()).dividedBy(1e8)] = {
      'amount': BN(amount.toString()).dividedBy(1e18).toString(),
      'usd': BN(amount.toString()).multipliedBy(tokenPrice.usd).dividedBy(1e18).toString()
    };
  }

  return ssovDeposits
};
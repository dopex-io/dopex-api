const { Addresses, ERC20SSOV__factory } = require("@dopex-io/sdk");
const BN = require("bignumber.js");
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

  const strikes = await ssovContract.getEpochStrikes(epoch);

  const optionsUsage = {};
  let totalCallsPurchased = 0;
  const epochCallsPurchased = await ssovContract.getTotalEpochCallsPurchased(epoch);
  let i;

  const converter = token === "BNB" && new ethers.Contract(
    ssovContract.address,
    ["function vbnbToBnb(uint256 vbnbAmount) public view returns (uint256)"],
    provider
  );

  for (i in strikes) {
    const callsPurchased = token === "BNB" ? (await converter.vbnbToBnb(epochCallsPurchased[i].toString())) : epochCallsPurchased[i];
    totalCallsPurchased = callsPurchased.add(totalCallsPurchased);
    optionsUsage[BN(strikes[i].toString()).dividedBy(1e8)] = BN(callsPurchased.toString()).dividedBy(1e18)
  }

  return {
    'total': BN(totalCallsPurchased.toString()).dividedBy(1e18),
    'strikes': optionsUsage
  }
};
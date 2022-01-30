const { Addresses, ERC20SSOV__factory } = require("@dopex-io/sdk");
const ethers = require("ethers");
const BN = require("bignumber.js");
const getPrice = require("./getPrice");
const getProvider = require("./getProvider");
const { TOKEN_TO_CG_ID } = require("../helpers/constants");

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

  const [deposits, tokenPrice] = await Promise.all([
    ssovContract.totalEpochDeposits(epoch),
    getPrice(TOKEN_TO_CG_ID[token]),
  ]);

  let tvl = deposits;

  const allStrikesPremiums = await ssovContract.getTotalEpochPremium(epoch);
  allStrikesPremiums.map(premium => tvl = tvl.add(premium));

  const converter = new ethers.Contract(
    ssovContract.address,
    ["function vbnbToBnb(uint256 vbnbAmount) public view returns (uint256)"],
    provider
  );

  tvl = await converter.vbnbToBnb(tvl.toString());

  return new BN(tvl.toString())
    .dividedBy(1e18)
    .multipliedBy(tokenPrice.usd);
};
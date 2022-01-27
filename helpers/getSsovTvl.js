const { Addresses, ERC20SSOV__factory } = require("@dopex-io/sdk");
const { providers } = require("@0xsequence/multicall");
const ethers = require("ethers");
const BN = require("bignumber.js");
const getPrice = require("./getPrice");
import { TOKEN_TO_CG_ID } from "./constants";

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
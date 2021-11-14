const { Addresses, SSOV__factory } = require("@dopex-io/sdk");
const { providers } = require("@0xsequence/multicall");
const ethers = require("ethers");
const BN = require("bignumber.js");
const getPrice = require("./getPrice");

const TOKEN_TO_CG_ID = { DPX: "dopex", RDPX: "dopex-rebate-token" };

module.exports = async (token) => {
  const infuraProjectId = process.env.INFURA_PROJECT_ID;

  const contractAddresses = Addresses[42161];

  const provider = new providers.MulticallProvider(
    new ethers.getDefaultProvider(
      `https://arbitrum-mainnet.infura.io/v3/${infuraProjectId}`,
      "any"
    )
  );

  const ssovContract = SSOV__factory.connect(
    contractAddresses.SSOV[token].Vault,
    provider
  );

  const epoch = await ssovContract.currentEpoch();

  const [deposits, tokenPrice] = await Promise.all([
    ssovContract.totalEpochDeposits(epoch),
    getPrice(TOKEN_TO_CG_ID[token]),
  ]);

  return new BN(deposits.toString())
    .dividedBy(1e18)
    .multipliedBy(tokenPrice.usd);
};

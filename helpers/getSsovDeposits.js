const { Addresses, ERC20SSOV__factory } = require("@dopex-io/sdk");
const { providers } = require("@0xsequence/multicall");
const ethers = require("ethers");
const BN = require("bignumber.js");
const getPrice = require("./getPrice");
const { TOKEN_TO_CG_ID, BLOCKCHAIN_TO_CHAIN_ID } = require("./constants");

module.exports = async (token, chainId) => {
  const infuraProjectId = process.env.INFURA_PROJECT_ID;
  const bscRpcUrl = process.env.BSC_RPC_URL;

  const contractAddresses = Addresses[chainId];

  const provider = new providers.MulticallProvider(
    chainId === BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"] ? new ethers.getDefaultProvider(
      `https://arbitrum-mainnet.infura.io/v3/${infuraProjectId}`,
      "any"
    ) : new ethers.providers.JsonRpcProvider(
      bscRpcUrl,
      BLOCKCHAIN_TO_CHAIN_ID["BINANCE"]
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
    const amount = BN(deposits[i].toString()).dividedBy(chainId === BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"] ? 1e18 : 1e8);
    ssovDeposits[BN(strikes[i].toString()).dividedBy(1e8)] = {
      'amount': amount,
      'usd': amount.multipliedBy(tokenPrice.usd)
    };
  }

  return ssovDeposits
};
const {
  Addresses,
  ERC20SSOV__factory,
  Curve2PoolSsovPut__factory,
} = require("@dopex-io/sdk");
const ethers = require("ethers");
const BN = require("bignumber.js");
const getPrice = require("./getPrice");
const getProvider = require("./getProvider");
const { TOKEN_TO_CG_ID } = require("../helpers/constants");

module.exports = async (token, type, chainId) => {
  const contractAddresses = Addresses[chainId];

  const provider = getProvider(Number(chainId));

  let tvl;

  if (type === "put") {
    const ssovAddress = contractAddresses["2CRV-SSOV-P"][token].Vault;

    const ssovContract = Curve2PoolSsovPut__factory.connect(
      ssovAddress,
      provider
    );

    let epoch = await ssovContract.currentEpoch();

    if (epoch.isZero()) {
      epoch = 1;
    }

    const [deposits, tokenPrice] = await Promise.all([
      ssovContract.totalEpochDeposits(epoch),
      ssovContract.getLpPrice(),
    ]);

    tvl = deposits;

    const allStrikesPremiums = await ssovContract.totalEpochPremium(epoch);

    tvl = tvl.add(allStrikesPremiums);

    tvl = new BN(tvl.toString())
      .multipliedBy(tokenPrice.toString())
      .dividedBy(1e36);
  } else {
    const ssovAddress = contractAddresses.SSOV[token].Vault;

    const ssovContract = ERC20SSOV__factory.connect(ssovAddress, provider);

    let epoch = await ssovContract.currentEpoch();

    if (epoch.isZero()) {
      epoch = 1;
    }

    const [deposits, tokenPrice] = await Promise.all([
      ssovContract.totalEpochDeposits(epoch),
      getPrice(TOKEN_TO_CG_ID[token]),
    ]);

    tvl = deposits;

    const allStrikesPremiums = await ssovContract.getTotalEpochPremium(epoch);
    allStrikesPremiums.map((premium) => (tvl = tvl.add(premium)));

    if (token === "BNB") {
      const converter = new ethers.Contract(
        ssovContract.address,
        [
          "function vbnbToBnb(uint256 vbnbAmount) public view returns (uint256)",
        ],
        provider
      );

      tvl = await converter.vbnbToBnb(tvl.toString());
    }

    tvl = new BN(tvl.toString()).multipliedBy(tokenPrice.usd).dividedBy(1e18);
  }

  return tvl;
};

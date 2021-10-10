const { ERC20__factory, Addresses } = require("@dopex-io/sdk");
const { BigNumber } = require("bignumber.js");
const { providers } = require("@0xsequence/multicall");
const ethers = require("ethers");

module.exports = async () => {
  const infuraProjectId = process.env.INFURA_PROJECT_ID;

  const arbProvider = new providers.MulticallProvider(
    new ethers.getDefaultProvider(
      `https://arbitrum-mainnet.infura.io/v3/${infuraProjectId}`,
      "any"
    )
  );

  const ethProvider = new providers.MulticallProvider(
    new ethers.getDefaultProvider(
      `https://mainnet.infura.io/v3/${infuraProjectId}`,
      "any"
    )
  );

  const tokenSaleEmitted = 60000;

  const rdpxArb = ERC20__factory.connect(Addresses.arbitrum.RDPX, arbProvider);

  const rdpxEth = ERC20__factory.connect(Addresses.mainnet.RDPX, ethProvider);

  // Async call of all promises
  const [
    dpxFarmBalance,
    dpxWethFarmBalance,
    rdpxWethFarmBalance,
    rdpxMerkleDistributorBalance,
  ] = await Promise.all([
    rdpxArb.balanceOf(Addresses.arbitrum.DPXStakingRewards),
    rdpxArb.balanceOf(Addresses.arbitrum["DPX-WETHStakingRewards"]),
    rdpxArb.balanceOf(Addresses.arbitrum["RDPX-WETHStakingRewards"]),
    rdpxEth.balanceOf("0x20E3D49241A9658C36Df595437160a6F6Dc01bDe"),
  ]);

  // Farming (Total Rewards - Current Rewards)
  const dpxFarmEmitted =
    400000 -
    new BigNumber(dpxFarmBalance.toString()).dividedBy(1e18).toNumber();
  const dpxWethFarmEmitted =
    800000 -
    new BigNumber(dpxWethFarmBalance.toString()).dividedBy(1e18).toNumber();
  const rdpxWethFarmEmitted =
    800000 -
    new BigNumber(rdpxWethFarmBalance.toString()).dividedBy(1e18).toNumber();
  // For bootstrapping liquidity
  const sideEmitted = 20700;

  const airdropEmitted =
    83920 -
    new BigNumber(rdpxMerkleDistributorBalance.toString())
      .dividedBy(1e18)
      .toNumber();

  const circulatingSupply =
    tokenSaleEmitted +
    dpxFarmEmitted +
    dpxWethFarmEmitted +
    rdpxWethFarmEmitted +
    sideEmitted +
    airdropEmitted;

  return circulatingSupply;
};

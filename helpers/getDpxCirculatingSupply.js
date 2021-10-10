const {
  ERC20__factory,
  StakingRewards__factory,
  Addresses,
} = require("@dopex-io/sdk");
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

  const tokenSaleEmitted = 75000;

  const presaleAddress = "0x578d37cd3b2a69f36a62b287b5262b056d9b1119";
  const presaleAllocation = 44940;

  const teamVestingAddress = "0x38569f73190d6d2f3927c0551526451e3af4d8d6";
  const teamVestingAllocation = 60000;

  const dpxEth = ERC20__factory.connect(Addresses.mainnet.DPX, ethProvider);

  const dpxArb = ERC20__factory.connect(Addresses.arbitrum.DPX, arbProvider);

  const dpxStakingRewards = StakingRewards__factory.connect(
    Addresses.arbitrum.DPXStakingRewards,
    arbProvider
  );

  // Async call of all promises
  const [
    presaleBalance,
    teamVestingBalance,
    dpxFarmBalance,
    dpxFarmTotalSupply,
    dpxWethFarmBalance,
    rdpxWethFarmBalance,
  ] = await Promise.all([
    dpxEth.balanceOf(presaleAddress),
    dpxEth.balanceOf(teamVestingAddress),
    dpxArb.balanceOf(Addresses.arbitrum.DPXStakingRewards),
    dpxStakingRewards.totalSupply(),
    dpxArb.balanceOf(Addresses.arbitrum["DPX-WETHStakingRewards"]),
    dpxArb.balanceOf(Addresses.arbitrum["RDPX-WETHStakingRewards"]),
  ]);

  const presaleEmitted =
    presaleAllocation -
    new BigNumber(presaleBalance.toString()).dividedBy(1e18).toNumber();

  const teamVestingEmitted =
    teamVestingAllocation -
    new BigNumber(teamVestingBalance.toString()).dividedBy(1e18).toNumber();

  // Farming (Total Rewards - Current Rewards)
  const dpxFarmEmitted =
    15000 -
    new BigNumber(dpxFarmBalance.toString())
      .minus(dpxFarmTotalSupply.toString())
      .dividedBy(1e18)
      .toNumber();
  const dpxWethFarmEmitted =
    45000 -
    new BigNumber(dpxWethFarmBalance.toString()).dividedBy(1e18).toNumber();
  const rdpxWethFarmEmitted =
    15000 -
    new BigNumber(rdpxWethFarmBalance.toString()).dividedBy(1e18).toNumber();
  // From operational allocation for liquidity
  const sideEmitted = 914;

  const circulatingSupply =
    presaleEmitted +
    tokenSaleEmitted +
    teamVestingEmitted +
    dpxFarmEmitted +
    dpxWethFarmEmitted +
    rdpxWethFarmEmitted +
    sideEmitted;

  return circulatingSupply;
};

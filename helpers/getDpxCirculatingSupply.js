const { ERC20, FarmingABIs, Addresses } = require("@dopex-io/sdk");
const { BigNumber } = require("bignumber.js");
const Web3 = require("web3");

module.exports = async () => {
  const infuraProjectId = process.env.INFURA_PROJECT_ID;
  const web3 = new Web3(`https://mainnet.infura.io/v3/${infuraProjectId}`);

  const tokenSaleEmitted = 75000;

  const presaleAddress = "0x578d37cd3b2a69f36a62b287b5262b056d9b1119";
  const presaleAllocation = 44940;

  const teamVestingAddress = "0x38569f73190d6d2f3927c0551526451e3af4d8d6";
  const teamVestingAllocation = 60000;

  const dpx = new ERC20(web3, Addresses.mainnet.DPX);

  const dpxBalanceOf = dpx.contract.methods.balanceOf;

  const dpxStakingRewards = new web3.eth.Contract(
    FarmingABIs.DPXStakingRewards,
    Addresses.mainnet.DPXStakingRewards
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
    dpxBalanceOf(presaleAddress).call(),
    dpxBalanceOf(teamVestingAddress).call(),
    dpxBalanceOf(Addresses.mainnet.DPXStakingRewards).call(),
    dpxStakingRewards.methods.totalSupply().call(),
    dpxBalanceOf(Addresses.mainnet["DPX-WETHStakingRewards"]).call(),
    dpxBalanceOf(Addresses.mainnet["RDPX-WETHStakingRewards"]).call(),
  ]);

  const presaleEmitted =
    presaleAllocation -
    new BigNumber(presaleBalance).dividedBy(1e18).toNumber();

  const teamVestingEmitted =
    teamVestingAllocation -
    new BigNumber(teamVestingBalance).dividedBy(1e18).toNumber();

  // Farming (Total Rewards - Current Rewards)
  const dpxFarmEmitted =
    15000 -
    new BigNumber(dpxFarmBalance)
      .minus(dpxFarmTotalSupply)
      .dividedBy(1e18)
      .toNumber();
  const dpxWethFarmEmitted =
    45000 - new BigNumber(dpxWethFarmBalance).dividedBy(1e18).toNumber();
  const rdpxWethFarmEmitted =
    15000 - new BigNumber(rdpxWethFarmBalance).dividedBy(1e18).toNumber();

  // From operational allocation for liquidity
  const sideEmitted = 263;

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

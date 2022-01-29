import {BLOCKCHAIN_TO_CHAIN_ID} from "./constants";

const {
  ERC20__factory,
  Addresses,
  StakingRewards__factory,
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

  const tokenSaleEmitted = 60000;

  const rdpxArb = ERC20__factory.connect(Addresses[BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]].RDPX, arbProvider);

  const rdpxEth = ERC20__factory.connect(Addresses[BLOCKCHAIN_TO_CHAIN_ID["ETHEREUM"]].RDPX, ethProvider);

  const rdpxStakingRewards = StakingRewards__factory.connect(
    Addresses[BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]].RDPXStakingRewards,
    arbProvider
  );

  // Async call of all promises
  const [
    dpxFarmBalance,
    dpxWethFarmBalance,
    rdpxWethFarmBalance,
    rdpxFarmTotalSupply,
    rdpxFarmBalance,
    rdpxMerkleDistributorBalance,
  ] = await Promise.all([
    rdpxArb.balanceOf(Addresses[BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]].DPXStakingRewards),
    rdpxArb.balanceOf(Addresses[BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]]["DPX-WETHStakingRewards"]),
    rdpxArb.balanceOf(Addresses[BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]]["RDPX-WETHStakingRewards"]),
    rdpxStakingRewards.totalSupply(),
    rdpxArb.balanceOf(Addresses[BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]]["RDPXStakingRewards"]),
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
  const rdpxFarmEmitted =
    40000 -
    new BigNumber(rdpxFarmBalance.toString())
      .minus(rdpxFarmTotalSupply.toString())
      .dividedBy(1e18)
      .toNumber();
  // For bootstrapping liquidity
  const sideEmitted = 21200;

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
    rdpxFarmEmitted +
    sideEmitted +
    airdropEmitted;

  return circulatingSupply;
};

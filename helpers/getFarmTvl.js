import {
  ERC20__factory,
  UniswapPair__factory,
  Addresses,
  StakingRewards__factory,
} from "@dopex-io/sdk";
import { providers } from "@0xsequence/multicall";
import { ethers } from "ethers";
import BN from "bignumber.js";

import { BLOCKCHAIN_TO_CHAIN_ID } from "../helpers/constants";

const getFarmTvl = async (token, ethPriceFinal) => {
  const infuraProjectId = process.env.INFURA_PROJECT_ID;

  const contractAddresses = Addresses[BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]];

  const provider = new providers.MulticallProvider(
    new ethers.getDefaultProvider(
      `https://arbitrum-mainnet.infura.io/v3/${infuraProjectId}`,
      "any"
    )
  );

  const tokenAddress = contractAddresses[token.toUpperCase()];

  const tokenContract = ERC20__factory.connect(tokenAddress, provider);

  const totalTokens = new BN((await tokenContract.totalSupply()).toString());

  const stakingAsset = token.toUpperCase() + "StakingRewards";

  const stakingRewardsContract = StakingRewards__factory.connect(
    contractAddresses[stakingAsset],
    provider
  );

  const totalSupply = new BN(
    (await stakingRewardsContract.totalSupply()).toString()
  );

  let priceLP;
  let priceDPX;
  let priceRDPX;

  let ethReserveOfRdpxWethPool;
  let rdpxReserveOfRdpxWethPool;

  let ethReserveOfDpxWethPool;
  let dpxReserveOfDpxWethPool;

  const dpxWethPair = UniswapPair__factory.connect(
    contractAddresses["DPX-WETH"],
    provider
  );

  const rdpxWethPair = UniswapPair__factory.connect(
    contractAddresses["RDPX-WETH"],
    provider
  );

  const [dpxWethReserve, rdpxWethReserve] = await Promise.all([
    await dpxWethPair.getReserves(),
    await rdpxWethPair.getReserves(),
  ]);

  let dpxPrice = new BN(dpxWethReserve[1].toString()).dividedBy(
    dpxWethReserve[0].toString()
  );
  let rdpxPrice = new BN(rdpxWethReserve[1].toString()).dividedBy(
    rdpxWethReserve[0].toString()
  );

  // DPX and ETH from DPX-ETH pair
  ethReserveOfDpxWethPool = new BN(dpxWethReserve[1].toString())
    .dividedBy(1e18)
    .toNumber();
  dpxReserveOfDpxWethPool = new BN(dpxWethReserve[0].toString())
    .dividedBy(1e18)
    .toNumber();

  // RDPX and ETH from RDPX-ETH pair
  ethReserveOfRdpxWethPool = new BN(rdpxWethReserve[1].toString())
    .dividedBy(1e18)
    .toNumber();
  rdpxReserveOfRdpxWethPool = new BN(rdpxWethReserve[0].toString())
    .dividedBy(1e18)
    .toNumber();

  priceDPX = Number(dpxPrice) * ethPriceFinal;
  priceRDPX = Number(rdpxPrice) * ethPriceFinal;

  if (token === "DPX") {
    priceLP = priceDPX;
  } else if (token === "RDPX") {
    priceLP = priceRDPX;
  } else if (token === "DPX-WETH") {
    priceLP =
      (priceDPX * Number(dpxReserveOfDpxWethPool) +
        ethPriceFinal * Number(ethReserveOfDpxWethPool)) /
      Number(totalTokens.dividedBy(1e18));
  } else {
    priceLP =
      (priceRDPX * Number(rdpxReserveOfRdpxWethPool) +
        ethPriceFinal * Number(ethReserveOfRdpxWethPool)) /
      Number(totalTokens.dividedBy(1e18));
  }

  return totalSupply.multipliedBy(priceLP).dividedBy(1e18);
};

export default getFarmTvl;

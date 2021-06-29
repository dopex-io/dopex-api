const { InfuraProvider } = require("@ethersproject/providers");
const {
  ContractFactory,
  DopexABIs,
  FarmingABIs,
  Addresses,
} = require("@dopex-io/sdk");
const { Fetcher, Route, Token } = require("@uniswap/sdk");
const { BigNumber } = require("bignumber.js");
const Web3 = require("web3");

module.exports = async (token, ethPriceFinal) => {
  const infuraProjectId = process.env.INFURA_PROJECT_ID;

  const web3 = new Web3(`https://mainnet.infura.io/v3/${infuraProjectId}`);
  const chainId = 1;
  const contractAddresses = Addresses.mainnet;
  const tokenAbi = DopexABIs[token] ? DopexABIs[token] : FarmingABIs[token];

  const tokenAddress = contractAddresses[token];

  const selectedBaseAssetContract = ContractFactory.create(
    web3,
    tokenAbi,
    tokenAddress
  );

  const stakingAsset = token + "StakingRewards";

  const stakingRewardContract = ContractFactory.create(
    web3,
    FarmingABIs[stakingAsset],
    contractAddresses[stakingAsset]
  );

  let priceLP = 100;
  let priceDPX = 50;
  let priceRDPX = 10;
  let LPT1, LPT2, LPT1r, LPT2r;

  let weth;
  let dpx;
  let rdpx;

  dpx = new Token(chainId, contractAddresses["DPX"], 18);
  rdpx = new Token(chainId, contractAddresses["RDPX"], 18);
  weth = new Token(chainId, contractAddresses["WETH"], 18);

  const infuraProvider = new InfuraProvider("mainnet", infuraProjectId);

  const [totalTokens, totalSupply, pair1, pair2] = await Promise.all([
    selectedBaseAssetContract.methods.totalSupply().call(),
    stakingRewardContract.methods.totalSupply().call(),
    Fetcher.fetchPairData(dpx, weth, infuraProvider),
    Fetcher.fetchPairData(rdpx, weth, infuraProvider),
  ]);

  let total = new BigNumber(totalSupply);

  const route1 = new Route([pair1], dpx);
  const route2 = new Route([pair2], rdpx);

  let dpxPrice = route1.midPrice.toSignificant(6);
  let rdpxPrice = route2.midPrice.toSignificant(6);

  LPT1 = new BigNumber(pair1.reserve0.numerator.toString()); //ETH

  //current liquidity token reserve
  LPT2 = new BigNumber(pair1.reserve1.numerator.toString()); //DPX

  LPT1r = new BigNumber(pair2.reserve0.numerator.toString()); //rDPX
  //current liquidity token reserve
  LPT2r = new BigNumber(pair2.reserve1.numerator.toString()); //ETH
  priceDPX = Number(dpxPrice) * ethPriceFinal;
  priceRDPX = Number(rdpxPrice) * ethPriceFinal;

  if (token === "DPX") {
    priceLP = priceDPX;
  } else if (token === "DPX-WETH") {
    priceLP =
      (priceDPX * Number(LPT2) + ethPriceFinal * Number(LPT1)) /
      Number(totalTokens);
  } else {
    priceLP =
      (priceRDPX * Number(LPT1r) + ethPriceFinal * Number(LPT2r)) /
      Number(totalTokens);
  }

  const tvl = total.multipliedBy(priceLP).dividedBy(1e18);

  return tvl;
};

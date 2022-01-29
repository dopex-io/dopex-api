const { providers } = require("@0xsequence/multicall");
const ethers = require("ethers");
const BN = require("bignumber.js");
const {
  NativeSSOV__factory,
  Addresses,
  ERC20SSOV__factory,
  StakingRewards__factory,
} = require("@dopex-io/sdk");

const getPrices = require("../../../../helpers/getPrices");

async function getBnbApy() {
  const provider = new providers.MulticallProvider(
    new ethers.providers.JsonRpcProvider(
      "https://speedy-nodes-nyc.moralis.io/5175b25bfb4a31b9ed82dc8b/bsc/mainnet/archive",
      56
    )
  );

  const vbnbContract = new ethers.Contract(
    "0xA07c5b74C9B40447a954e1466938b865b6BBea36",
    ["function supplyRatePerBlock() external view returns (uint)"],
    provider
  );

  const blocksPerDay = 20 * 60 * 24;
  const supplyRatePerBlock = await vbnbContract.supplyRatePerBlock();

  return (
    (Math.pow(
      (supplyRatePerBlock.toString() / 1e18) * blocksPerDay + 1,
      365 - 1
    ) -
      1) *
    100
  );
}

async function getGmxApy() {
  const infuraProjectId = process.env.INFURA_PROJECT_ID;

  const provider = new providers.MulticallProvider(
    new ethers.getDefaultProvider(
      `https://arbitrum-mainnet.infura.io/v3/${infuraProjectId}`,
      "any"
    )
  );

  const stakingContract = new ethers.Contract(
    "0xd2D1162512F927a7e282Ef43a362659E4F2a728F",
    ["function totalSupply() view returns (uint256)"],
    provider
  );

  const ssov = new ethers.Contract(
    "0x04996AFcf40A14D0892B00C816874F9C1A52C93B",
    [
      "function getUsdPrice() public view returns (uint256)",
    ],
    provider
  );

  const ethSsov = new ethers.Contract(
    "0x711Da677a0D61Ee855DAd4241B552A706F529C70",
    [
      "function getUsdPrice() view returns (uint256)",
    ],
    provider
  );

  const gmx = new ethers.Contract(
    "0xfc5A1A6EB076a2C7aD06eD22C90d7E710E35ad0a",
    [
      "function balanceOf(address _account) view returns (uint256)",
    ],
    provider
  );

  const stakedGmxTracker = await gmx.balanceOf("0x908C4D94D34924765f1eDc22A1DD098397c59dD4");
  const gmxPrice = (await ssov.getUsdPrice()) * 10 ** 22;
  const tokensPerInterval = 677910052910052;
  const secondsPerYear = 31536000;
  const stakedGmxTrackerAnnualRewardsUsd = 39776760107741941 * secondsPerYear * gmxPrice / 10 ** 18;
  const basisPointsDivisor = 10000;
  const feeGmxSupply = await stakingContract.totalSupply();
  const feeGmxSupplyUsd = feeGmxSupply * gmxPrice / 10 ** 18;
  const ethPrice = (await ethSsov.getUsdPrice()) * 10 ** 22;
  const stakedGmxTrackerSupplyUsd = stakedGmxTracker * gmxPrice / 10 ** 18;
  const gmxAprForEsGmx = stakedGmxTrackerAnnualRewardsUsd * basisPointsDivisor / stakedGmxTrackerSupplyUsd / 100;
  const feeGmxTrackerAnnualRewardsUsd = tokensPerInterval * secondsPerYear * ethPrice / 10 ** 18;
  const gmxAprForNativeToken = feeGmxTrackerAnnualRewardsUsd * basisPointsDivisor / feeGmxSupplyUsd / 100;
  const gmxAprTotal = gmxAprForNativeToken + gmxAprForEsGmx;
  return Number((((1 + gmxAprTotal / 365 / 100) ** 365 - 1) * 100).toFixed(2));
}

async function getGohmApy() {
  const mainnetProvider = new providers.MulticallProvider(
    new ethers.providers.JsonRpcProvider(
      "https://eth-mainnet.gateway.pokt.network/v1/lb/61ceae3bb86d760039e05c85",
      1
    )
  );

  const stakingContract = new ethers.Contract(
    "0xB63cac384247597756545b500253ff8E607a8020",
    [
      "function epoch() view returns (uint256 length, uint256 number, uint256 end, uint256 distribute)",
    ],
    mainnetProvider
  );
  const sohmMainContract = new ethers.Contract(
    "0x04906695D6D12CF5459975d7C3C03356E4Ccd460",
    ["function circulatingSupply() view returns (uint256)"],
    mainnetProvider
  );

  const [epoch, circulatingSupply] = await Promise.all([
    stakingContract.epoch(),
    sohmMainContract.circulatingSupply(),
  ]);

  const stakingRebase =
    Number(epoch.distribute.toString()) / Number(circulatingSupply.toString());

  return Number(((Math.pow(1 + stakingRebase, 365 * 3) - 1) * 100).toFixed(0));
}

async function getDopexApy(asset) {
  const infuraProjectId = process.env.INFURA_PROJECT_ID;

  const provider = new providers.MulticallProvider(
    new ethers.getDefaultProvider(
      `https://arbitrum-mainnet.infura.io/v3/${infuraProjectId}`,
      "any"
    )
  );

  const ssovContract = ERC20SSOV__factory.connect(
    Addresses[42161].SSOV[asset].Vault,
    provider
  );

  const stakingRewardsAddress = await ssovContract.getAddress(
    "0x5374616b696e6752657761726473000000000000000000000000000000000000" // StakingRewards
  );
  const stakingRewardsContract = StakingRewards__factory.connect(
    stakingRewardsAddress,
    provider
  );

  let DPXemitted;
  let RDPXemitted;

  let [DPX, RDPX, totalSupply, [priceDPX, priceRDPX]] = await Promise.all([
    stakingRewardsContract.rewardRateDPX(),
    stakingRewardsContract.rewardRateRDPX(),
    stakingRewardsContract.totalSupply(),
    getPrices(["dopex", "dopex-rebate-token"]),
  ]);

  const assetPrice = asset === "DPX" ? priceDPX : priceRDPX;

  const TVL = new BN(totalSupply.toString())
    .multipliedBy(assetPrice)
    .dividedBy(1e18);

  const rewardsDuration = new BN(86400 * 365);

  DPXemitted = new BN(DPX.toString())
    .multipliedBy(rewardsDuration)
    .multipliedBy(priceDPX)
    .dividedBy(1e18);
  RDPXemitted = new BN(RDPX.toString())
    .multipliedBy(rewardsDuration)
    .multipliedBy(priceRDPX)
    .dividedBy(1e18);

  const denominator =
    TVL.toNumber() + DPXemitted.toNumber() + RDPXemitted.toNumber();

  let APR = (denominator / TVL.toNumber() - 1) * 100;

  return Number((((1 + APR / 365 / 100) ** 365 - 1) * 100).toFixed(2));
}

async function getEthApy() {
  const infuraProjectId = process.env.INFURA_PROJECT_ID;

  const provider = new providers.MulticallProvider(
    new ethers.getDefaultProvider(
      `https://arbitrum-mainnet.infura.io/v3/${infuraProjectId}`,
      "any"
    )
  );

  const ssovContract = NativeSSOV__factory.connect(
    Addresses[42161].SSOV.ETH.Vault,
    provider
  );

  let epoch = await ssovContract.currentEpoch();

  if (epoch.isZero()) {
    epoch = 1;
  }

  const [totalEpochDeposits, [priceETH, priceDPX]] = await Promise.all([
    ssovContract.totalEpochDeposits(epoch),
    getPrices(["ethereum", "dopex"]),
  ]);

  const TVL = new BN(totalEpochDeposits.toString())
    .dividedBy(1e18)
    .multipliedBy(priceETH);

  let rewardsEmitted = new BN("500"); // 500 DPX per month
  rewardsEmitted = rewardsEmitted.multipliedBy(priceDPX).multipliedBy(12); // for 12 months

  const denominator = TVL.toNumber() + rewardsEmitted.toNumber();

  let APR = (denominator / TVL.toNumber() - 1) * 100;

  return Number((((1 + APR / 365 / 100) ** 365 - 1) * 100).toFixed(2));
}

const ASSET_TO_GETTER = {
  "DPX": { fn: getDopexApy, args: ["DPX"] },
  "RDPX": { fn: getDopexApy, args: ["RDPX"] },
  "ETH": { fn: getEthApy, args: [] },
  "GOHM": { fn: getGohmApy, args: [] },
  "BNB": { fn: getBnbApy, args: [] },
  "GMX": { fn: getGmxApy, args: [] },
};

module.exports = async (req, res) => {
  try {
    const asset = req.query.asset;

    if (!asset) res.status(400).json({ error: "Missing asset parameter." });

    let apy = await ASSET_TO_GETTER[asset].fn(...ASSET_TO_GETTER[asset].args);

    res.json({ apy });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Something went wrong." });
  }
};
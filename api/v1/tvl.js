const BN = require("bignumber.js");

const getFarmTvl = require("../../helpers/getFarmTvl");
const getSsovTvl = require("../../helpers/getSsovTvl");
const getPrice = require("../../helpers/getPrice");
const { BLOCKCHAIN_TO_CHAIN_ID } = require("../../helpers/constants");

module.exports = async (req, res) => {
  try {
    let tvl = 0;
    const { usd: ethPriceFinal } = await getPrice("ethereum");

    const INCLUDE_QUERY_MAPPING = {
      "dpx-ssov": { fn: getSsovTvl, args: ["DPX", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]] },
      "rdpx-ssov": { fn: getSsovTvl, args: ["RDPX", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]] },
      "gohm-ssov": { fn: getSsovTvl, args: ["GOHM", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]] },
      "gmx-ssov": { fn: getSsovTvl, args: ["GMX", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]] },
      "eth-ssov": { fn: getSsovTvl, args: ["ETH", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]] },
      "bnb-ssov": { fn: getSsovTvl, args: ["BNB", BLOCKCHAIN_TO_CHAIN_ID["BNB"]] },
      "dpx-farm": { fn: getFarmTvl, args: ["DPX", ethPriceFinal] },
      "rdpx-farm": { fn: getFarmTvl, args: ["RDPX", ethPriceFinal] },
      "dpx-weth-farm": { fn: getFarmTvl, args: ["DPX-WETH", ethPriceFinal] },
      "rdpx-weth-farm": { fn: getFarmTvl, args: ["RDPX-WETH", ethPriceFinal] },
    };

    const promises = req.query.include
      ? req.query.include.split(",")
      : Object.keys(INCLUDE_QUERY_MAPPING);

    const data = await Promise.all(
      promises.map((q) => {
        const { fn, args } = INCLUDE_QUERY_MAPPING[q];
        return fn(...args);
      })
    );

    tvl = data.reduce((acc, val) => {
      acc = acc.plus(val);

      return acc;
    }, new BN(0));

    res.json({ tvl });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Something went wrong.", details: err["reason"] });
  }
};

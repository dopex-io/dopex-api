import BN from "bignumber.js";

import getFarmTvl from "../../helpers/getFarmTvl";
import getSsovTvl from "../../helpers/getSsovTvl";
import getPrice from "../../helpers/getPrice";
import { BLOCKCHAIN_TO_CHAIN_ID } from "../../helpers/constants";

export default async (req, res) => {
  try {
    let tvl = 0;
    const { usd: ethPriceFinal } = await getPrice("ethereum");

    const INCLUDE_QUERY_MAPPING = {
      "dpx-ssov": {
        fn: getSsovTvl,
        args: ["DPX", "call", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]],
      },
      "rdpx-ssov": {
        fn: getSsovTvl,
        args: ["RDPX", "call", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]],
      },
      "gohm-ssov": {
        fn: getSsovTvl,
        args: ["GOHM", "call", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]],
      },
      "gmx-ssov": {
        fn: getSsovTvl,
        args: ["GMX", "call", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]],
      },
      "eth-ssov": {
        fn: getSsovTvl,
        args: ["ETH", "call", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]],
      },
      "bnb-ssov": {
        fn: getSsovTvl,
        args: ["BNB", "call", BLOCKCHAIN_TO_CHAIN_ID["BINANCE"]],
      },
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

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate");
    res.json({ tvl });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ error: "Something went wrong.", details: err["reason"] });
  }
};

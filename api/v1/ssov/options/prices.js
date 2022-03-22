import getSsovOptionsPrices from "../../../../helpers/getSsovOptionsPrices";
import { BLOCKCHAIN_TO_CHAIN_ID } from "../../../../helpers/constants";

const ASSET_TO_GETTER = {
  "DPX-CALL": {
    fn: getSsovOptionsPrices,
    args: ["DPX", "call", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]],
  },
  "RDPX-CALL": {
    fn: getSsovOptionsPrices,
    args: ["RDPX", "call", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]],
  },
  "ETH-CALL": {
    fn: getSsovOptionsPrices,
    args: ["ETH", "call", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]],
  },
  "GOHM-CALL": {
    fn: getSsovOptionsPrices,
    args: ["GOHM", "call", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]],
  },
  "GMX-CALL": {
    fn: getSsovOptionsPrices,
    args: ["GMX", "call", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]],
  },
  "BNB-CALL": {
    fn: getSsovOptionsPrices,
    args: ["BNB", "call", BLOCKCHAIN_TO_CHAIN_ID["BINANCE"]],
  },
  "DPX-PUT": {
    fn: getSsovOptionsPrices,
    args: ["DPX", "put", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]],
  },
  "RDPX-PUT": {
    fn: getSsovOptionsPrices,
    args: ["RDPX", "put", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]],
  },
  "ETH-PUT": {
    fn: getSsovOptionsPrices,
    args: ["ETH", "put", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]],
  },
  "GOHM-PUT": {
    fn: getSsovOptionsPrices,
    args: ["GOHM", "put", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]],
  },
  "GMX-PUT": {
    fn: getSsovOptionsPrices,
    args: ["GMX", "put", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]],
  },
  "BNB-PUT": {
    fn: getSsovOptionsPrices,
    args: ["BNB", "put", BLOCKCHAIN_TO_CHAIN_ID["BINANCE"]],
  },
};

export default async (req, res) => {
  try {
    const asset = req.query.asset;
    const type = (req.query.type || "CALL").toUpperCase();

    if (!asset) res.status(400).json({ error: "Missing asset parameter." });
    if (!type) res.status(400).json({ error: "Missing type parameter." });

    let prices = await ASSET_TO_GETTER[`${asset}-${type}`].fn(...ASSET_TO_GETTER[`${asset}-${type}`].args);

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate");
    res.json({ prices });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ error: "Something went wrong.", details: err["reason"] });
  }
};

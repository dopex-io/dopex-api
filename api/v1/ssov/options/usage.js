import getSsovOptionsUsage from "../../../../helpers/getSsovOptionsUsage";
import { BLOCKCHAIN_TO_CHAIN_ID } from "../../../../helpers/constants";

const ASSET_TO_GETTER = {
  "DPX-CALL": {
    fn: getSsovOptionsUsage,
    args: ["DPX", "call", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]],
  },
  "RDPX-CALL": {
    fn: getSsovOptionsUsage,
    args: ["RDPX", "call", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]],
  },
  "ETH-CALL": {
    fn: getSsovOptionsUsage,
    args: ["ETH", "call", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]],
  },
  "GOHM-CALL": {
    fn: getSsovOptionsUsage,
    args: ["GOHM", "call", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]],
  },
  "GMX-CALL": {
    fn: getSsovOptionsUsage,
    args: ["GMX", "call", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]],
  },
  "BNB-CALL": {
    fn: getSsovOptionsUsage,
    args: ["BNB", "call", BLOCKCHAIN_TO_CHAIN_ID["BINANCE"]],
  },
  "DPX-PUT": {
    fn: getSsovOptionsUsage,
    args: ["DPX", "put", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]],
  },
  "RDPX-PUT": {
    fn: getSsovOptionsUsage,
    args: ["RDPX", "put", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]],
  },
  "ETH-PUT": {
    fn: getSsovOptionsUsage,
    args: ["ETH", "put", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]],
  },
  "GOHM-PUT": {
    fn: getSsovOptionsUsage,
    args: ["GOHM", "put", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]],
  },
  "GMX-PUT": {
    fn: getSsovOptionsUsage,
    args: ["GMX", "put", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]],
  },
  "BNB-PUT": {
    fn: getSsovOptionsUsage,
    args: ["BNB", "put", BLOCKCHAIN_TO_CHAIN_ID["BINANCE"]],
  },
};

export default async (req, res) => {
  try {
    const asset = req.query.asset;
    const type = req.query.type;

    if (!asset) res.status(400).json({ error: "Missing asset parameter." });
    if (!type) res.status(400).json({ error: "Missing type parameter." });

    let usage = await ASSET_TO_GETTER[`${asset}-${type}`].fn(...ASSET_TO_GETTER[`${asset}-${type}`].args);

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate");
    res.json(usage);
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ error: "Something went wrong.", details: err["reason"] });
  }
};

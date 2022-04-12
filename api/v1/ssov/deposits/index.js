import getSsovDeposits from "../../../../helpers/getSsovDeposits";
import { BLOCKCHAIN_TO_CHAIN_ID } from "../../../../helpers/constants";

const ASSET_TO_GETTER = {
  "DPX-CALL": {
    fn: getSsovDeposits,
    args: ["DPX", "call", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]],
  },
  "RDPX-CALL": {
    fn: getSsovDeposits,
    args: ["RDPX", "call", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]],
  },
  "GOHM-CALL": {
    fn: getSsovDeposits,
    args: ["GOHM", "call", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]],
  },
  "GMX-CALL": {
    fn: getSsovDeposits,
    args: ["GMX", "call", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]],
  },
  "BNB-CALL": {
    fn: getSsovDeposits,
    args: ["BNB", "call", BLOCKCHAIN_TO_CHAIN_ID["BINANCE"]],
  },
  "DPX-PUT": {
    fn: getSsovDeposits,
    args: ["DPX", "put", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]],
  },
  "RDPX-PUT": {
    fn: getSsovDeposits,
    args: ["RDPX", "put", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]],
  },
  "ETH-PUT": {
    fn: getSsovDeposits,
    args: ["ETH", "put", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]],
  },
  "GOHM-PUT": {
    fn: getSsovDeposits,
    args: ["GOHM", "put", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]],
  },
  "GMX-PUT": {
    fn: getSsovDeposits,
    args: ["GMX", "put", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]],
  },
  "BNB-PUT": {
    fn: getSsovDeposits,
    args: ["BNB", "put", BLOCKCHAIN_TO_CHAIN_ID["BINANCE"]],
  },
};

export default async (req, res) => {
  try {
    const asset = req.query.asset;
    const type = (req.query.type || "CALL").toUpperCase();

    if (!asset) res.status(400).json({ error: "Missing asset parameter." });
    if (!type) res.status(400).json({ error: "Missing type parameter." });

    let deposits = await ASSET_TO_GETTER[`${asset}-${type}`].fn(
      ...ASSET_TO_GETTER[`${asset}-${type}`].args
    );

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate");
    res.json({ deposits });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ error: "Something went wrong.", details: err["reason"] });
  }
};

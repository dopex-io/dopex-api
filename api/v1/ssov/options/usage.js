const getSsovOptionsUsage = require("../../../../helpers/getSsovOptionsUsage");
const { BLOCKCHAIN_TO_CHAIN_ID } = require("../../../../helpers/constants");

const ASSET_TO_GETTER = {
  "DPX": { fn: getSsovOptionsUsage, args: ["DPX", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]] },
  "RDPX": { fn: getSsovOptionsUsage, args: ["RDPX", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]] },
  "ETH": { fn: getSsovOptionsUsage, args: ["ETH", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]] },
  "GOHM": { fn: getSsovOptionsUsage, args: ["GOHM", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]] },
  "GMX": { fn: getSsovOptionsUsage, args: ["GMX", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]] },
  "BNB": { fn: getSsovOptionsUsage, args: ["BNB", BLOCKCHAIN_TO_CHAIN_ID["BINANCE"]] },
};

module.exports = async (req, res) => {
  try {
    const asset = req.query.asset;

    if (!asset) res.status(400).json({ error: "Missing asset parameter." });

    let usage = await ASSET_TO_GETTER[asset].fn(...ASSET_TO_GETTER[asset].args);

    res.json(usage);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Something went wrong.", details: err["reason"] });
  }
};

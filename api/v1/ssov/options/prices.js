import getSsovOptionsPrices from "../../../../helpers/getSsovOptionsPrices";
const { BLOCKCHAIN_TO_CHAIN_ID } = require("../../../../helpers/constants");

const ASSET_TO_GETTER = {
  "DPX": { fn: getSsovOptionsPrices, args: ["DPX", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]] },
  "RDPX": { fn: getSsovOptionsPrices, args: ["RDPX", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]] },
  "ETH": { fn: getSsovOptionsPrices, args: ["ETH", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]] },
  "GOHM": { fn: getSsovOptionsPrices, args: ["GOHM", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]] },
  "GMX": { fn: getSsovOptionsPrices, args: ["GMX", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]] },
  "BNB": { fn: getSsovOptionsPrices, args: ["BNB", BLOCKCHAIN_TO_CHAIN_ID["BNB"]] },
};

module.exports = async (req, res) => {
  try {
    const asset = req.query.asset;

    if (!asset) res.status(400).json({ error: "Missing asset parameter." });

    let prices = await ASSET_TO_GETTER[asset].fn(...ASSET_TO_GETTER[asset].args);

    res.json({ prices });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Something went wrong.", details: err["reason"] });
  }
};

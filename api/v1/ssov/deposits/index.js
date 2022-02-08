const getSsovDeposits = require("../../../../helpers/getSsovDeposits");
const { BLOCKCHAIN_TO_CHAIN_ID } = require("../../../../helpers/constants");

const ASSET_TO_GETTER = {
  "DPX": { fn: getSsovDeposits, args: ["DPX", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]] },
  "RDPX": { fn: getSsovDeposits, args: ["RDPX", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]] },
  "ETH": { fn: getSsovDeposits, args: ["ETH", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]] },
  "GOHM": { fn: getSsovDeposits, args: ["GOHM", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]] },
  "GMX": { fn: getSsovDeposits, args: ["GMX", BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]] },
  "BNB": { fn: getSsovDeposits, args: ["BNB", BLOCKCHAIN_TO_CHAIN_ID["BINANCE"]] },
};

module.exports = async (req, res) => {
  try {
    const asset = req.query.asset;

    if (!asset) res.status(400).json({ error: "Missing asset parameter." });

    let deposits = await ASSET_TO_GETTER[asset].fn(...ASSET_TO_GETTER[asset].args);

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
    res.json({ deposits });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Something went wrong.", details: err["reason"] });
  }
};

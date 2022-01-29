import getSsovOptionsPrices from "../../../../helpers/getSsovOptionsPrices";

const ASSET_TO_GETTER = {
  "DPX": { fn: getSsovOptionsPrices, args: ["DPX"] },
  "RDPX": { fn: getSsovOptionsPrices, args: ["RDPX"] },
  "ETH": { fn: getSsovOptionsPrices, args: ["ETH"] },
  "GOHM": { fn: getSsovOptionsPrices, args: ["GOHM"] },
  "GMX": { fn: getSsovOptionsPrices, args: ["GMX"] },
  "BNB": { fn: getSsovOptionsPrices, args: ["BNB"] },
};

module.exports = async (req, res) => {
  try {
    const asset = req.query.asset;

    if (!asset) res.status(400).json({ error: "Missing asset parameter." });

    let prices = await ASSET_TO_GETTER[asset].fn(...ASSET_TO_GETTER[asset].args);

    res.json({ prices });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Something went wrong." });
  }
};

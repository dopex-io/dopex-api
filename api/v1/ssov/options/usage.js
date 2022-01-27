const getSsovOptionsUsage = require("../../../../helpers/getSsovOptionsUsage");

const ASSET_TO_GETTER = {
  "DPX": { fn: getSsovOptionsUsage, args: ["DPX"] },
  "RDPX": { fn: getSsovOptionsUsage, args: ["RDPX"] },
  "ETH": { fn: getSsovOptionsUsage, args: ["ETH"] },
  "GOHM": { fn: getSsovOptionsUsage, args: ["GOHM"] },
  "GMX": { fn: getSsovOptionsUsage, args: ["GMX"] },
  "BNB": { fn: getSsovOptionsUsage, args: ["BNB"] },
};

module.exports = async (req, res) => {
  try {
    const asset = req.query.asset;

    if (!asset) res.status(500).json({ error: "Please send the GET parameter asset" });

    let usage = await ASSET_TO_GETTER[asset].fn(...ASSET_TO_GETTER[asset].args);

    res.json(usage);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Something went wrong." });
  }
};

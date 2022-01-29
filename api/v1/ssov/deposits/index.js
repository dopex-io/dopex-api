const getSsovDeposits = require("../../../../helpers/getSsovDeposits");

const ASSET_TO_GETTER = {
  "DPX": { fn: getSsovDeposits, args: ["DPX"] },
  "RDPX": { fn: getSsovDeposits, args: ["RDPX"] },
  "ETH": { fn: getSsovDeposits, args: ["ETH"] },
  "GOHM": { fn: getSsovDeposits, args: ["GOHM"] },
  "GMX": { fn: getSsovDeposits, args: ["GMX"] },
  "BNB": { fn: getSsovDeposits, args: ["BNB"] },
};

module.exports = async (req, res) => {
  try {
    const asset = req.query.asset;

    if (!asset) res.status(400).json({ error: "Missing asset parameter." });

    let deposits = await ASSET_TO_GETTER[asset].fn(...ASSET_TO_GETTER[asset].args);

    res.json({ deposits });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Something went wrong." });
  }
};

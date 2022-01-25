const getSsovOptionsPrices = require("../../../../helpers/getSsovOptionsPrices");

const SSOV_TO_GETTER = {
  "dpx-ssov": { fn: getSsovOptionsPrices, args: ["DPX"] },
  "rdpx-ssov": { fn: getSsovOptionsPrices, args: ["RDPX"] },
  "eth-ssov": { fn: getSsovOptionsPrices, args: ["ETH"] },
  "gohm-ssov": { fn: getSsovOptionsPrices, args: ["GOHM"] },
  "gmx-ssov": { fn: getSsovOptionsPrices, args: ["GMX"] },
  "bnb-ssov": { fn: getSsovOptionsPrices, args: ["BNB"] },
};

module.exports = async (req, res) => {
  try {
    const ssov = req.query.ssov;

    if (!ssov) return;

    let deposits = await SSOV_TO_GETTER[ssov].fn(...SSOV_TO_GETTER[ssov].args);

    res.json({ deposits });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Something went wrong." });
  }
};

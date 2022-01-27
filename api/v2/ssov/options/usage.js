const getSsovOptionsUsage = require("../../../../helpers/getSsovOptionsUsage");

const SSOV_TO_GETTER = {
  "dpx-ssov": { fn: getSsovOptionsUsage, args: ["DPX"] },
  "rdpx-ssov": { fn: getSsovOptionsUsage, args: ["RDPX"] },
  "eth-ssov": { fn: getSsovOptionsUsage, args: ["ETH"] },
  "gohm-ssov": { fn: getSsovOptionsUsage, args: ["GOHM"] },
  "gmx-ssov": { fn: getSsovOptionsUsage, args: ["GMX"] },
  "bnb-ssov": { fn: getSsovOptionsUsage, args: ["BNB"] },
};

module.exports = async (req, res) => {
  try {
    const ssov = req.query.ssov;

    if (!ssov) return;

    let usage = await SSOV_TO_GETTER[ssov].fn(...SSOV_TO_GETTER[ssov].args);

    res.json(usage);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Something went wrong." });
  }
};

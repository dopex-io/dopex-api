const getSsovDeposits = require("../../../../helpers/getSsovDeposits");

const SSOV_TO_GETTER = {
  "dpx-ssov": { fn: getSsovDeposits, args: ["DPX"] },
  "rdpx-ssov": { fn: getSsovDeposits, args: ["RDPX"] },
  "eth-ssov": { fn: getSsovDeposits, args: ["ETH"] },
  "gohm-ssov": { fn: getSsovDeposits, args: ["GOHM"] },
  "gmx-ssov": { fn: getSsovDeposits, args: ["GMX"] },
  "bnb-ssov": { fn: getSsovDeposits, args: ["BNB"] },
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

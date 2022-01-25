const BN = require("bignumber.js");

const getSsovTvl = require("../../../../helpers/getSsovTvl");

module.exports = async (req, res) => {
  try {
    let tvl;

    const INCLUDE_QUERY_MAPPING = {};

    const filter = req.query.filter?.split(',');

    if (!filter || filter.includes('dpx-ssov')) INCLUDE_QUERY_MAPPING["dpx-ssov"] = { fn: getSsovTvl, args: ["DPX"] };
    if (!filter || filter.includes('rdpx-ssov')) INCLUDE_QUERY_MAPPING["rdpx-ssov"] = { fn: getSsovTvl, args: ["RDPX"] };
    if (!filter || filter.includes('gohm-ssov')) INCLUDE_QUERY_MAPPING["gohm-ssov"] = { fn: getSsovTvl, args: ["GOHM"] };
    if (!filter || filter.includes('gmx-ssov')) INCLUDE_QUERY_MAPPING["gmx-ssov"] = { fn: getSsovTvl, args: ["GMX"] };
    if (!filter || filter.includes('eth-ssov')) INCLUDE_QUERY_MAPPING["eth-ssov"] = { fn: getSsovTvl, args: ["ETH"] };

    const promises = req.query.include
      ? req.query.include.split(",")
      : Object.keys(INCLUDE_QUERY_MAPPING);

    const data = await Promise.all(
      promises.map((q) => {
        const { fn, args } = INCLUDE_QUERY_MAPPING[q];
        return fn(...args);
      })
    );

    tvl = data.reduce((acc, val) => {
      acc = acc.plus(val);

      return acc;
    }, new BN(0));

    res.json({ 'tvl': tvl, 'filter': Object.keys(INCLUDE_QUERY_MAPPING).join(',') });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Something went wrong." });
  }
};

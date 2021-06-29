const getTvl = require("../../../../helpers/getTvl");
const fetch = require("node-fetch");

const isValidQuery = (query) => {
  const upperCasedQuery = query.pool.toUpperCase();
  if (
    upperCasedQuery !== "DPX" &&
    upperCasedQuery !== "DPX-WETH" &&
    upperCasedQuery !== "RDPX-WETH"
  ) {
    return false;
  }
  return true;
};

module.exports = async (req, res) => {
  let tvl = 0;
  if (req.query.pool) {
    if (isValidQuery(req.query)) {
      const ethPriceFinal = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
      )
        .then((res) => res.json())
        .then((data) => {
          return data.ethereum.usd;
        });
      tvl = (
        await getTvl(req.query.pool.toUpperCase(), ethPriceFinal)
      ).toString();
    } else {
      return res
        .status(400)
        .json({ error: "Incorrect query. Pool doest not exist." });
    }
  } else {
    const ethPriceFinal = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
    )
      .then((res) => res.json())
      .then((data) => {
        return data.ethereum.usd;
      });
    const [dpxTvl, dpxWethTvl, rdpxWethTvl] = await Promise.all([
      getTvl("DPX", ethPriceFinal),
      getTvl("DPX-WETH", ethPriceFinal),
      getTvl("RDPX-WETH", ethPriceFinal),
    ]);
    tvl = dpxTvl.plus(dpxWethTvl).plus(rdpxWethTvl).toString();
  }
  res.json({ tvl });
};

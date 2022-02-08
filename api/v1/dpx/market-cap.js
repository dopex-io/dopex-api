const getPrice = require("../../../helpers/getPrice");
const getDpxCirculatingSupply = require("../../../helpers/getDpxCirculatingSupply");

module.exports = async (_req, res) => {
  const [dpxPrice, dpxCirculatingSupply] = await Promise.all([
    getPrice("dopex"),
    getDpxCirculatingSupply(),
  ]);

  const marketCap = dpxPrice.usd * dpxCirculatingSupply;

  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
  await res.json({ marketCap });
};

const getPrice = require("../../../helpers/getPrice");

module.exports = async (_req, res) => {
  const rdpxPrice = await getPrice("dopex-rebate-token");

  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
  res.json({ price: { ...rdpxPrice } });
};

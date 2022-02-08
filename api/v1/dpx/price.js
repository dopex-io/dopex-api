const getPrice = require("../../../helpers/getPrice");

module.exports = async (_req, res) => {
  const dpxPrice = await getPrice("dopex");

  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
  res.json({ price: { ...dpxPrice } });
};

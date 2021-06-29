const getPrice = require("../../../helpers/getPrice");

module.exports = async (_req, res) => {
  const dpxPrice = await getPrice("dopex");

  res.json({ price: { usd: dpxPrice } });
};

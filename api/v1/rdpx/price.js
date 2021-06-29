const getPrice = require("../../../helpers/getPrice");

module.exports = async (_req, res) => {
  const rdpxPrice = await getPrice("dopex-rebate-token");

  res.json({ price: { usd: rdpxPrice } });
};

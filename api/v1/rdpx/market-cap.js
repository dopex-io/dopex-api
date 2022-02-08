const getPrice = require("../../../helpers/getPrice");
const getRdpxCirculatingSupply = require("../../../helpers/getRdpxCirculatingSupply");

module.exports = async (_req, res) => {
  const [rdpxPrice, rdpxCirculatingSupply] = await Promise.all([
    getPrice("dopex-rebate-token"),
    getRdpxCirculatingSupply(),
  ]);

  const marketCap = rdpxPrice.usd * rdpxCirculatingSupply;

  await res.json({ marketCap });
};

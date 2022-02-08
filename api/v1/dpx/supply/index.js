const getDpxCirculatingSupply = require("../../../../helpers/getDpxCirculatingSupply");

module.exports = async (_req, res) => {
  const circulatingSupply = await getDpxCirculatingSupply();

  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
  res.json({ totalSupply: 500000, maxSupply: 500000, circulatingSupply });
};

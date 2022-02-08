const getRdpxCirculatingSupply = require("../../../../helpers/getRdpxCirculatingSupply");

module.exports = async (_req, res) => {
  const circulatingSupply = await getRdpxCirculatingSupply();

  res.json({ totalSupply: 2250000, maxSupply: "∞", circulatingSupply });
};

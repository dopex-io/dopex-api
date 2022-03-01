import getRdpxCirculatingSupply from "../../../../helpers/getRdpxCirculatingSupply";

export default async (_req, res) => {
  const circulatingSupply = await getRdpxCirculatingSupply();

  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate");
  res.json({ totalSupply: 2250000, maxSupply: "∞", circulatingSupply });
};

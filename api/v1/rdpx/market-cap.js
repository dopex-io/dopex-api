import getPrice from "../../../helpers/getPrice";
import getRdpxCirculatingSupply from "../../../helpers/getRdpxCirculatingSupply";

export default async (_req, res) => {
  const [rdpxPrice, rdpxCirculatingSupply] = await Promise.all([
    getPrice("dopex-rebate-token"),
    getRdpxCirculatingSupply(),
  ]);

  const marketCap = rdpxPrice.usd * rdpxCirculatingSupply;

  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate");
  await res.json({ marketCap });
};

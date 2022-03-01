import getPrice from "../../../helpers/getPrice";

export default async (_req, res) => {
  const dpxPrice = await getPrice("dopex");

  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate");
  res.json({ price: { ...dpxPrice } });
};

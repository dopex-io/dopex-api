import getSsovApy from "../../../../helpers/getSsovApy";

export default async (req, res) => {
  try {
    const asset = req.query.asset;

    const type = req.query.type || "call";

    const apy = getSsovApy(asset, type);

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate");
    res.json({ apy });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ error: "Something went wrong.", details: err["reason"] });
  }
};

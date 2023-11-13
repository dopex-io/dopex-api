import getOraclePrice from "../../../helpers/v2/getOraclePrice";
import getPrice from "../../../helpers/v2/getPrice";
import tokens from "../../../helpers/v2/tokens";

export default async (req, res) => {
  const tokenData = tokens.find(
    (t) => t.symbol.toLowerCase() === req.query.token.toLowerCase()
  );

  if (!tokenData)
    return res.status(400).json({
      error: "Token not supported.",
    });

  try {
    const [oraclePrice, cgPrice] = await Promise.all([
      getOraclePrice(tokenData),
      getPrice(tokenData.cgId),
    ]);

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate");

    res.json({
      oraclePrice,
      cgPrice: String(cgPrice.price),
      change24h: String(cgPrice.usd_24h_change),
      oracleType: tokenData.oracleType,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: "Something went wrong.",
      details: err["reason"],
    });
  }
};

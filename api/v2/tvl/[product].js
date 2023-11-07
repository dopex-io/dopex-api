import { SSOVS } from "../../../helpers/v2/constants";
import getSsovTvl from "../../../helpers/v2/getSsovTvl";
import getVedpxTvl from "../../../helpers/v2/getVedpxTvl";

export default async (req, res) => {
  try {
    const product = req.query.product;

    let tvl = 0;

    switch (product) {
      case "ssov": {
        const _SSOVS = SSOVS.filter((ssov) => !ssov.retired);

        const tvls = await Promise.all(
          _SSOVS.map((ssov) => {
            return getSsovTvl(ssov);
          })
        );

        tvl = tvls.reduce((acc, item) => {
          return acc + Number(item);
        }, 0);

        tvl = String(tvl);
        break;
      }

      case "vedpx": {
        tvl = await getVedpxTvl();

        tvl = String(tvl);
        break;
      }

      default:
        return res.status(400).json({
          error:
            "Incorrect product. Valid products are ssov, atlantic-straddles, farms and vedpx",
        });
    }

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate");

    res.json({ tvl });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Something went wrong.",
      details: err["reason"],
    });
  }
};

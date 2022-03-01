import groupBy from "lodash/groupBy";

import { SSOVS } from "../../../helpers/constants";
import getSsovApy from "../../../helpers/getSsovApy";
import getSsovTvl from "../../../helpers/getSsovTvl";

export default async (req, res) => {
  try {
    const tvls = await Promise.all(
      SSOVS.map((ssov) => {
        return getSsovTvl(ssov.name, ssov.type, ssov.chainId);
      })
    );

    const apys = await Promise.all(
      SSOVS.map((ssov) => {
        return getSsovApy(ssov.name, ssov.type);
      })
    );

    const data = SSOVS.map((item, index) => {
      return { ...item, tvl: tvls[index].toString(), apy: apys[index] };
    });

    const fData = groupBy(data, "chainId");

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate");

    res.json({ ...fData });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ error: "Something went wrong.", details: err["reason"] });
  }
};

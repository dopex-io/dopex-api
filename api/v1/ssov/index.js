import groupBy from "lodash/groupBy";

import { SSOVS } from "../../../helpers/constants";
import getSsovApy from "../../../helpers/getSsovApy";
import getSsovTvl from "../../../helpers/getSsovTvl";
import getSsovData from "../../../helpers/getSsovData";

export default async (req, res) => {
  try {
    const [tvls, apys, data] = await Promise.all([
      Promise.all(
        SSOVS.map((ssov) => {
          return getSsovTvl(ssov.name, ssov.type, ssov.chainId);
        })
      ),
      Promise.all(
        SSOVS.map((ssov) => {
          return getSsovApy(ssov.name, ssov.type);
        })
      ),
      Promise.all(
        SSOVS.map((ssov) => {
          return getSsovData(ssov.name, ssov.type, ssov.chainId);
        })
      ),
    ]);

    const ssovArray = SSOVS.map((item, index) => {
      return {
        ...item,
        tvl: tvls[index].toString(),
        apy: apys[index],
        currentEpoch: data[index].currentEpoch,
        totalEpochDeposits: data[index].totalEpochDeposits,
      };
    });

    const fData = groupBy(ssovArray, "chainId");

    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate");

    res.json({ ...fData });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ error: "Something went wrong.", details: err["reason"] });
  }
};

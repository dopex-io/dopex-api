import { BigNumber } from "ethers";

import { getBuiltGraphSDK } from "../../../.graphclient";

import getSsov24hVolume from "./getSsov24hVolume";
import getStraddle24hVolume from "./getStraddle24hVolume";

import getSsovTokenPrice from "../getSsovTokenPrice";

const sdk = getBuiltGraphSDK();

const getAll24hVolume = async () => {
  const now = BigNumber.from(
    Number(new Date().getTime() / 1000 - 86400).toFixed(0)
  ).toString();

  let ssovAmount = 0;
  let straddleAmount = 0;

  const tokenToPrice = await getSsovTokenPrice();

  try {
    const ssovPayload = await sdk.getSsovVolume({
      fromTimestamp: now,
    });
    ssovAmount = await getSsov24hVolume(ssovPayload, tokenToPrice);
  } catch (e) {
    console.error("Fail to get for ssovPayload", e);
  }

  try {
    const [straddlePayload, straddlePolygonPayload] = await Promise.all([
      sdk.getStraddleVolume({
        fromTimestamp: now,
      }),
      sdk.getStraddlePolygonVolume({
        fromTimestamp: now,
      }),
    ]);
    const [straddleEthAmount, straddlePolygonAmount] = await Promise.all([
      getStraddle24hVolume(straddlePayload, tokenToPrice),
      getStraddle24hVolume(straddlePolygonPayload, tokenToPrice),
    ]);
    straddleAmount = straddleEthAmount + straddlePolygonAmount;
  } catch (e) {
    console.error("Fail to get for straddlePayload", e);
  }

  return {
    total: ssovAmount + straddleAmount,
  };
};

export default getAll24hVolume;

import { Addresses, Curve2PoolSsovPut__factory } from "@dopex-io/sdk";
import BN from "bignumber.js";
import { ethers } from "ethers";

import getProvider from "./getProvider";

export default async (token, type, chainId) => {
  const contractAddresses = Addresses[chainId];
  const provider = getProvider(chainId);

  const ssovAddress =
    type === "put"
      ? contractAddresses["2CRV-SSOV-P"][token].Vault
      : contractAddresses.SSOV[token].Vault;

  let ssovContract;

  if (type === 'call')
    ssovContract = ERC20SSOV__factory.connect(ssovAddress, provider);
  else
    ssovContract = Curve2PoolSsovPut__factory.connect(ssovAddress, provider);

  let epoch = await ssovContract.currentEpoch();

  let isEpochExpired = await ssovContract.isEpochExpired(epoch);

  if (epoch.isZero()) {
    epoch = 1;
  } else if (isEpochExpired) {
    epoch = epoch.add(1);
  }

  const strikes = await ssovContract.getEpochStrikes(epoch);

  const optionsUsage = {};
  let totalOptionsPurchased = 0;
  let epochOptionsPurchased;

  if (type === 'call')
    epochOptionsPurchased = await ssovContract.getTotalEpochCallsPurchased(epoch);
  else
    epochOptionsPurchased = await ssovContract.getTotalEpochPutsPurchased(epoch);

  let i;

  const converter =
    token === "BNB" &&
    new ethers.Contract(
      ssovContract.address,
      ["function vbnbToBnb(uint256 vbnbAmount) public view returns (uint256)"],
      provider
    );

  for (i in strikes) {
    const optionsPurchased =
      token === "BNB" && type === "CALL"
        ? await converter.vbnbToBnb(epochCallsPurchased[i].toString())
        : epochOptionsPurchased[i];
    totalOptionsPurchased = optionsPurchased.add(totalOptionsPurchased);
    optionsUsage[BN(strikes[i].toString()).dividedBy(1e8)] = BN(
      optionsPurchased.toString()
    ).dividedBy(1e18);
  }

  return {
    total: BN(totalOptionsPurchased.toString()).dividedBy(1e18),
    strikes: optionsUsage,
  };
};

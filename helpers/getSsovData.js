import { Addresses, ERC20SSOV__factory } from "@dopex-io/sdk";

import getProvider from "./getProvider";

export default async (token, type, chainId) => {
  const contractAddresses = Addresses[chainId];
  const provider = getProvider(chainId);

  const ssovAddress =
    type === "put"
      ? contractAddresses["2CRV-SSOV-P"][token].Vault
      : contractAddresses.SSOV[token].Vault;

  const ssovContract = ERC20SSOV__factory.connect(ssovAddress, provider);

  let epoch = await ssovContract.currentEpoch();
  const isEpochExpired = await ssovContract.isEpochExpired(epoch);

  if (epoch.isZero()) {
    epoch = 1;
  } else if (isEpochExpired) {
    epoch = epoch.add(1);
  }

  const totalEpochDeposits = await ssovContract.totalEpochDeposits(epoch);

  return {
    currentEpoch: Number(epoch.toString()),
    totalEpochDeposits: totalEpochDeposits.toString(),
  };
};

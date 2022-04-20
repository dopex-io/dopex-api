import {Addresses, ERC20SSOV__factory, SsovV3__factory} from "@dopex-io/sdk";

import getProvider from "./getProvider";

export default async (token, type, chainId, duration) => {
  const contractAddresses = Addresses[chainId];
  const provider = getProvider(chainId);

  if (duration === 'monthly') {
    const ssovAddress =
        type === "put"
            ? contractAddresses["2CRV-SSOV-P"][token].Vault
            : contractAddresses.SSOV[token].Vault;

    const ssovContract = ERC20SSOV__factory.connect(ssovAddress, provider);

    let epoch = await ssovContract.currentEpoch();
    const isEpochExpired = await ssovContract.isEpochExpired(epoch);
    const epochTimes = await ssovContract.getEpochTimes(epoch);
    const underlyingPrice = await ssovContract.getUsdPrice();

    if (epoch.isZero()) {
      epoch = 1;
    } else if (isEpochExpired) {
      epoch = epoch.add(1);
    }

    const totalEpochDeposits = await ssovContract.totalEpochDeposits(epoch);

    return {
      currentEpoch: Number(epoch.toString()),
      totalEpochDeposits: totalEpochDeposits.toString(),
      epochStartDate: epochTimes[0].toString(),
      epochEndDate: epochTimes[1].toString(),
      underlyingPrice: underlyingPrice.toNumber() / 10 ** 8
    };
  } else if (duration === 'weekly') {
    const ssovAddress = "0x376bEcbc031dd53Ffc62192043dE43bf491988FD";

    const ssovContract = SsovV3__factory.connect(ssovAddress, provider);

    let epoch = await ssovContract.currentEpoch();

    const epochData = await ssovContract.getEpochData(epoch);
    const totalEpochDeposits = epochData['totalCollateralBalance'];
    const underlyingPrice = await ssovContract.getUnderlyingPrice();
    const epochTimes = await ssovContract.getEpochTimes(epoch);

    return {
      currentEpoch: Number(epoch.toString()),
      totalEpochDeposits: totalEpochDeposits.toString(),
      epochStartDate: epochTimes[0].toString(),
      epochEndDate: epochTimes[1].toString(),
      underlyingPrice: underlyingPrice.toNumber() / 10 ** 8
    };
  }
};

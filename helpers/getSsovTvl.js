import {
  Addresses,
  ERC20SSOV__factory,
  Curve2PoolSsovPut__factory,
  SsovV3__factory,
} from '@dopex-io/sdk';
import { ethers } from 'ethers';
import BN from 'bignumber.js';

import getProvider from './getProvider';
import {providers} from "@0xsequence/multicall";

export default async (token, type, chainId, duration) => {
  const contractAddresses = Addresses[chainId];

  const provider = getProvider(Number(chainId));

  let tvl;

  if (type === 'put' && duration === 'monthly') {
    const ssovAddress = contractAddresses['2CRV-SSOV-P'][token].Vault;

    const ssovContract = Curve2PoolSsovPut__factory.connect(
      ssovAddress,
      provider
    );

    let epoch = await ssovContract.currentEpoch();
    let isEpochExpired = await ssovContract.isEpochExpired(epoch);

    if (epoch.isZero()) {
      epoch = 1;
    } else if (isEpochExpired) {
      epoch = epoch.add(1);
    }

    const [deposits, tokenPrice] = await Promise.all([
      ssovContract.totalEpochDeposits(epoch),
      ssovContract.getLpPrice(),
    ]);

    tvl = deposits;

    const allStrikesPremiums = await ssovContract.totalEpochPremium(epoch);

    tvl = tvl.add(allStrikesPremiums);

    tvl = new BN(tvl.toString())
      .multipliedBy(tokenPrice.toString())
      .dividedBy(1e36);
  } else if (type === 'call' && duration === 'monthly') {
    const ssovAddress = contractAddresses.SSOV[token].Vault;

    const ssovContract = ERC20SSOV__factory.connect(ssovAddress, provider);

    let epoch = await ssovContract.currentEpoch();
    let isEpochExpired = await ssovContract.isEpochExpired(epoch);

    if (epoch.isZero()) {
      epoch = 1;
    } else if (isEpochExpired) {
      epoch = epoch.add(1);
    }

    const [deposits, tokenPrice] = await Promise.all([
      ssovContract.totalEpochDeposits(epoch),
      ssovContract.getUsdPrice(),
    ]);

    tvl = deposits;

    const allStrikesPremiums = await ssovContract.getTotalEpochPremium(epoch);
    allStrikesPremiums.map((premium) => (tvl = tvl.add(premium)));

    if (token === 'BNB') {
      const converter = new ethers.Contract(
        ssovContract.address,
        [
          'function vbnbToBnb(uint256 vbnbAmount) public view returns (uint256)',
        ],
        provider
      );

      tvl = await converter.vbnbToBnb(tvl.toString());
    }

    tvl = new BN(tvl.toString())
      .multipliedBy(tokenPrice.toString())
      .dividedBy(1e26);
  } else {
    const infuraProjectId = process.env.INFURA_PROJECT_ID;

    const provider = new providers.MulticallProvider(
      new ethers.getDefaultProvider(
        `https://arbitrum-mainnet.infura.io/v3/${infuraProjectId}`,
        'any'
      )
    );

    const ssovContract = SsovV3__factory.connect(
      '0x376bEcbc031dd53Ffc62192043dE43bf491988FD',
      provider
    );

    const epoch = await ssovContract.currentEpoch();
    const epochData = await ssovContract.getEpochData(epoch);
    const totalEpochDeposits = epochData['totalCollateralBalance'];
    const priceETH = await ssovContract.getUnderlyingPrice();

    tvl = new BN(totalEpochDeposits.toString())
      .dividedBy(1e18)
      .multipliedBy(priceETH);
  }

  return tvl;
};

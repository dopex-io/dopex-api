import { Addresses, ERC20SSOV__factory } from "@dopex-io/sdk";
import BN from "bignumber.js";
import { ethers } from "ethers";

import getPrice from "./getPrice";
import { TOKEN_TO_CG_ID } from "./constants";
import getProvider from "./getProvider";

const getSsovDeposits = async (token, chainId) => {
  const contractAddresses = Addresses[chainId];
  const provider = getProvider(chainId);

  const ssovContract = ERC20SSOV__factory.connect(
    contractAddresses.SSOV[token].Vault,
    provider
  );

  let epoch = await ssovContract.currentEpoch();
  let isEpochExpired = await ssovContract.isEpochExpired(epoch);

  if (epoch.isZero()) {
    epoch = 1;
  } else if (isEpochExpired) {
    epoch = epoch.add(1);
  }

  const [strikes, deposits, tokenPrice] = await Promise.all([
    ssovContract.getEpochStrikes(epoch),
    ssovContract.getTotalEpochStrikeDeposits(epoch),
    getPrice(TOKEN_TO_CG_ID[token]),
  ]);

  const converter =
    token === "BNB" &&
    new ethers.Contract(
      ssovContract.address,
      ["function vbnbToBnb(uint256 vbnbAmount) public view returns (uint256)"],
      provider
    );

  const ssovDeposits = {};
  for (let i in strikes) {
    const amount =
      token === "BNB" ? await converter.vbnbToBnb(deposits[i]) : deposits[i];
    ssovDeposits[BN(strikes[i].toString()).dividedBy(1e8)] = {
      amount: BN(amount.toString()).dividedBy(1e18).toString(),
      usd: BN(amount.toString())
        .multipliedBy(tokenPrice.usd)
        .dividedBy(1e18)
        .toString(),
    };
  }

  return ssovDeposits;
};

export default getSsovDeposits;

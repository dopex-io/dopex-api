import { ERC20__factory, Addresses } from "@dopex-io/sdk";
import { ethers, BigNumber } from "ethers";

import { BLOCKCHAIN_TO_CHAIN_ID } from "../helpers/constants";
import getProvider from "./getProvider";

const getRdpxCirculatingSupply = async () => {
  const arbProvider = getProvider(BLOCKCHAIN_TO_CHAIN_ID.ARBITRUM);

  /**
   * Circulating Supply = Total Supply - Treasury Balances - Non emitted tokens
   */

  const rdpxArb = ERC20__factory.connect(
    Addresses[BLOCKCHAIN_TO_CHAIN_ID["ARBITRUM"]].RDPX,
    arbProvider
  );

  const totalSupply = await rdpxArb.totalSupply();

  const arbAddresses = [
    // Arbitrum mainnet treasury
    "0x2fa6F21eCfE274f594F470c376f5BDd061E08a37",
    // SSOV Strategy contracts
    "0xb277Fc0AC7e86c4c5d4C542296C3519E6eb99A2A", // rDPX Call Weeklies
    "0xbBC4ccF4FC2c5260F072aE870EE99Df3ae5515cd", // rDPX Call Monthlies
    // Deployer Address
    "0xDe485812E28824e542B9c2270B6b8eD9232B7D0b",
    // rDPX Reserve
    "0x13F4063c6E0CB8B6486fcb726dCe3CD19bae97E8",
  ];

  const arbRdpxBalances = await Promise.all(
    arbAddresses.map((addr) => {
      return rdpxArb.balanceOf(addr);
    })
  );

  const totalArbRdpxBalance = arbRdpxBalances.reduce((acc, balance) => {
    return acc.add(balance);
  }, BigNumber.from(0));

  const cs = totalSupply.sub(totalArbRdpxBalance);

  return Number(ethers.utils.formatEther(cs));
};

export default getRdpxCirculatingSupply;

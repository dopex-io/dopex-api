import { ethers } from 'ethers';
import { providers } from '@0xsequence/multicall';
import { BLOCKCHAIN_TO_CHAIN_ID } from '../helpers/constants';

export default (chainId) => {
  const infuraProjectId = process.env.INFURA_PROJECT_ID;
  const bscRpcUrl = process.env.BSC_RPC_URL;
  const avaxRpxUrl = process.env.AVAX_RPC_URL;
  const metisRpcUrl = process.env.METIS_RPC_URL;
  if (chainId === BLOCKCHAIN_TO_CHAIN_ID['ARBITRUM'])
    return new providers.MulticallProvider(
      new ethers.getDefaultProvider(
        `https://arbitrum-mainnet.infura.io/v3/${infuraProjectId}`,
        'any'
      )
    );
  else if (chainId === BLOCKCHAIN_TO_CHAIN_ID['BINANCE'])
    return new providers.MulticallProvider(
      new ethers.providers.JsonRpcProvider(
        bscRpcUrl,
        BLOCKCHAIN_TO_CHAIN_ID['BINANCE']
      )
    );
  else if (chainId === BLOCKCHAIN_TO_CHAIN_ID['AVAX'])
    return new providers.MulticallProvider(
      new ethers.providers.JsonRpcProvider(
        avaxRpxUrl,
        BLOCKCHAIN_TO_CHAIN_ID['AVAX']
      )
    );
  else if (chainId === BLOCKCHAIN_TO_CHAIN_ID['METIS'])
    return new providers.MulticallProvider(
      new ethers.providers.JsonRpcProvider(
        metisRpcUrl,
        BLOCKCHAIN_TO_CHAIN_ID['METIS']
      )
    );
};

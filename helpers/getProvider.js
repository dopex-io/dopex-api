import { ethers } from 'ethers'
import { providers } from '@0xsequence/multicall'
import { BLOCKCHAIN_TO_CHAIN_ID } from '../helpers/constants'

export default (chainId) => {
    const arbitrumRpcUrl = process.env.ARBITRUM_RPC_URL
    const bscRpcUrl = process.env.BSC_RPC_URL
    const avaxRpxUrl = process.env.AVAX_RPC_URL
    const metisRpcUrl = process.env.METIS_RPC_URL

    if (chainId === BLOCKCHAIN_TO_CHAIN_ID['ARBITRUM'])
        return new providers.MulticallProvider(
            new ethers.providers.StaticJsonRpcProvider(arbitrumRpcUrl, chainId)
        )
    else if (chainId === BLOCKCHAIN_TO_CHAIN_ID['BINANCE'])
        return new providers.MulticallProvider(
            new ethers.providers.StaticJsonRpcProvider(bscRpcUrl, chainId)
        )
    else if (chainId === BLOCKCHAIN_TO_CHAIN_ID['AVAX'])
        return new providers.MulticallProvider(
            new ethers.providers.StaticJsonRpcProvider(avaxRpxUrl, chainId)
        )
    else if (chainId === BLOCKCHAIN_TO_CHAIN_ID['METIS'])
        return new providers.MulticallProvider(
            new ethers.providers.StaticJsonRpcProvider(metisRpcUrl, chainId)
        )
}

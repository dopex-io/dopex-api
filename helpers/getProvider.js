import { ethers } from 'ethers'
import { providers } from '@0xsequence/multicall'

import { BLOCKCHAIN_TO_CHAIN_ID } from '../helpers/constants'

export default (chainId) => {
    const arbitrumRpcUrl = process.env.ARBITRUM_RPC_URL
    const ethereumRpcUrl = process.env.ETHEREUM_RPC_URL
    const bscRpcUrl = process.env.BSC_RPC_URL
    const avalancheRpcUrl = process.env.AVALANCHE_RPC_URL
    const metisRpcUrl = process.env.METIS_RPC_URL
    const goerliRpcUrl = process.env.GOERLI_RPC_URL
    const polygonRpcUrl = process.env.POLYGON_RPC_URL
    const arbGoerliRpcUrl = process.env.ARB_GOERLI_RPC_URL

    if (chainId === BLOCKCHAIN_TO_CHAIN_ID.ARBITRUM)
        return new providers.MulticallProvider(
            new ethers.providers.StaticJsonRpcProvider(arbitrumRpcUrl, chainId)
        )
    else if (chainId === BLOCKCHAIN_TO_CHAIN_ID.ETHEREUM)
        return new providers.MulticallProvider(
            new ethers.providers.StaticJsonRpcProvider(ethereumRpcUrl, chainId)
        )
    else if (chainId === BLOCKCHAIN_TO_CHAIN_ID.BSC)
        return new providers.MulticallProvider(
            new ethers.providers.StaticJsonRpcProvider(bscRpcUrl, chainId)
        )
    else if (chainId === BLOCKCHAIN_TO_CHAIN_ID.AVAX)
        return new providers.MulticallProvider(
            new ethers.providers.StaticJsonRpcProvider(avalancheRpcUrl, chainId)
        )
    else if (chainId === BLOCKCHAIN_TO_CHAIN_ID.METIS)
        return new providers.MulticallProvider(
            new ethers.providers.StaticJsonRpcProvider(metisRpcUrl, chainId)
        )
    else if (chainId === BLOCKCHAIN_TO_CHAIN_ID.GOERLI)
        return new providers.MulticallProvider(
            new ethers.providers.StaticJsonRpcProvider(goerliRpcUrl, chainId)
        )
    else if (chainId === BLOCKCHAIN_TO_CHAIN_ID.POLYGON)
        return new providers.MulticallProvider(
            new ethers.providers.StaticJsonRpcProvider(polygonRpcUrl, chainId)
        )
    else if (chainId === BLOCKCHAIN_TO_CHAIN_ID.ARB_GOERLI) {
        return new providers.MulticallProvider(
            new ethers.providers.StaticJsonRpcProvider(arbGoerliRpcUrl, chainId)
        )
    } else {
        throw Error('Unsupported chainId')
    }
}

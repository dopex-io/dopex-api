import { ethers } from 'ethers'
import { providers } from '@0xsequence/multicall'

import { BLOCKCHAIN_TO_CHAIN_ID } from '../helpers/constants'

export default (chainId) => {
    const arbitrumRpcUrl = process.env.ARBITRUM_RPC_URL
    const ethereumRpcUrl = process.env.ETHEREUM_RPC_URL
    const polygonRpcUrl = process.env.POLYGON_RPC_URL

    if (chainId === BLOCKCHAIN_TO_CHAIN_ID.ARBITRUM)
        return new providers.MulticallProvider(
            new ethers.providers.StaticJsonRpcProvider(arbitrumRpcUrl, chainId)
        )
    else if (chainId === BLOCKCHAIN_TO_CHAIN_ID.ETHEREUM)
        return new providers.MulticallProvider(
            new ethers.providers.StaticJsonRpcProvider(ethereumRpcUrl, chainId)
        )
    else if (chainId === BLOCKCHAIN_TO_CHAIN_ID.POLYGON)
        return new providers.MulticallProvider(
            new ethers.providers.StaticJsonRpcProvider(polygonRpcUrl, chainId)
        )
    else {
        throw Error('Unsupported chainId')
    }
}

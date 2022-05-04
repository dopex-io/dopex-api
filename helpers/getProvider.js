import { ethers } from 'ethers'
import { providers } from '@0xsequence/multicall'

import { BLOCKCHAIN_TO_CHAIN_ID } from '../helpers/constants'

export default (chainId) => {
    const infuraProjectId = process.env.INFURA_PROJECT_ID
    const bscRpcUrl = process.env.BSC_RPC_URL
    const avaxRpxUrl = process.env.AVAX_RPC_URL
    const metisRpcUrl = process.env.METIS_RPC_URL

    if (chainId === BLOCKCHAIN_TO_CHAIN_ID.BSC)
        return new providers.MulticallProvider(
            new ethers.providers.StaticJsonRpcProvider(bscRpcUrl, chainId)
        )
    else if (chainId === BLOCKCHAIN_TO_CHAIN_ID.AVAX)
        return new providers.MulticallProvider(
            new ethers.providers.StaticJsonRpcProvider(avaxRpxUrl, chainId)
        )
    else if (chainId === BLOCKCHAIN_TO_CHAIN_ID.METIS)
        return new providers.MulticallProvider(
            new ethers.providers.StaticJsonRpcProvider(metisRpcUrl, chainId)
        )

    return new providers.MulticallProvider(
        new ethers.providers.InfuraProvider(chainId, infuraProjectId)
    )
}

import { ethers } from 'ethers'

import { BLOCKCHAIN_TO_CHAIN_ID } from '../constants'
import getProvider from '../getProvider'

export default async (tokenData) => {
    const provider = getProvider(BLOCKCHAIN_TO_CHAIN_ID.ARBITRUM)

    const oracle = new ethers.Contract(
        tokenData.oracleAddress,
        [tokenData.oracleFunction],
        provider
    )

    const priceData = await oracle[tokenData.oracleFunctionName]()

    const price = tokenData.oracleGetter
        ? priceData[tokenData.oracleGetter]
        : priceData

    return ethers.utils.formatUnits(price, tokenData.decimals)
}

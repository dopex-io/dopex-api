import { BLOCKCHAIN_TO_CHAIN_ID } from '../../constants'
import getProvider from '../../getProvider'
import { STRADDLES } from '../constants'

import {
    AtlanticStraddle__factory,
    AtlanticStraddleV2__factory,
} from '@dopex-io/sdk'
import { BigNumber } from 'ethers'

async function getStraddleOpenInterest() {
    const openInterestPromises = STRADDLES.map(async (straddle) => {
        const { address, chainId } = straddle
        const provider = getProvider(chainId)

        try {
            const straddlesContract =
                chainId === BLOCKCHAIN_TO_CHAIN_ID.POLYGON
                    ? AtlanticStraddleV2__factory.connect(address, provider)
                    : AtlanticStraddle__factory.connect(address, provider)

            const currentEpoch = await straddlesContract.currentEpoch()

            const [epochData, x, currentPrice] = await Promise.all([
                straddlesContract.epochData(Math.max(currentEpoch, 1)),
                chainId !== BLOCKCHAIN_TO_CHAIN_ID.POLYGON
                    ? straddlesContract.epochCollectionsData(currentEpoch)
                    : () => {},
                straddlesContract.getUnderlyingPrice(),
            ])

            const totalSold =
                chainId === BLOCKCHAIN_TO_CHAIN_ID.POLYGON
                    ? epochData.totalSold
                    : x.totalSold
            const openInterest =
                totalSold.mul(currentPrice).div(BigNumber.from(10).pow(24)) /
                100
            return Number(openInterest)
        } catch (e) {
            console.error('Fail to get straddle open interest for ', address, e)
            return 0
        }
    })
    const openInterestArray = await Promise.all(openInterestPromises)
    return openInterestArray.reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0
    )
}

export default getStraddleOpenInterest

import { OptionScalps__factory } from '@dopex-io/sdk'
import { BigNumber } from 'ethers'

import getProvider from '../../getProvider'

import { BLOCKCHAIN_TO_CHAIN_ID } from '../../constants'
import { SCALPS } from '../constants'

async function getScalpsOpenInterest() {
    const openInterestPromises = SCALPS.map(async (scalp) => {
        const { address } = scalp
        const provider = getProvider(BLOCKCHAIN_TO_CHAIN_ID.ARBITRUM)

        const scalpContract = OptionScalps__factory.connect(address, provider)

        try {
            const [longOi, shortOi, markPrice] = await Promise.all([
                scalpContract.openInterest(false),
                scalpContract.openInterest(true),
                scalpContract.getMarkPrice(),
            ])

            const totalSold = longOi.add(shortOi)
            const openInterest =
                totalSold.mul(markPrice).div(BigNumber.from(10).pow(24)) / 100
            return Number(openInterest)
        } catch (e) {
            console.error('Fail to get scalp open interest for ', address, e)
            return 0
        }
    })
    const openInterestArray = await Promise.all(openInterestPromises)
    return openInterestArray.reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0
    )
}

export default getScalpsOpenInterest

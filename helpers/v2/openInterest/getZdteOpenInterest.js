import getProvider from '../../getProvider'
import { ZDTES } from '../constants'
import { BLOCKCHAIN_TO_CHAIN_ID } from '../../constants'

import { Zdte__factory } from '@dopex-io/sdk'
import { BigNumber } from 'ethers'

async function getZdteOpenInterest() {
    const provider = getProvider(BLOCKCHAIN_TO_CHAIN_ID.ARBITRUM)

    const openInterestPromises = ZDTES.map(async (zdte) => {
        const { address } = zdte
        try {
            const contract = await Zdte__factory.connect(address, provider)

            const [openInterestAmount, markPrice] = await Promise.all([
                contract.openInterestAmount(),
                contract.getMarkPrice(),
            ])

            const openInterest =
                openInterestAmount
                    .mul(markPrice)
                    .mul(2)
                    .div(BigNumber.from(10).pow(24)) / 100
            return Number(openInterest)
        } catch (e) {
            console.error('Fail to get openInterest for zdte', e)
            return 0
        }
    })

    const openInterestArray = await Promise.all(openInterestPromises)
    return openInterestArray.reduce(
        (accumulator, currentValue) => accumulator + currentValue,
        0
    )
}

export default getZdteOpenInterest

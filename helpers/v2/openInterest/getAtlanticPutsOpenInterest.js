import {
    Addresses,
    AtlanticPutsPool__factory,
    AtlanticsViewer__factory,
} from '@dopex-io/sdk'
import { BigNumber } from 'ethers'

import getProvider from '../../getProvider'

import { BLOCKCHAIN_TO_CHAIN_ID } from '../../constants'

async function getAtlanticPutsOpenInterest() {
    const contractAddresses = Addresses[BLOCKCHAIN_TO_CHAIN_ID.ARBITRUM]

    const provider = getProvider(BLOCKCHAIN_TO_CHAIN_ID.ARBITRUM)

    const atlanticsAddress =
        contractAddresses['ATLANTIC-POOLS']['WETH']['PUTS']['WEEKLY']['ACTIVE']

    const atlanticsContract = AtlanticPutsPool__factory.connect(
        atlanticsAddress,
        provider
    )

    const viewerContract = AtlanticsViewer__factory.connect(
        contractAddresses['ATLANTICS-VIEWER'],
        provider
    )

    try {
        const [currentEpoch, usdPrice] = await Promise.all([
            atlanticsContract.currentEpoch(),
            atlanticsContract.getUsdPrice(),
        ])

        const purchases = await viewerContract.getEpochUserOptionsPurchases(
            atlanticsAddress,
            currentEpoch
        )

        const numOpenPositions = purchases.reduce(
            (accumulator, currentValue) => {
                const { optionsAmount } = currentValue
                return accumulator.add(optionsAmount)
            },
            BigNumber.from(0)
        )

        const openInterest =
            numOpenPositions.mul(usdPrice).div(BigNumber.from(10).pow(24)) / 100
        return Number(openInterest)
    } catch (e) {
        console.error('Fail to get AP open interest', e)
        return 0
    }
}

export default getAtlanticPutsOpenInterest

import { Addresses, AtlanticPutsPool__factory } from '@dopex-io/sdk'
import { BigNumber } from 'ethers'

import getProvider from '../../getProvider'

import { BLOCKCHAIN_TO_CHAIN_ID } from '../../constants'

const getAtlantics24hVolume = async (atlanticsPayload) => {
    const contractAddresses = Addresses[BLOCKCHAIN_TO_CHAIN_ID.ARBITRUM]

    const provider = getProvider(BLOCKCHAIN_TO_CHAIN_ID.ARBITRUM)

    const atlanticsAddress =
        contractAddresses['ATLANTIC-POOLS']['WETH']['PUTS']['WEEKLY']['ACTIVE']

    const atlanticsContract = AtlanticPutsPool__factory.connect(
        atlanticsAddress,
        provider
    )

    if (atlanticsPayload.purchases) {
        const volumes = await Promise.all(
            atlanticsPayload.purchases.map(async (trade) => {
                const { purchaseId } = trade

                const [atlanticsPosition, usdPrice] = await Promise.all([
                    atlanticsContract.getOptionsPurchase(purchaseId),
                    atlanticsContract.getUsdPrice(),
                ])

                const amount = atlanticsPosition.optionsAmount
                return (
                    amount.mul(usdPrice).div(BigNumber.from(10).pow(24)) / 100
                )
            })
        )

        return volumes.reduce(
            (accumulator, currentValue) => accumulator + currentValue,
            0
        )
    }

    return 0
}

export default getAtlantics24hVolume

import { AtlanticStraddle__factory } from '@dopex-io/sdk'
import { utils } from 'ethers'

import getProvider from '../getProvider'

export default async (vault) => {
    const { chainId, address } = vault
    const provider = getProvider(chainId)

    const straddlesContract = AtlanticStraddle__factory.connect(
        address,
        provider
    )

    let currentEpoch, tvl, epochData, utilization

    try {
        currentEpoch = await straddlesContract.currentEpoch()
        epochData = await straddlesContract.epochData(currentEpoch)
        utilization = utils.formatUnits(
            epochData['activeUsdDeposits'].div(1e8),
            18
        )
        tvl = utils.formatUnits(epochData['usdDeposits'], 6)
    } catch (err) {
        return {
            currentEpoch: '0',
            tvl: '0',
            utilization: '0',
            epochTimes: {
                startTime: '0',
                expiry: '0',
            },
        }
    }

    return {
        currentEpoch: currentEpoch.toString(),
        tvl,
        utilization,
        epochTimes: {
            startTime: epochData['startTime'].toString(),
            expiry: epochData['expiry'].toString(),
        },
    }
}

import {RateVault__factory} from '@dopex-io/sdk'

import getProvider from '../getProvider'

export default async (vault) => {
    const {
        chainId,
        address
    } = vault
    const provider = getProvider(chainId)

    const rateVaultContract = RateVault__factory.connect(
        address,
        provider
    )

    let currentEpoch = await rateVaultContract.currentEpoch()

    let totalEpochData = await rateVaultContract.totalEpochData(currentEpoch)

    let rate;

    try {
        await rateVaultContract.getCurrentRate()
    } catch(err) {
        rate = 0;
    }

    return {
        currentEpoch: currentEpoch.toString(),
        totalEpochDeposits: totalEpochData['totalCallsDeposits'].add(totalEpochData['totalPutsDeposits']),
        rate: rate,
        tvl: totalEpochData['totalCallsDeposits'].add(totalEpochData['totalPutsDeposits']).add(totalEpochData['epochCallsPremium']).add(totalEpochData['epochPutsPremium'])
    }
}

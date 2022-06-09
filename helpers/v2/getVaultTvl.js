import {
    Addresses,
    RateVault__factory
} from '@dopex-io/sdk'

import getProvider from '../getProvider'

export default async (vault) => {
    const {
        symbol,
        chainId
    } = vault
    const contractAddresses = Addresses[chainId]['RATE-VAULTS']

    const provider = getProvider(Number(chainId))

    const rateVaultContract = RateVault__factory.connect(
        contractAddresses[symbol],
        provider
    )

    let currentEpoch = await rateVaultContract.currentEpoch()

    let totalEpochData = await rateVaultContract.totalEpochData(currentEpoch)

    const isEpochExpired = totalEpochData['isEpochExpired']

    if (isEpochExpired) {
        currentEpoch += 1
        totalEpochData = await rateVaultContract.totalEpochData(currentEpoch)
    }

    const tvl = totalEpochData['totalCallsDeposits'].add(totalEpochData['totalPutsDeposits']).add(totalEpochData['epochCallsPremium']).add(totalEpochData['epochPutsPremium'])

    return tvl
}

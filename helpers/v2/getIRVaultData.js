import {RateVault__factory} from '@dopex-io/sdk'
import {BigNumber} from "ethers";

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

    let rate, currentEpoch, totalEpochData, totalEpochDeposits, tvl;

    try {
        currentEpoch = await rateVaultContract.currentEpoch()
        totalEpochData = await rateVaultContract.totalEpochData(currentEpoch)
        totalEpochDeposits = totalEpochData['totalCallsDeposits'].add(totalEpochData['totalPutsDeposits'])
        tvl = totalEpochData['totalCallsDeposits'].add(totalEpochData['totalPutsDeposits']).add(totalEpochData['epochCallsPremium']).add(totalEpochData['epochPutsPremium'])
    } catch(err) {
        tvl = BigNumber.from('0')
        totalEpochDeposits = BigNumber.from('0')
    }

    try {
        rate = await rateVaultContract.getCurrentRate()
    } catch(err) {
        rate = BigNumber.from('0')
    }

    return {
        currentEpoch: currentEpoch.toString(),
        totalEpochDeposits: totalEpochDeposits,
        rate: rate,
        tvl: tvl
    }
}

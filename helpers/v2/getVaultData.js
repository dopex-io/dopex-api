import {Addresses, RateVault__factory} from '@dopex-io/sdk'
import { utils as ethersUtils } from 'ethers'

import getProvider from '../getProvider'

export default async (vault) => {
    const {
        symbol,
        chainId
    } = vault
    const contractAddresses = Addresses[chainId]['RATE-VAULTS']
    const provider = getProvider(chainId)

    const rateVaultContract = RateVault__factory.connect(
        contractAddresses[symbol],
        provider
    )

    let currentEpoch = await rateVaultContract.currentEpoch()

    let totalEpochData = await rateVaultContract.totalEpochData(currentEpoch)

    return {
        currentEpoch: currentEpoch.toString(),
        totalEpochDeposits: totalEpochData['totalCallsDeposits'].add(totalEpochData['totalPutsDeposits']),
        underlyingPrice: ethersUtils.formatUnits(1, 18),
    }
}

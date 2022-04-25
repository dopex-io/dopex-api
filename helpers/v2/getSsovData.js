import { Addresses, ERC20SSOV__factory, SsovV3__factory } from '@dopex-io/sdk'
import { utils as ethersUtils } from 'ethers'

import getProvider from '../getProvider'

export default async (ssov) => {
    const { underlyingTokenSymbol, symbol, type, chainId, version } = ssov
    const contractAddresses = Addresses[chainId]
    const provider = getProvider(chainId)

    if (version === 2) {
        const ssovAddress =
            type === 'put'
                ? contractAddresses['2CRV-SSOV-P'][underlyingTokenSymbol].Vault
                : contractAddresses.SSOV[underlyingTokenSymbol].Vault

        const ssovContract = ERC20SSOV__factory.connect(ssovAddress, provider)

        let epoch = await ssovContract.currentEpoch()
        const isEpochExpired = await ssovContract.isEpochExpired(epoch)
        const epochTimes = await ssovContract.getEpochTimes(epoch)
        const underlyingPrice = await ssovContract.getUsdPrice()

        if (epoch.isZero()) {
            epoch = 1
        } else if (isEpochExpired) {
            epoch = epoch.add(1)
        }

        const totalEpochDeposits = await ssovContract.totalEpochDeposits(epoch)

        return {
            currentEpoch: Number(epoch.toString()),
            totalEpochDeposits: totalEpochDeposits.toString(),
            epochStartDate: epochTimes[0].toString(),
            epochEndDate: epochTimes[1].toString(),
            underlyingPrice: underlyingPrice.toNumber() / 10 ** 8,
        }
    } else {
        const ssovAddress = Addresses[chainId]['SSOV-V3'].VAULTS[symbol]

        const ssovContract = SsovV3__factory.connect(ssovAddress, provider)

        let epoch = await ssovContract.currentEpoch()

        if (epoch.isZero()) {
            epoch = 1
        }

        const [epochData, underlyingPrice, epochTimes] = await Promise.all([
            ssovContract.getEpochData(epoch),
            ssovContract.getUnderlyingPrice(),
            ssovContract.getEpochTimes(epoch),
        ])

        return {
            currentEpoch: Number(epoch.toString()),
            totalEpochDeposits: epochData['totalCollateralBalance'],
            epochStartDate: epochTimes[0].toString(),
            epochEndDate: epochTimes[1].toString(),
            underlyingPrice: ethersUtils.formatUnits(underlyingPrice, 8),
        }
    }
}

import { Addresses, ERC20SSOV__factory, SsovV3__factory } from '@dopex-io/sdk'
import { utils as ethersUtils } from 'ethers'

import getProvider from '../getProvider'

export default async (ssov) => {
    const {
        underlyingSymbol,
        symbol,
        type,
        chainId,
        version,
        collateralDecimals,
    } = ssov
    const contractAddresses = Addresses[chainId]
    const provider = getProvider(chainId)

    if (version === 2) {
        const ssovAddress =
            type === 'put'
                ? contractAddresses['2CRV-SSOV-P'][underlyingSymbol].Vault
                : contractAddresses.SSOV[underlyingSymbol].Vault

        const ssovContract = ERC20SSOV__factory.connect(ssovAddress, provider)

        let epoch = await ssovContract.currentEpoch()
        const isEpochExpired = await ssovContract.isEpochExpired(epoch)

        if (epoch.isZero()) {
            epoch = 1
        } else if (isEpochExpired) {
            epoch = epoch.add(1)
        }

        const [totalEpochDeposits, underlyingPrice, epochTimes] =
            await Promise.all([
                ssovContract.totalEpochDeposits(epoch),
                ssovContract.getUsdPrice(),
                ssovContract.getEpochTimes(),
            ])

        return {
            currentEpoch: epoch.toString(),
            totalEpochDeposits: ethersUtils.formatUnits(
                totalEpochDeposits,
                collateralDecimals
            ),
            underlyingPrice: ethersUtils.formatUnits(underlyingPrice, 8),
            epochTimes: {
                startTime: epochTimes.start,
                expiry: epochTimes.end,
            },
        }
    } else {
        const ssovAddress = Addresses[chainId]['SSOV-V3'].VAULTS[symbol]

        const ssovContract = SsovV3__factory.connect(ssovAddress, provider)

        let epoch = await ssovContract.currentEpoch()

        if (epoch.isZero()) {
            return {
                currentEpoch: epoch.toString(),
                totalEpochDeposits: '0',
                underlyingPrice: '0',
            }
        }

        const [epochData, underlyingPrice] = await Promise.all([
            ssovContract.getEpochData(epoch),
            ssovContract.getUnderlyingPrice(),
        ])

        return {
            currentEpoch: epoch.toString(),
            totalEpochDeposits: ethersUtils.formatUnits(
                epochData['totalCollateralBalance'],
                collateralDecimals
            ),
            underlyingPrice: ethersUtils.formatUnits(underlyingPrice, 8),
            epochTimes: {
                startTime: epochData['startTime'],
                expiry: epochData['expiry'],
            },
        }
    }
}

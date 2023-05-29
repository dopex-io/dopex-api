import {
    Addresses,
    ERC20SSOV__factory,
    SsovV3__factory,
    SsovV3Viewer__factory,
} from '@dopex-io/sdk'
import { BigNumber, utils as ethersUtils } from 'ethers'

import getProvider from '../getProvider'

export default async (ssov) => {
    if (ssov.retired)
        return {
            currentEpoch: 0,
            totalEpochDeposits: '0',
            totalEpochPurchases: '0',
            underlyingPrice: '0',
            epochTimes: {
                startTime: '0',
                expiry: '0',
            },
        }

    const { underlyingSymbol, type, chainId, version, collateralDecimals } =
        ssov
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
                ssovContract.getEpochTimes(epoch),
            ])

        return {
            currentEpoch: epoch.toString(),
            totalEpochDeposits: ethersUtils.formatUnits(
                totalEpochDeposits,
                collateralDecimals
            ),
            underlyingPrice: ethersUtils.formatUnits(underlyingPrice, 8),
            epochTimes: {
                startTime: epochTimes.start.toString(),
                expiry: epochTimes.end.toString(),
            },
        }
    } else {
        const ssovAddress = ssov.address
        const viewerAddress = contractAddresses['SSOV-V3'].VIEWER

        const ssovContract = SsovV3__factory.connect(ssovAddress, provider)
        const ssovViewerContract = SsovV3Viewer__factory.connect(
            viewerAddress,
            provider
        )

        let epoch = await ssovContract.currentEpoch()

        if (epoch.isZero()) {
            return {
                currentEpoch: epoch.toString(),
                totalEpochDeposits: '0',
                underlyingPrice: '0',
            }
        }

        const [epochData, underlyingPrice, totalEpochOptionsPurchased] =
            await Promise.all([
                ssovContract.getEpochData(epoch),
                ssovContract.getUnderlyingPrice(),
                ssovViewerContract.getTotalEpochOptionsPurchased(
                    epoch,
                    ssovContract.address
                ),
            ])

        const totalEpochPurchases = totalEpochOptionsPurchased.reduce(
            (accumulator, val) => {
                return accumulator.add(val)
            },
            BigNumber.from(0)
        )

        return {
            currentEpoch: epoch.toString(),
            totalEpochDeposits: ethersUtils.formatUnits(
                epochData['totalCollateralBalance'],
                collateralDecimals
            ),
            totalEpochPurchases: ethersUtils.formatUnits(
                totalEpochPurchases,
                18
            ),
            underlyingPrice: ethersUtils.formatUnits(underlyingPrice, 8),
            epochTimes: {
                startTime: epochData['startTime'].toString(),
                expiry: epochData['expiry'].toString(),
            },
        }
    }
}

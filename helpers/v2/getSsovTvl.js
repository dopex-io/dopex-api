import {
    Addresses,
    ERC20SSOV__factory,
    Curve2PoolSsovPut__factory,
    SsovV3__factory,
} from '@dopex-io/sdk'
import { ethers } from 'ethers'
import BN from 'bignumber.js'

import getProvider from '../getProvider'

export default async (ssov) => {
    if (ssov.retired) return '0'

    const {
        underlyingSymbol,
        symbol,
        type,
        chainId,
        version,
        collateralDecimals,
    } = ssov
    const contractAddresses = Addresses[chainId]

    const provider = getProvider(Number(chainId))

    let tvl

    if (version === 2) {
        if (type === 'put') {
            const ssovAddress =
                contractAddresses['2CRV-SSOV-P'][underlyingSymbol].Vault

            const ssovContract = Curve2PoolSsovPut__factory.connect(
                ssovAddress,
                provider
            )

            let epoch = await ssovContract.currentEpoch()
            let isEpochExpired = await ssovContract.isEpochExpired(epoch)

            if (epoch.isZero()) {
                epoch = 1
            } else if (isEpochExpired) {
                epoch = epoch.add(1)
            }

            const [deposits, namePrice] = await Promise.all([
                ssovContract.totalEpochDeposits(epoch),
                ssovContract.getLpPrice(),
            ])

            tvl = deposits

            const allStrikesPremiums = await ssovContract.totalEpochPremium(
                epoch
            )

            tvl = tvl.add(allStrikesPremiums)

            tvl = new BN(tvl.toString())
                .multipliedBy(namePrice.toString())
                .dividedBy(1e36)
        } else if (type === 'call') {
            const ssovAddress = contractAddresses.SSOV[underlyingSymbol].Vault

            const ssovContract = ERC20SSOV__factory.connect(
                ssovAddress,
                provider
            )

            let epoch = await ssovContract.currentEpoch()
            let isEpochExpired = await ssovContract.isEpochExpired(epoch)

            if (epoch.isZero()) {
                epoch = 1
            } else if (isEpochExpired) {
                epoch = epoch.add(1)
            }

            const [deposits, namePrice] = await Promise.all([
                ssovContract.totalEpochDeposits(epoch),
                ssovContract.getUsdPrice(),
            ])

            tvl = deposits

            const allStrikesPremiums = await ssovContract.getTotalEpochPremium(
                epoch
            )
            allStrikesPremiums.map((premium) => (tvl = tvl.add(premium)))

            if (underlyingSymbol === 'BNB') {
                const converter = new ethers.Contract(
                    ssovContract.address,
                    [
                        'function vbnbToBnb(uint256 vbnbAmount) public view returns (uint256)',
                    ],
                    provider
                )

                tvl = await converter.vbnbToBnb(tvl.toString())
            }

            tvl = new BN(tvl.toString())
                .multipliedBy(namePrice.toString())
                .dividedBy(1e26)
                .toString()
        }
    } else {
        const ssovContract = SsovV3__factory.connect(
            Addresses[chainId]['SSOV-V3'].VAULTS[symbol],
            provider
        )

        const epoch = await ssovContract.currentEpoch()

        if (epoch.isZero()) {
            return '0'
        }

        const underlyingPrice = await ssovContract.getUnderlyingPrice()

        const totalEpochDeposits = (await ssovContract.getEpochData(epoch))[
            'totalCollateralBalance'
        ]

        const totalEpochDepositsInUSD = symbol.includes('CALL')
            ? ethers.utils.formatUnits(
                  totalEpochDeposits.mul(underlyingPrice),
                  collateralDecimals + 8
              )
            : ethers.utils.formatUnits(totalEpochDeposits, 18)

        return totalEpochDepositsInUSD
    }

    return tvl
}

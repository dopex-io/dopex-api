import { AtlanticPutsPool__factory } from '@dopex-io/sdk'
import { BigNumber } from 'ethers'
import { utils as ethersUtils } from 'ethers/lib/ethers'

import getProvider from '../getProvider'

export default async (pool) => {
    const { chainId, vaultAddress, duration, underlying } = pool
    const provider = getProvider(chainId)

    const atlanticPoolContract = AtlanticPutsPool__factory.connect(
        vaultAddress,
        provider
    )

    let currentEpoch, tvl, apy, volume

    try {
        currentEpoch = await atlanticPoolContract.currentEpoch()

        const maxStrikes = await atlanticPoolContract.getEpochStrikes(
            currentEpoch
        )

        let data

        const [totalEpochActiveCollateral, totalEpochCumulativeLiquidity] =
            await Promise.all([
                atlanticPoolContract.totalEpochActiveCollateral(currentEpoch),
                atlanticPoolContract.totalEpochCummulativeLiquidity(
                    currentEpoch
                ),
            ])

        tvl = totalEpochActiveCollateral.add(totalEpochCumulativeLiquidity)
        volume = totalEpochActiveCollateral
        apy = 0

        let epochStrikeData = []

        let accumulator = {
            totalEpochLiquidity: BigNumber.from(0),
            totalEpochUnlockedCollateral: BigNumber.from(0),
            totalEpochActiveCollateral: BigNumber.from(0),
        }

        for (let i = 0; i < maxStrikes.length; i++) {
            let [
                totalEpochMaxStrikeLiquidity,
                totalEpochMaxStrikeUnlockedCollateral,
                totalEpochMaxStrikeActiveCollateral,
            ] = await Promise.all([
                atlanticPoolContract.totalEpochMaxStrikeLiquidity(
                    currentEpoch,
                    maxStrikes[i]
                ),
                atlanticPoolContract.totalEpochMaxStrikeUnlockedCollateral(
                    currentEpoch,
                    maxStrikes[i]
                ),
                atlanticPoolContract.totalEpochMaxStrikeActiveCollateral(
                    currentEpoch,
                    maxStrikes[i]
                ),
            ])

            accumulator.totalEpochLiquidity =
                accumulator.totalEpochLiquidity.add(
                    totalEpochMaxStrikeLiquidity
                )
            accumulator.totalEpochUnlockedCollateral =
                accumulator.totalEpochUnlockedCollateral.add(
                    totalEpochMaxStrikeUnlockedCollateral
                )
            accumulator.totalEpochActiveCollateral =
                accumulator.totalEpochActiveCollateral.add(
                    totalEpochMaxStrikeActiveCollateral
                )

            epochStrikeData.push({
                strike: ethersUtils.formatUnits(maxStrikes[i], 8),
                totalLiquidity: ethersUtils.formatUnits(
                    totalEpochMaxStrikeLiquidity,
                    8
                ),
                unlocked: ethersUtils.formatUnits(
                    totalEpochMaxStrikeUnlockedCollateral,
                    8
                ),
                active: ethersUtils.formatUnits(
                    totalEpochMaxStrikeActiveCollateral,
                    8
                ),
            })
        }

        data = {
            totalEpochLiquidity: ethersUtils.formatUnits(
                accumulator.totalEpochLiquidity,
                6
            ),
            totalEpochUnlockedCollateral: ethersUtils.formatUnits(
                accumulator.totalEpochUnlockedCollateral,
                6
            ),
            totalEpochActiveCollateral: ethersUtils.formatUnits(
                accumulator.totalEpochActiveCollateral,
                6
            ),
        }

        return {
            currentEpoch: currentEpoch.toString(),
            strikes: maxStrikes.map((strike) =>
                ethersUtils.formatUnits(strike, 8)
            ),
            epochData: data,
            tvl: ethersUtils.formatUnits(tvl, 6),
            volume: ethersUtils.formatUnits(volume, 6),
            apy, // hardcoded to 0
            duration,
            underlying: underlying,
        }
    } catch (e) {
        console.log('Failed To Fetch AP Data with error ', e)
        return {
            currentEpoch: '0',
            strikes: [],
            epochData: {},
            tvl: '',
            volume: '',
            apy: '',
            duration: '',
            underlying: '',
        }
    }
}

// TODO: APY Calculation

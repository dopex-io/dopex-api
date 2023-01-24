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

    let currentEpoch

    try {
        currentEpoch = await atlanticPoolContract.currentEpoch()

        const maxStrikes = await atlanticPoolContract.getEpochStrikes(
            currentEpoch
        )

        const epochData = await atlanticPoolContract.getEpochData(currentEpoch)

        const fundingRate = (
            (await atlanticPoolContract.vaultConfig(3)) ?? BigNumber.from(0)
        ).mul(1000)

        const { totalActiveCollateral, totalLiquidity, startTime, expiryTime } =
            epochData

        const latestCheckpointsCalls = maxStrikes.map(async (maxStrike) => {
            return atlanticPoolContract.getEpochCheckpoints(
                currentEpoch,
                maxStrike
            )
        })

        const checkpoints = await Promise.all(latestCheckpointsCalls)

        let maxStrikeData = []

        for (const i in maxStrikes) {
            const strike = maxStrikes[i]

            if (!strike) return

            const maxStrikeCheckpoints = checkpoints[i]

            let maxStrikeCheckpointAccumulator = {
                activeCollateral: BigNumber.from(0),
                unlockedCollateral: BigNumber.from(0),
                totalLiquidity: BigNumber.from(0),
                premiumAccrued: BigNumber.from(0),
                borrowFeesAccrued: BigNumber.from(0),
                liquidityBalance: BigNumber.from(0),
            }

            if (!maxStrikeCheckpoints) return

            for (const j in maxStrikeCheckpoints) {
                const checkpoint = maxStrikeCheckpoints[j]
                if (!checkpoint) return

                const {
                    activeCollateral,
                    unlockedCollateral,
                    totalLiquidity,
                    premiumAccrued,
                    borrowFeesAccrued,
                    liquidityBalance,
                } = checkpoint

                maxStrikeCheckpointAccumulator.activeCollateral =
                    maxStrikeCheckpointAccumulator.activeCollateral.add(
                        activeCollateral
                    )
                maxStrikeCheckpointAccumulator.unlockedCollateral =
                    maxStrikeCheckpointAccumulator.unlockedCollateral.add(
                        unlockedCollateral
                    )
                maxStrikeCheckpointAccumulator.totalLiquidity =
                    maxStrikeCheckpointAccumulator.totalLiquidity.add(
                        totalLiquidity
                    )
                maxStrikeCheckpointAccumulator.premiumAccrued =
                    maxStrikeCheckpointAccumulator.premiumAccrued.add(
                        premiumAccrued
                    )
                maxStrikeCheckpointAccumulator.borrowFeesAccrued =
                    maxStrikeCheckpointAccumulator.borrowFeesAccrued.add(
                        borrowFeesAccrued
                    )
                maxStrikeCheckpointAccumulator.liquidityBalance =
                    maxStrikeCheckpointAccumulator.liquidityBalance.add(
                        liquidityBalance
                    )
            }

            maxStrikeData.push({
                strike: ethersUtils.formatUnits(strike, 8),
                activeCollateral: ethersUtils.formatUnits(
                    maxStrikeCheckpointAccumulator.activeCollateral,
                    6
                ),
                unlockedCollateral: ethersUtils.formatUnits(
                    maxStrikeCheckpointAccumulator.unlockedCollateral,
                    6
                ),
                totalLiquidity: ethersUtils.formatUnits(
                    maxStrikeCheckpointAccumulator.totalLiquidity,
                    6
                ),
                premiumAccrued: ethersUtils.formatUnits(
                    maxStrikeCheckpointAccumulator.premiumAccrued,
                    6
                ),
                borrowFeesAccrued: ethersUtils.formatUnits(
                    maxStrikeCheckpointAccumulator.borrowFeesAccrued,
                    6
                ),
                liquidityBalance: ethersUtils.formatUnits(
                    maxStrikeCheckpointAccumulator.liquidityBalance,
                    6
                ),
            })
        }

        const epochLength = expiryTime.sub(startTime)

        const epochDurationInDays = Number(epochLength) / 86400

        const cumulativeEpochData = maxStrikeData.reduce(
            (prev, curr) => {
                return {
                    premiumAccrued:
                        Number(prev.premiumAccrued) +
                        Number(curr.premiumAccrued),
                    fundingAccrued:
                        Number(prev.fundingAccrued) +
                        Number(curr.borrowFeesAccrued),
                    liquidityBalance:
                        Number(prev.liquidityBalance) +
                        Number(curr.liquidityBalance),
                }
            },
            {
                premiumAccrued: 0,
                fundingAccrued: 0,
                liquidityBalance: 0,
            }
        )

        const apr =
            (((cumulativeEpochData.premiumAccrued +
                cumulativeEpochData.fundingAccrued) /
                Number(totalLiquidity.div(1e6))) *
                (365 * 100)) /
            epochDurationInDays

        return {
            currentEpoch: currentEpoch.toString(),
            strikes: maxStrikes.map((strike) =>
                ethersUtils.formatUnits(strike, 8)
            ),
            epochStrikeData: maxStrikeData,
            tvl: ethersUtils.formatUnits(totalLiquidity, 6),
            volume: ethersUtils.formatUnits(totalActiveCollateral, 6),
            active: ethersUtils.formatUnits(BigNumber.from(0), 6),
            fundingRate: ethersUtils.formatUnits(fundingRate, 6),
            apy: apr,
            duration,
            underlying,
        }
    } catch (e) {
        console.log('Failed To Fetch AP Data with error ', e)
        return {
            currentEpoch: '0',
            strikes: [],
            epochStrikeData: {},
            tvl: '',
            volume: '',
            active: '',
            fundingRate: '',
            apy: '',
            duration: '',
            underlying: '',
        }
    }
}

// TODO: APY Calculation

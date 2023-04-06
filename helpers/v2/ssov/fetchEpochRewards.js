import { ethers } from 'ethers'
import { BigNumber } from 'ethers'

async function fetchEpochRewards(ssovContract, epoch, provider, version = 1) {
    const stakingStrategyAddress = (await ssovContract.addresses())[
        'stakingStrategy'
    ]

    let abis
    if (version === 3) {
        abis = [
            'function rewardAmountsPerEpoch(uint256,uint256) view returns (uint256)',
            'function getRewardTokens() view returns (address[])',
        ]
    } else if (version === 2) {
        abis = [
            'function rewardsPerEpoch(uint256,uint256) view returns (uint256)',
            'function getRewardTokens() view returns (address[])',
        ]
    } else {
        abis = [
            'function rewardsPerEpoch(uint256) view returns (uint256)',
            'function getRewardTokens() view returns (address[])',
        ]
    }

    const stakingContract = new ethers.Contract(
        stakingStrategyAddress,
        abis,
        provider
    )

    const rewardTokens = await stakingContract.getRewardTokens()

    let rewards = []
    if (version === 2) {
        const rewardsPromises = []
        rewardTokens.map(async (_, idx) => {
            rewardsPromises.push(
                stakingContract.rewardsPerEpoch(epoch, BigNumber.from(idx))
            )
        })
        rewards = await Promise.all(rewardsPromises)
    } else if (version === 3) {
        const rewardsPromises = []
        rewardTokens.map(async (_, idx) => {
            rewardsPromises.push(
                stakingContract.rewardAmountsPerEpoch(
                    epoch,
                    BigNumber.from(idx)
                )
            )
        })
        rewards = await Promise.all(rewardsPromises)
    } else {
        rewards = [await stakingContract.rewardsPerEpoch(epoch)]
    }

    return { rewards: rewards, rewardTokens: rewardTokens }
}

export default fetchEpochRewards

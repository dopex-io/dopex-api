import { BigNumber } from 'ethers'

const DECIMALS_USD = BigNumber.from(10).pow(6)
const DECIMALS_TOKEN = BigNumber.from(10).pow(18)
const DECIMALS_STRIKE = BigNumber.from(10).pow(8)
const NULL = '0x0000000000000000000000000000000000000000'

export async function getSsovLpUtilization(olpContract, ssov, currentEpoch) {
    let tvl = BigNumber.from(0)
    let utilization = BigNumber.from(0)

    if (ssov === NULL) {
        return { tvl: tvl, utilization: utilization }
    }

    try {
        const strikeTokens = await olpContract.getSsovOptionTokens(
            ssov,
            currentEpoch
        )

        let strikeTokensInfoPromise = []
        let lpPositionsPromise = []

        strikeTokens.map((token) => {
            strikeTokensInfoPromise.push(olpContract.getOptionTokenInfo(token))
            lpPositionsPromise.push(olpContract.getAllLpPositions(token))
        })

        const strikeTokenLpPositions = await Promise.all(lpPositionsPromise)
        const strikeTokensInfo = await Promise.all(strikeTokensInfoPromise)
        const currentPrice = await olpContract?.getSsovUnderlyingPrice(ssov)

        strikeTokenLpPositions
            .flat()
            .filter(({ killed }) => !killed)
            .map((p) => {
                utilization = utilization.add(p.usdLiquidityUsed)
                utilization = utilization.add(
                    p.underlyingLiquidityUsed
                        .mul(currentPrice)
                        .mul(DECIMALS_USD)
                        .div(DECIMALS_STRIKE)
                        .div(DECIMALS_TOKEN)
                )
            })

        strikeTokensInfo.map((info) => {
            const usdLiq = info.usdLiquidity
            const underLiqToUsd = info.underlyingLiquidity
                .mul(currentPrice)
                .mul(DECIMALS_USD)
                .div(DECIMALS_STRIKE)
                .div(DECIMALS_TOKEN)
            tvl = tvl.add(usdLiq)
            tvl = tvl.add(underLiqToUsd)
        })
    } catch (err) {
        console.log(err)
    }

    return { tvl: tvl, utilization: utilization }
}

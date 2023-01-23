import { SsovV3__factory } from '@dopex-io/sdk'
// import { SsovV4Put__factory } from '../../mocks/factories'
import { BigNumber } from 'ethers'
import getProvider from '../getProvider'

const DECIMALS_TOKEN = BigNumber.from(10).pow(18)
const DECIMALS_STRIKE = BigNumber.from(10).pow(8)

function getApr(optionPrice, strike) {
    // multiply by 100 in case we have decimals
    const s = strike.mul(100).div(DECIMALS_STRIKE).toNumber() / 100
    return (
        Math.round((optionPrice.toNumber() / s) * (365 / 10) * 100 * 100) / 100
    )
}

export default async (vault) => {
    const { underlyingSymbol, symbol, address, chainId } = vault

    const provider = getProvider(chainId)
    const ssovContract = SsovV3__factory.connect(address, provider)

    try {
        const tokenPrice = await ssovContract.getUnderlyingPrice()
        const epoch = await ssovContract.currentEpoch()
        const epochData = await ssovContract.getEpochData(epoch)
        const epochTimes = await ssovContract.getEpochTimes(epoch)
        const collateralPrice = await ssovContract.getCollateralPrice()
        const strikes = epochData.strikes

        let aprs = []
        let optionTokens = []
        let totalSupply = BigNumber.from(0)
        let totalBorrow = BigNumber.from(0)

        await Promise.all(
            epochData.strikes.map(async (strike) => {
                const premium = await ssovContract.calculatePremium(
                    strike,
                    DECIMALS_TOKEN,
                    epochTimes.end
                )
                const optionPrice = premium
                    .mul(collateralPrice)
                    .div(DECIMALS_TOKEN)
                    .div(DECIMALS_STRIKE)
                aprs.push(getApr(optionPrice, strike))
                const epochStrikeData = await ssovContract.getEpochStrikeData(
                    epoch,
                    strike
                )
                // totalBorrow = totalBorrow.add(epochStrikeData.borrowedCollateral)
                totalSupply = totalSupply.add(epochStrikeData.totalCollateral)
                optionTokens.push(epochStrikeData.strikeToken)
            })
        )

        return {
            underlyingSymbol: underlyingSymbol,
            symbol: symbol,
            chainId: chainId,
            address: address,
            totalSupply: totalSupply.div(DECIMALS_TOKEN).toNumber(),
            totalBorrow: totalBorrow.div(DECIMALS_TOKEN).toNumber(),
            tokenPrice:
                tokenPrice.div(BigNumber.from(10).pow(6)).toNumber() / 100,
            aprs: aprs,
            strikes: strikes.map(
                (s) =>
                    s.mul(BigNumber.from(100)).div(DECIMALS_STRIKE).toNumber() /
                    100
            ),
            optionTokens: optionTokens,
        }
    } catch {
        return {
            underlyingSymbol: underlyingSymbol,
            symbol: symbol,
            chainId: chainId,
            address: address,
            totalSupply: 0,
            totalBorrow: 0,
            tokenPrice: 0,
            aprs: [0, 0, 0, 0],
            strikes: [0, 0, 0, 0],
            optionTokens: 0,
        }
    }
}

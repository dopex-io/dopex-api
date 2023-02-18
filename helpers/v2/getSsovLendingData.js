import { SsovV3LendingPut__factory } from '../../mocks/factories/SsovV3LendingPut__factory'
import { BigNumber } from 'ethers'
import getProvider from '../getProvider'
import { DECIMALS_TOKEN, DECIMALS_STRIKE, DECIMALS_USD } from '../constants'

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
    const ssovContract = SsovV3LendingPut__factory.connect(address, provider)

    try {
        const [tokenPrice, epoch, collateralPrice] = await Promise.all([
            ssovContract.getUnderlyingPrice(),
            ssovContract.currentEpoch(),
            ssovContract.getCollateralPrice(),
        ])

        const [epochData, epochTimes] = await Promise.all([
            ssovContract.getEpochData(epoch),
            ssovContract.getEpochTimes(epoch),
        ])

        let aprs = []
        let optionTokens = []
        let depositsPerStrike = []
        let purchasesPerStrike = []
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
                totalBorrow = totalBorrow.add(
                    epochStrikeData.borrowedCollateral
                )
                totalSupply = totalSupply.add(epochStrikeData.totalCollateral)
                depositsPerStrike.push(
                    epochStrikeData.totalCollateral
                        .div(epochData.collateralExchangeRate)
                        .div(DECIMALS_STRIKE)
                        .div(100)
                        .toNumber()
                )
                purchasesPerStrike.push(
                    epochStrikeData.activeCollateral
                        .div(DECIMALS_TOKEN)
                        .toNumber()
                )
                optionTokens.push(epochStrikeData.strikeToken)
            })
        )

        return {
            underlyingSymbol: underlyingSymbol,
            collateralTokenAddress: epochData.collateralToken,
            symbol: symbol,
            chainId: chainId,
            address: address,
            totalSupply: totalSupply.div(DECIMALS_TOKEN).toNumber(),
            totalBorrow: totalBorrow.div(DECIMALS_TOKEN).toNumber(),
            tokenPrice: tokenPrice.div(DECIMALS_USD).toNumber() / 100,
            aprs: aprs,
            strikes: epochData.strikes.map(
                (s) =>
                    s.mul(BigNumber.from(100)).div(DECIMALS_STRIKE).toNumber() /
                    100
            ),
            expiry: epochTimes.end.toNumber(),
            epoch: epoch.toNumber(),
            optionTokens: optionTokens,
            depositsPerStrike: depositsPerStrike,
            purchasesPerStrike: purchasesPerStrike,
        }
    } catch (err) {
        console.log(err)
        return {
            underlyingSymbol: underlyingSymbol,
            symbol: symbol,
            chainId: chainId,
            address: address,
            totalSupply: 0,
            totalBorrow: 0,
            tokenPrice: 0,
            aprs: [],
            strikes: [],
            optionTokens: [],
            depositsPerStrike: [],
            purchasesPerStrike: [],
        }
    }
}

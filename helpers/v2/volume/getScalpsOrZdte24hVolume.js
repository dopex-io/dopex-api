import { BigNumber } from 'ethers'

import getAddressToSymbol from './getAddressToSymbol'

const getScalpsOrZdte24hVolume = async (scalpsPayload, tokenToPrice, data) => {
    const addressToSymbol = getAddressToSymbol(
        data.filter((item) => !item.retired)
    )

    const addressToAmount = {}

    if (scalpsPayload.trades)
        scalpsPayload.trades.forEach((trade) => {
            const { id, amount } = trade
            const address = id.split('#')[0].toLowerCase()
            if (!addressToAmount[address]) {
                addressToAmount[address] = 0
            }
            addressToAmount[address] =
                addressToAmount[address] +
                BigNumber.from(amount).div(BigNumber.from(10).pow(16)) / 100
        })

    let scalpsAmount = 0
    for (const address in addressToAmount) {
        const amount = addressToAmount[address]
        const underlyingPrice = tokenToPrice[addressToSymbol[address]]
        scalpsAmount = scalpsAmount + amount * underlyingPrice
    }

    return scalpsAmount
}

export default getScalpsOrZdte24hVolume

import { BigNumber } from 'ethers'
import { STRADDLES } from '../constants'

import getAddressToSymbol from './getAddressToSymbol'

const getStraddle24hVolume = async (straddlePayload, tokenToPrice) => {
    const addressToSymbol = getAddressToSymbol(
        STRADDLES.filter((straddle) => !straddle.retired)
    )

    const addressToAmount = {}

    if (straddlePayload.straddlePurchases)
        straddlePayload.straddlePurchases.forEach((trade) => {
            // userAddress + vaultAddress + straddle id
            const { id, amount } = trade
            const address = id.split('#')[1].toLowerCase()
            if (!addressToAmount[address]) {
                addressToAmount[address] = 0
            }
            addressToAmount[address] =
                addressToAmount[address] +
                BigNumber.from(amount).div(BigNumber.from(10).pow(16)) / 100
        })

    let straddleAmount = 0
    for (const address in addressToAmount) {
        const amount = addressToAmount[address]
        const underlyingPrice = tokenToPrice[addressToSymbol[address]]
        straddleAmount = straddleAmount + amount * underlyingPrice
    }

    return straddleAmount
}

export default getStraddle24hVolume

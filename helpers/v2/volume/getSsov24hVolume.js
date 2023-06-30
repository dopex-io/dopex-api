import { BigNumber } from 'ethers'
import { SSOVS } from '../constants'

import getAddressToSymbol from './getAddressToSymbol'

const getSsov24hVolume = async (ssovPayload, tokenToPrice) => {
    const addressToSymbol = getAddressToSymbol(
        SSOVS.filter((ssov) => !ssov.retired)
    )
    const addressToAmount = {}

    if (ssovPayload.ssovoptionPurchases)
        ssovPayload.ssovoptionPurchases.forEach((trade) => {
            // userAddress + strike + epoch + ssovAddress
            const { id, amount } = trade
            const address = id.split('#')[3].toLowerCase()
            if (!addressToAmount[address]) {
                addressToAmount[address] = 0
            }
            addressToAmount[address] =
                addressToAmount[address] +
                BigNumber.from(amount).div(BigNumber.from(10).pow(16)) / 100
        })

    let ssovAmount = 0
    for (const address in addressToAmount) {
        const amount = addressToAmount[address]
        const underlyingPrice = tokenToPrice[addressToSymbol[address]]
        ssovAmount = ssovAmount + amount * underlyingPrice
    }

    return ssovAmount
}

export default getSsov24hVolume

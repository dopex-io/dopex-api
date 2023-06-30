import { SSOVS } from './constants'
import getSsovData from './getSsovData'

async function getSsovTokenPrice() {
    const _SSOVS = SSOVS.filter((ssov) => !ssov.retired)

    const data = await Promise.all(_SSOVS.map((ssov) => getSsovData(ssov)))

    const ssovArray = _SSOVS.map((item, index) => {
        return {
            ...item,
            underlyingPrice: data[index].underlyingPrice,
        }
    })

    const tokenPrice = {}

    ssovArray.map((ssov) => {
        const { underlyingSymbol, underlyingPrice } = ssov
        tokenPrice[underlyingSymbol] = Number(underlyingPrice)
    })

    return tokenPrice
}

export default getSsovTokenPrice

import { SSOVS } from '../constants'
import getSsovData from '../getSsovData'

async function getSsovOpenInterest() {
    const _SSOVS = SSOVS.filter((ssov) => !ssov.retired)

    const data = await Promise.all(_SSOVS.map((ssov) => getSsovData(ssov)))

    const ssovArray = _SSOVS.map((item, index) => {
        return {
            ...item,
            underlyingPrice: data[index].underlyingPrice,
            totalEpochPurchases: data[index].totalEpochPurchases,
        }
    })

    return ssovArray
        .map((ssov) => {
            const { totalEpochPurchases, underlyingPrice } = ssov
            return totalEpochPurchases * underlyingPrice
        })
        .reduce((accumulator, currentValue) => accumulator + currentValue, 0)
}

export default getSsovOpenInterest

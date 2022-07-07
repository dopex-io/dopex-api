import axios from 'axios'

export default async (ids) => {
    const prices = await axios
        .get(
            `https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(
                ','
            )}&vs_currencies=usd`
        )
        .then((payload) => {
            return ids.map((id) => payload.data[id].usd)
        })

    return prices
}

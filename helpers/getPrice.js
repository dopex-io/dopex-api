import axios from 'axios'

export default async (id) => {
    const price = await axios
        .get(
            `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd,eth`
        )
        .then((payload) => {
            return payload.data[id]
        })

    return price
}

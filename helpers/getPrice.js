import axios from 'axios'

import redis from './redis'

export default async (id) => {
    let price = await redis.get(id)

    if (!price) {
        price = await axios
            .get(
                `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd,eth`
            )
            .then(async (payload) => {
                const _price = payload.data[id].usd

                await redis.set(id, _price, { ex: 60 })

                return payload.data[id].usd
            })
    }

    return price
}

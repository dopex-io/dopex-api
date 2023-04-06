import axios from 'axios'

import redis from './redis'

export default async (ids) => {
    const prices = {}

    const uncachedIds = []

    for (let i = 0; i < ids.length; i++) {
        const id = ids[i]

        const price = await redis.get(id)

        if (price) {
            prices[id] = price
        } else {
            uncachedIds.push(id)
        }
    }

    if (uncachedIds.length > 0) {
        await axios
            .get(
                `https://api.coingecko.com/api/v3/simple/price?ids=${uncachedIds.join(
                    ','
                )}&vs_currencies=usd`
            )
            .then(async (payload) => {
                for (let i = 0; i < uncachedIds.length; i++) {
                    const id = uncachedIds[i]

                    prices[id] = payload.data[id].usd

                    await redis.set(id, prices[id], { ex: 60 })
                }
            })
    }

    return ids.map((id) => prices[id])
}

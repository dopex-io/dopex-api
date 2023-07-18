import redis from './redis'

const cachedResponse = async (req, res, getter) => {
    try {
        let url = req.url

        if (url.substring(0, 4) === '/api') {
            url = url.substring(4)
        }

        const cachedData = await redis.get(url)

        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate')

        if (cachedData) {
            res.json(cachedData)
        } else {
            const data = await getter(req, res)

            await redis.set(url, data, { ex: 60 })

            res.json(data)
        }
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: 'Something went wrong.',
            details: err['reason'],
        })
    }
}

export default cachedResponse

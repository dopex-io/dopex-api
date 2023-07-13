import axios from 'axios'

import getTvl from '../../../../helpers/getFarmTvl'
import getPrice from '../../../../helpers/getPrice'

const isValidQuery = (query) => {
    const upperCasedQuery = query.pool.toUpperCase()
    if (
        upperCasedQuery !== 'DPX' &&
        upperCasedQuery !== 'DPX-WETH' &&
        upperCasedQuery !== 'RDPX-WETH' &&
        upperCasedQuery !== 'RDPX'
    ) {
        return false
    }
    return true
}

export default async (req, res) => {
    let tvl = 0
    if (req.query.pool) {
        if (isValidQuery(req.query)) {
            const ethPriceFinal = await getPrice('ethereum')
            tvl = (
                await getTvl(req.query.pool.toUpperCase(), ethPriceFinal)
            ).toString()
        } else {
            return res
                .status(400)
                .json({ error: 'Incorrect query. Pool doest not exist.' })
        }
    } else {
        const ethPriceFinal = await axios
            .get(
                'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
            )
            .then((payload) => {
                return payload.data.ethereum.usd
            })
        const [dpxTvl, dpxWethTvl, rdpxWethTvl, rdpxTvl] = await Promise.all([
            getTvl('DPX', ethPriceFinal),
            getTvl('DPX-WETH', ethPriceFinal),
            getTvl('RDPX-WETH', ethPriceFinal),
            getTvl('RDPX', ethPriceFinal),
        ])
        tvl = dpxTvl.plus(dpxWethTvl).plus(rdpxWethTvl).plus(rdpxTvl).toString()
    }
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate')
    res.json({ tvl })
}

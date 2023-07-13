import axios from 'axios'

import getFarmTvl from '../../../helpers/getFarmTvl'
import getFarmApy from '../../../helpers/v2/getFarmApy'
import getPrice from '../../../helpers/getPrice'

const isValidQuery = (query) => {
    const upperCasedQuery = query.pool.toUpperCase()
    if (upperCasedQuery !== 'DPX-WETH' && upperCasedQuery !== 'RDPX-WETH') {
        return false
    }
    return true
}

export default async (req, res) => {
    let tvl = 0
    let apy = 0
    if (req.query.pool) {
        if (isValidQuery(req.query)) {
            const ethPriceFinal = await getPrice('ethereum')
            tvl = (
                await getFarmTvl(req.query.pool.toUpperCase(), ethPriceFinal)
            ).toString()
            apy = (
                await getFarmApy(req.query.pool.toUpperCase(), ethPriceFinal)
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
        const [dpxWethTvl, rdpxWethTvl] = await Promise.all([
            getFarmTvl('DPX-WETH', ethPriceFinal),
            getFarmTvl('RDPX-WETH', ethPriceFinal),
        ])
        tvl = dpxWethTvl.plus(rdpxWethTvl).toString()
        apy = 0
    }
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate')
    res.json({ tvl, apy })
}

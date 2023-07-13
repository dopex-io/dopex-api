import getPrice from '../../../helpers/getPrice'
import getDpxCirculatingSupply from '../../../helpers/getDpxCirculatingSupply'

export default async (_req, res) => {
    const [dpxPrice, dpxCirculatingSupply] = await Promise.all([
        getPrice('dopex'),
        getDpxCirculatingSupply(),
    ])

    const marketCap = dpxPrice * dpxCirculatingSupply

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate')
    await res.json({ marketCap })
}

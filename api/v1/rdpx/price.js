import getPrice from '../../../helpers/getPrice'

export default async (_req, res) => {
    const rdpxPrice = await getPrice('dopex-rebate-token')

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate')
    res.json({ price: { usd: rdpxPrice } })
}

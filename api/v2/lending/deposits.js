import getSsovOwnerPositions from '../../../helpers/v2/getSsovOwnerPositions'

export default async (req, res) => {
    try {
        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate')
        const symbol = req.query.symbol
        const owner = req.query.owner

        if (!symbol || !owner) {
            return res
                .status(400)
                .json({ error: 'Invalid or missing query param required.' })
        }
        const deposits = await getSsovOwnerPositions(symbol, owner)
        return res.json({ deposits })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            error: 'Something went wrong.',
            details: err['reason'],
        })
    }
}

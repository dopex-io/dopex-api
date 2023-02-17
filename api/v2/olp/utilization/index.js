import getSsovLpUtilizations from '../../../../helpers/v2/getSsovLpUtilizations'

export default async (req, res) => {
    try {
        const utilizations = await getSsovLpUtilizations(req.query.symbol)
        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate')
        res.json({ utilizations })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: 'Something went wrong.',
            details: err['reason'],
        })
    }
}

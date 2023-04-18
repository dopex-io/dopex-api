import getZdteExpiry from '../../../../helpers/v2/getZdteExpiry'

export default async (_req, res) => {
    try {
        const data = await getZdteExpiry()
        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate')
        res.json({ ...data })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: 'Something went wrong.',
            details: err['reason'],
        })
    }
}

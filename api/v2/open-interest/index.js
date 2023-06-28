import getAllOpenInterest from '../../../helpers/v2/openInterest/getAllOpenInterest'

export default async (_req, res) => {
    try {
        const data = await getAllOpenInterest()
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

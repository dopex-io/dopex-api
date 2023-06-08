import getSantas from '../../../../helpers/v2/quest/getBridgoor'

export default async (req, res) => {
    try {
        const result = await getSantas(req.query.address)

        res.json({
            ...result,
        })
    } catch (err) {
        console.log(err)

        res.status(500).json({
            error: 'Something went wrong.',
            details: err['reason'],
        })
    }
}
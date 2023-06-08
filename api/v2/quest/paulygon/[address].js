import getPaulygonQuest from '../../../../helpers/v2/quest/getPaulygonQuest'

export default async (req, res) => {
    try {
        const result = await getPaulygonQuest(req.query.address)

        res.json({
            valid: result.valid,
            ...(result.error && { error: result.error }),
        })
    } catch (err) {
        console.log(err)

        res.status(500).json({
            error: 'Something went wrong.',
            details: err['reason'],
        })
    }
}

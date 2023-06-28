import getAll24hVolume from '../../../helpers/v2/volume/getAll24hVolume'

export default async (_req, res) => {
    try {
        const data = await getAll24hVolume()
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

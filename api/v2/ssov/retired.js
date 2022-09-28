import { SSOVS } from '../../../helpers/v2/constants'

export default async (req, res) => {
    try {
        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate')

        res.json(SSOVS.filter((ssov) => ssov.retired && ssov.chainId === 42161))
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: 'Something went wrong.',
            details: err['reason'],
        })
    }
}

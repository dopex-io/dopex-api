import tokens from '../../../helpers/v2/tokens'

export default async (_req, res) => {
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate')

    res.json({ supportedTokens: tokens })
}

import axios from 'axios'

const SUPPORTED_CHAIN_IDS = ['42161', '137']

const isValidQuery = (query) => {
    const { src, dst, amount, chainId, from } = query

    if (!src || !dst || !amount || !chainId || !from) return false

    if (!SUPPORTED_CHAIN_IDS.includes(chainId)) return false

    return true
}

export default async (req, res) => {
    try {
        if (!isValidQuery(req.query)) {
            return res.status(400).json({ error: 'Incorrect query.' })
        }

        const { src, dst, amount, chainId, from } = req.query

        const data = await axios.get(
            `https://api.1inch.dev/swap/v5.2/${chainId}/swap?src=${src}&dst=${dst}&amount=${amount}&from=${from}&slippage=1&disableEstimate=true&compatibility=true`,
            {
                headers: {
                    accept: 'application/json',
                    Authorization: `Bearer ${process.env.ONE_INCH_API_KEY}`,
                },
            }
        )

        res.json({ ...data.data })
    } catch (err) {
        console.log(err)
        res.status(500).json({
            error: 'Something went wrong.',
            details: err['reason'],
        })
    }
}

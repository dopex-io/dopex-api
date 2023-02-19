import getAllSsovLendingTvl from '../../../helpers/v2/getAllSsovLendingTvl'

export default async (req, res) => {
    try {
        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate')
        return res.json(
            await getAllSsovLendingTvl().then(
                ({ totalCollatTvl, totalBorrowingTvl }) => ({
                    totalCollatTvl,
                    totalBorrowingTvl,
                })
            )
        )
    } catch (err) {
        console.log('fail to getAllSsovLendingTvl', err)
        return res.status(500).json({
            error: 'Something went wrong.',
            details: err['reason'],
        })
    }
}

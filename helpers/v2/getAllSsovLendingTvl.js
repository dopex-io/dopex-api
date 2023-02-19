import { SsovV3LendingPut__factory } from '../../mocks/factories/SsovV3LendingPut__factory'
import { BigNumber } from 'ethers'
import getProvider from '../getProvider'
import { DECIMALS_TOKEN } from '../../helpers/constants'
import { SSOVS, SSOVS_LENDING } from './constants'

const ARB_GOERLI = 421613

const getAllSsovLendingTvl = async () => {
    let totalCollatTvl = BigNumber.from(0)
    let totalBorrowingTvl = BigNumber.from(0)

    try {
        await Promise.all(
            // SSOVS.filter(
            SSOVS_LENDING.filter(
                (ssov) => !ssov.retired && ssov.type == 'put'
            ).map(async (ssov) => {
                const { collatTvl, borrowingTvl } = await getSsovLendingTvl(
                    ssov.address
                )
                totalCollatTvl = totalCollatTvl.add(collatTvl)
                totalBorrowingTvl = totalBorrowingTvl.add(borrowingTvl)
            })
        )
    } catch (err) {
        console.log('fail to getSsovLendingTvl', err)
    }

    return {
        totalCollatTvl: totalCollatTvl.toNumber(),
        totalBorrowingTvl: totalBorrowingTvl.toNumber(),
    }
}

const getSsovLendingTvl = async (address) => {
    let collatTvl = BigNumber.from(0)
    let borrowingTvl = BigNumber.from(0)

    try {
        const provider = getProvider(ARB_GOERLI)
        const ssov = SsovV3LendingPut__factory.connect(address, provider)

        const epoch = await ssov.currentEpoch()
        const epochData = await ssov.getEpochData(epoch)
        collatTvl = epochData.totalCollateralBalance.div(
            BigNumber.from(DECIMALS_TOKEN)
        )
        borrowingTvl = epochData.totalBorrowedCollateral.div(
            BigNumber.from(DECIMALS_TOKEN)
        )
    } catch (err) {
        console.log('fail to get ssov data', err)
    }

    return {
        collatTvl: collatTvl.toNumber(),
        borrowingTvl: borrowingTvl.toNumber(),
    }
}

export default getAllSsovLendingTvl

import { SsovV3LendingPut__factory } from '../../mocks/factories/SsovV3LendingPut__factory'
import { SsovV3DatastoreClient__factory } from '../../mocks/factories/SsovV3DatastoreClient__factory'
// import { Addresses } from '@dopex-io/sdk'
import getProvider from '../getProvider'
import { DECIMALS_TOKEN, DECIMALS_STRIKE } from '../constants'

const ARB_GOERLI = 421613
const SSOV_PUT = '0x241D91Eb2574a34Da612e3EE2E8f2Ee44768de57'

const getSsovOwnerDebts = async (symbol, owner) => {
    try {
        const provider = getProvider(ARB_GOERLI)
        const address = SSOV_PUT
        // const address =
        //     Addresses[BLOCKCHAIN_TO_CHAIN_ID.ARB_GOERLI]['SSOV-V3'].VAULTS[symbol]
        const ssovContract = SsovV3LendingPut__factory.connect(
            address,
            provider
        )
        const datastoreClient = await ssovContract.datastoreClient()
        const datastoreContract = SsovV3DatastoreClient__factory.connect(
            datastoreClient,
            provider
        )
        const tokenIds = await datastoreContract.getOwnerDebtPositions(owner)
        let debts = []
        await Promise.all(
            tokenIds.map(async (id) => {
                const debt = await ssovContract.getDebtPosition(id)
                debts.push({
                    epoch: debt.epoch.toNumber(),
                    strike: debt.strike.div(DECIMALS_STRIKE).toNumber(),
                    supplied: debt.supplied.div(DECIMALS_TOKEN).toNumber(),
                    borrowed: debt.borrowed.div(DECIMALS_TOKEN).toNumber(),
                })
            })
        )
        return debts
    } catch (err) {
        console.log(err)
    }
}

export default getSsovOwnerDebts

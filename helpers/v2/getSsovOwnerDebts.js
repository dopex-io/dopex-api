import { SsovV3LendingPut__factory } from '../../mocks/factories/SsovV3LendingPut__factory'
import { SsovV3DatastoreClient__factory } from '../../mocks/factories/SsovV3DatastoreClient__factory'
// import { Addresses } from '@dopex-io/sdk'
import getProvider from '../getProvider'

const ARB_GOERLI = 421613
const SSOV_PUT = '0xE2791e98305824a0d22071C1e49A3E32F00EA8Ef'

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
                const expiry = await datastoreContract.getExpiry(debt.epoch)
                debts.push({
                    id: id.toNumber(),
                    expiry: expiry.toNumber(),
                    epoch: debt.epoch.toNumber(),
                    strike: debt.strike.toString(),
                    supplied: debt.supplied.toString(),
                    borrowed: debt.borrowed.toString(),
                })
            })
        )
        return debts
    } catch (err) {
        console.log(err)
    }
}

export default getSsovOwnerDebts

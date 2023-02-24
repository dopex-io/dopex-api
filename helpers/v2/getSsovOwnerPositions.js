import { SsovV3LendingPut__factory } from '../../mocks/factories/SsovV3LendingPut__factory'
import { SsovV3DatastoreClient__factory } from '../../mocks/factories/SsovV3DatastoreClient__factory'
// import { Addresses } from '@dopex-io/sdk'
import { SsovV3Viewer__factory } from '@dopex-io/sdk'
import getProvider from '../getProvider'
import { DECIMALS_STRIKE, DECIMALS_TOKEN, DECIMALS_USD } from '../constants'

const ARB_GOERLI = 421613
const SSOV_PUT = '0xE2791e98305824a0d22071C1e49A3E32F00EA8Ef'

const getSsovOwnerPositions = async (symbol, owner) => {
    try {
        const provider = getProvider(ARB_GOERLI)
        const address = SSOV_PUT
        // const address =
        //     Addresses[BLOCKCHAIN_TO_CHAIN_ID.ARB_GOERLI]['SSOV-V3'].VAULTS[symbol]
        const viewerAddress = '0xc4C5a1DEA6188F841380Bcb0e26899b2369C4bE2'
        const ssovViewer = SsovV3Viewer__factory.connect(
            viewerAddress,
            provider
        )
        const ssovContract = SsovV3LendingPut__factory.connect(
            address,
            provider
        )
        const datastoreClient = await ssovContract.datastoreClient()
        const datastoreContract = SsovV3DatastoreClient__factory.connect(
            datastoreClient,
            provider
        )
        const tokenIds = await ssovViewer.walletOfOwner(
            owner,
            ssovContract.address
        )
        let positions = []
        await Promise.all(
            tokenIds.map(async (id) => {
                const pos = await datastoreContract.getWritePosition(id)
                positions.push({
                    id: id.toNumber(),
                    epoch: pos.epoch.toNumber(),
                    strike: pos.strike.div(DECIMALS_USD).toNumber() / 100,
                    collateralAmount: pos.collateralAmount
                        .div(DECIMALS_TOKEN)
                        .toString(),
                })
            })
        )
        return positions
    } catch (err) {
        console.log(err)
    }
}

export default getSsovOwnerPositions

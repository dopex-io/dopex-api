import { Zdte__factory } from '../../mocks/factories/Zdte__factory'
import { providers } from '@0xsequence/multicall'
import { Wallet, ethers } from 'ethers'

function validPk(value) {
    try {
        new Wallet(value)
    } catch (e) {
        return false
    }
    return true
}

const KEEPER_PK = process.env['KEEPER_PK']
const INFURA_PROJECT_ID = process.env['INFURA_PROJECT_ID']
const CONTRACT = '0xC9658810C819211a4bA4755Fc9D45A8128079841'
const CHAIN_ID = 42161
const MAX_EXPIRE_BATCH = 30

export default async () => {
    const isKeeperValid = KEEPER_PK && validPk(KEEPER_PK)

    if (!isKeeperValid) {
        return {
            success: false,
            error: 'Keeper PK is not valid',
        }
    }

    const provider = new providers.MulticallProvider(
        new ethers.providers.StaticJsonRpcProvider(
            `https://arbitrum-mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
            CHAIN_ID
        )
    )

    const wallet = new ethers.Wallet(KEEPER_PK)
    const signer = wallet.connect(provider)
    const zdte = await Zdte__factory.connect(CONTRACT, provider)

    try {
        const tx = await zdte.connect(signer).keeperSaveSettlementPrice()
        const receipt = await tx.wait()
        console.log('Transaction on saving settlement price: ', receipt)
    } catch (err) {
        console.error('Error saving settlement price:', err.message)
        return {
            success: false,
            error: `Failed to save settlement price: ${err.message}`,
        }
    }

    try {
        const prevExpiry = await zdte.getPrevExpiry()
        const numPositions = await zdte.expiryInfo[prevExpiry].count
        console.log(
            `Number of spread positions=${numPositions} for expiry=${prevExpiry}`
        )

        const numRun = Math.round(numPositions.toNumber() / MAX_EXPIRE_BATCH)
        console.log('Number of batches to run:', numRun)

        for (let i = 0; i < numRun; i++) {
            const tx = await zdte.connect(signer).keeperExpirePrevEpochSpreads()
            const receipt = await tx.wait()
            console.log(`Expire prev epoch spreads batch ${i}:`, receipt)
        }
    } catch (err) {
        console.error('Error expiring prev epoch spreads:', err.message)
        return {
            success: false,
            error: `Failed to expire prev epoch spreads: ${err.message}`,
        }
    }

    return {
        success: true,
    }
}

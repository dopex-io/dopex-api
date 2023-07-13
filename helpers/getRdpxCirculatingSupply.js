import { ERC20__factory, Addresses } from '@dopex-io/sdk'
import { ethers, BigNumber } from 'ethers'

import { BLOCKCHAIN_TO_CHAIN_ID } from '../helpers/constants'
import getProvider from './getProvider'

const getRdpxCirculatingSupply = async () => {
    const ethProvider = getProvider(BLOCKCHAIN_TO_CHAIN_ID.ETHEREUM)
    const arbProvider = getProvider(BLOCKCHAIN_TO_CHAIN_ID.ARBITRUM)

    const totalSupply = ethers.utils.parseEther('2250000')

    /**
     * Circulating Supply = Total Supply - Treasury Balances - Non emitted tokens
     * Non emitted tokens are from the airdrop contract, ssovs, dopex deployer address
     */

    const rdpxEth = ERC20__factory.connect(
        Addresses[BLOCKCHAIN_TO_CHAIN_ID['ETHEREUM']].RDPX,
        ethProvider
    )

    const rdpxArb = ERC20__factory.connect(
        Addresses[BLOCKCHAIN_TO_CHAIN_ID['ARBITRUM']].RDPX,
        arbProvider
    )

    const arbAddresses = [
        // Arbitrum mainnet treasury
        '0x2fa6F21eCfE274f594F470c376f5BDd061E08a37',
        // SSOV Strategy contracts
        '0xb277Fc0AC7e86c4c5d4C542296C3519E6eb99A2A', // rDPX Call Weeklies
        '0xbBC4ccF4FC2c5260F072aE870EE99Df3ae5515cd', // rDPX Call Monthlies
        // Deployer Address
        '0xDe485812E28824e542B9c2270B6b8eD9232B7D0b',
    ]

    const rdpxMerkleDistributorBalance = await rdpxEth.balanceOf(
        '0x20E3D49241A9658C36Df595437160a6F6Dc01bDe'
    )

    const arbRdpxBalances = await Promise.all(
        arbAddresses.map((addr) => {
            return rdpxArb.balanceOf(addr)
        })
    )

    const totalArbRdpxBalance = arbRdpxBalances.reduce((acc, balance) => {
        return acc.add(balance)
    }, BigNumber.from(0))

    const cs = totalSupply
        .sub(rdpxMerkleDistributorBalance)
        .sub(totalArbRdpxBalance)

    return Number(ethers.utils.formatEther(cs))
}

export default getRdpxCirculatingSupply

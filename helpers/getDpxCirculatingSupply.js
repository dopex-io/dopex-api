import { ERC20__factory, Addresses } from '@dopex-io/sdk'
import { ethers, BigNumber } from 'ethers'

import { BLOCKCHAIN_TO_CHAIN_ID } from '../helpers/constants'
import getProvider from './getProvider'

const getDpxCirculatingSupply = async () => {
    const arbProvider = getProvider(BLOCKCHAIN_TO_CHAIN_ID.ARBITRUM)
    const ethProvider = getProvider(BLOCKCHAIN_TO_CHAIN_ID.ETHEREUM)

    const dpxEth = ERC20__factory.connect(
        Addresses[BLOCKCHAIN_TO_CHAIN_ID['ETHEREUM']].DPX,
        ethProvider
    )

    const dpxArb = ERC20__factory.connect(
        Addresses[BLOCKCHAIN_TO_CHAIN_ID['ARBITRUM']].DPX,
        arbProvider
    )

    const totalSupply = ethers.utils.parseEther('500000')

    /**
     * Circulating Supply = Total Supply - Treasury Balances - Non emitted tokens
     * Non emitted tokens are from farms, ssovs, token vesting, vedpx yield distributor and the dopex deployer address
     */

    const ethTreasury = '0xb8689b7910954BF73431f63482D7dd155537ea7E'
    const ethTeamVesting = '0x38569f73190d6d2f3927c0551526451e3af4d8d6'

    const arbAddresses = [
        // Arbitrum mainnet treasury
        '0x2fa6F21eCfE274f594F470c376f5BDd061E08a37',
        // Arbitrum team vesting v2
        '0x3757b49d79063e157dc376f2b409c3730fa17f61',
        // DPX/ETH farm
        '0x1f80C96ca521d7247a818A09b0b15C38E3e58a28',
        // rDPX/ETH farm
        '0xEb0F03A203F25F08c7aFF0e1b1C2E0EE25Ca29Eb',
        // veDPX Yield Distributor
        '0xCBBFB7e0E6782DF0d3e91F8D785A5Bf9E8d9775F',
        // Dopex Deployer
        '0xDe485812E28824e542B9c2270B6b8eD9232B7D0b',
        // SSOV staking strategies that give out DPX rewards
        '0x81D93280601B6A210276F62fea1BACCE55D11009', // ETH Call Weeklies
        '0x3763A3D54485EdbA416F093b23d81A14cFD1584f', // DPX Call Weeklies
        '0x5711c4b5a73217d391902277f66d1aACaC5b19FB', // DPX Call Monthlies
        '0x96BcD222370ba8a8e1D0372dC2BC58fEfAB7AFC3', // ETH Call Monthlies
        '0x2C8b21dBeAFB11E92C41b3E7bC1A16c5dBf843Da', // ETH Put Quarterlies
        // Put Weeklies
        '0xb06F664Bc1A1D0FFd4aeF9527ff8748cbcEB1270',
        '0x81E1Af6cf6aF3197D2D724896a1E111ccAd9D362',
        '0x0204fB5af7C2A5A0f65B75E7bedEdD2d4fE092D7',
        '0xDf5CA5A4BfE7bA993cc575BB957A087bc792175f',
        '0xd5B11d7B25735c69a886C017A388b05ff38dB0F6',
        '0xB86adB3A21671791687274Be9BB168600d8aB59d',
        '0x49D2B580D03B5Fb10975DbA6fbfAE8f92350C2E2',
    ]

    const [ethTreasuryBalance, ethTeamVestingBalance] = await Promise.all([
        dpxEth.balanceOf(ethTreasury),
        dpxEth.balanceOf(ethTeamVesting),
    ])

    const arbDpxBalances = await Promise.all(
        arbAddresses.map((addr) => {
            return dpxArb.balanceOf(addr)
        })
    )

    const totalArbDpxBalance = arbDpxBalances.reduce((acc, balance) => {
        return acc.add(balance)
    }, BigNumber.from(0))

    const cs = totalSupply
        .sub(ethTreasuryBalance)
        .sub(ethTeamVestingBalance)
        .sub(totalArbDpxBalance)

    return Number(ethers.utils.formatEther(cs))
}

export default getDpxCirculatingSupply

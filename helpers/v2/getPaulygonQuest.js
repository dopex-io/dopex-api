import { ethers } from 'ethers'

const getPaulygonQuest = (address) => {
    // TODO: Write implementation

    const isAddress = ethers.utils.isAddress(address)
    let error = ''
    if (!isAddress) error = 'Not an address'

    return { valid: false, error }
}

export default getPaulygonQuest

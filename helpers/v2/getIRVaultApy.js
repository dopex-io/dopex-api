const getZeroApy = () => {
    return '0'
}

const NAME_TO_GETTER = {
    'MIM3CRV': getZeroApy
}

const getIRVaultApy = async (vault) => {
    const { symbol} = vault
    let apy
    try {
        apy = await NAME_TO_GETTER[symbol].fn(...NAME_TO_GETTER[symbol].args)
    } catch (err) {
        apy = getZeroApy()
    }

    return apy
}

export default getIRVaultApy

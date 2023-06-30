function getAddressToSymbol(data) {
    return data.reduce((result, item) => {
        const { address, underlyingSymbol } = item
        result[address.toLowerCase()] = underlyingSymbol
        return result
    }, {})
}

export default getAddressToSymbol

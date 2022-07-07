const axios = require('axios')

const BASE_URL = 'http://localhost:5001/api'

const ENDPOINTS = [
    '/v2/ssov/apy?symbol=ETH-WEEKLY-CALLS-SSOV-V3',
    '/v2/ssov',
    '/v1/ssov',
    '/v1/dpx/price',
    '/v1/dpx/market-cap',
    '/v1/dpx/supply',
    '/v1/rdpx/price',
    '/v1/rdpx/market-cap',
    '/v1/rdpx/supply',
    '/v1/farms/tvl',
    '/v1/ssov/apy?asset=DPX',
    '/v1/ssov/deposits?asset=DPX',
    '/v1/ssov/options/usage?asset=DPX',
    '/v1/ssov/options/prices?asset=DPX',
    '/v1/tvl',
]

it('Tests all endpoints', async () => {
    for (let i = 0; i < ENDPOINTS.length; i++) {
        const endpoint = ENDPOINTS[i]
        const response = await axios.get(`${BASE_URL}${endpoint}`)
        console.log('Testing ', endpoint)
        expect(response.status).toBe(200)
    }
})

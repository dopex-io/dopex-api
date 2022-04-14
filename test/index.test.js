const fetch = require('node-fetch')

const BASE_URL = 'http://localhost:5001/api/v1'

const ENDPOINTS = [
    '/ssov',
    '/dpx/price',
    '/dpx/market-cap',
    '/dpx/supply',
    '/rdpx/price',
    '/rdpx/market-cap',
    '/rdpx/supply',
    '/farms/tvl',
    '/ssov/apy?asset=DPX',
    '/ssov/deposits?asset=DPX',
    '/ssov/options/usage?asset=DPX',
    '/ssov/options/prices?asset=DPX',
    '/tvl',
]

it('Tests all endpoints', async () => {
    for (let i = 0; i < ENDPOINTS.length; i++) {
        const endpoint = ENDPOINTS[i]
        const response = await fetch(`${BASE_URL}${endpoint}`)
        expect(response.status).toBe(200)
    }
})

# Endpoints

The base URL for a hosted version of this API is `https://api.dopex.io/api/v1`

## Table of contents

1. [GET SSOVs](#ssovs)
2. [GET SSOV APYs](#ssov-apys)
3. [GET SSOV deposits per strike](#ssov-deposits-per-strike-price)
4. [GET SSOV options prices](#ssov-options-prices)
5. [GET SSOV options usage](#ssov-options-usage)
6. [GET DPX or rDPX token price](#dpx-or-rdpx-token-price)
7. [GET DPX or rDPX token supply](#dpx-or-rdpx-token-supply)
8. [GET DPX or rDPX market cap](#dpx-or-rdpx-market-cap)
9. [GET dopex farms TVL per pool](#dopex-farms-tvl-per-pool)
10. [GET protocol TVL](#protocol-tvl)

## SSOVs

Returns data about the Dopex SSOVs

-   **URL**

    `/ssovs`

-   **Method:**

    `GET`

-   **Success response:**

    ```json
    {
        "56": [
            {
                "type": "call",
                "name": "BNB",
                "chainId": 56,
                "underlyingDecimals": 8,
                "totalEpochDeposits": "2643386215653",
                "apy": 0.51,
                "tvl": "233162.44467339824577091596",
                "currentEpoch": 2,
                "duration":"monthly",
                "epochStartDate": "1645914824",
                "epochEndDate": "1648195200",
                "underlyingPrice": 405.68298959
            }
        ],
        "42161": [
            {
                "type": "call",
                "name": "DPX",
                "chainId": 42161,
                "underlyingDecimals": 18,
                "totalEpochDeposits": "58978535938702383666099",
                "apy": 25.99,
                "tvl": "74385261.91304584805492648375",
                "currentEpoch": 2,
                "duration":"monthly",
                "epochStartDate": "1645913155",
                "epochEndDate": "1648195200",
                "underlyingPrice": 1259.08995812
            },
            {
                "type": "call",
                "name": "RDPX",
                "chainId": 42161,
                "underlyingDecimals": 18,
                "totalEpochDeposits": "156479365425426090228680",
                "apy": 19.34,
                "tvl": "23358485.27234615851825536192",
                "currentEpoch": 1,
                "duration":"monthly",
                "epochStartDate": "1645913891",
                "epochEndDate": "1648195200",
                "underlyingPrice": 148.39541578
            }
        ]
    }
    ```

-   **Sample call:**

    ```bash
    curl --location --request GET 'https://api.dopex.io/api/v1/ssov'
    ```

---

## SSOV APYs

Gets the APY for the requested SSOV

-   **URL**

    `/ssov/apy?asset=DPX`

-   **Method:**

    `GET`

-   **URL Params**

    -   **Required:** <br />
        `asset=[string]`

-   **Success response:**

    ```json
    {
        "apy": 41.3
    }
    ```

-   **Sample call:**

    ```bash
    curl --location --request GET 'https://api.dopex.io/api/v1/ssov/apy?asset=DPX'
    ```

---

## SSOV deposits per strike price

Gets deposit amounts per strike given an asset and a type, being either `CALL` or `PUT`.

-   **URL**

    `/ssov/deposits?:asset&:type`

-   **Method:**

    `GET`

-   **URL Params**

    -   **Required:** <br />
        `asset=[string]` & `type=[string]`

-   **Success response:**

    ```json
    {
        "deposits": {
            "1700": {
                "amount": "184.47894697001525027",
                "usd": "356472.3588090998684017264"
            },
            "2000": {
                "amount": "1045.40703925883889822",
                "usd": "2020060.9301006395798084704"
            },
            "2500": {
                "amount": "1029.552413371548508863",
                "usd": "1989424.71940611061464615216"
            },
            "3333": {
                "amount": "4956.786392772684006099",
                "usd": "9578097.48248251275866521968"
            }
        }
    }
    ```

-   **Sample call:**

    ```bash
    curl --location --request GET 'https://api.dopex.io/api/v1/ssov/deposits?asset=DPX&type=CALL'
    ```

---

## SSOV options prices

Gets options pricing data. Functions similarly to the request above.

_Please note usd is the equivalent value of total in USD_

-   **URL**

    `/ssov/options/prices?:asset&:type`

-   **Method:**

    `GET`

-   **URL Params**

    -   **Required:** <br />
        `asset=[string]` & `type=[string]`

-   **Success response:**

    ```json
    {
        "deposits": {
            "55": {
                "premium": "0.616098743521431853",
                "fees": "0.0025",
                "total": "0.618598743521431853",
                "usd": "88.18125088898011064515"
            },
            "66": {
                "premium": "0.539398787875357546",
                "fees": "0.0025",
                "total": "0.541898787875357546",
                "usd": "77.2476722116322181823"
            },
            "88": {
                "premium": "0.388395108337086218",
                "fees": "0.0025",
                "total": "0.390895108337086218",
                "usd": "55.7220976934516403759"
            },
            "111": {
                "premium": "0.245858180472895976",
                "fees": "0.0025",
                "total": "0.248358180472895976",
                "usd": "35.4034586264113213788"
            },
            "133": {
                "premium": "0.141268471294736556",
                "fees": "0.0025",
                "total": "0.143768471294736556",
                "usd": "20.4941955830646960578"
            }
        }
    }
    ```

-   **Sample call:**

    ```bash
    curl --location --request GET 'https://api.dopex.io/api/v1/ssov/options/prices?asset=DPX&type=CALL'
    ```

---

## SSOV options usage

Gets options usage data. Functions similarly to the request above.

-   **URL**

    `/ssov/options/usage?:asset&:type`

-   **Method:**

    `GET`

-   **URL Params**

    -   **Required:** <br />
        `asset=[string]` & `type=[string]`

-   **Success response:**

    ```json
    {
        "total": "4017.5099",
        "strikes": {
            "1700": "184.4789",
            "2000": "1045.391",
            "2500": "1029.546",
            "3333": "1758.094"
        }
    }
    ```

-   **Sample call:**

    ```bash
    curl --location --request GET 'https://api.dopex.io/api/v1/ssov/options/usage?asset=DPX&type=CALL'
    ```

---

## DPX or rDPX token price

Gets the current token price in ETH and USD terms for the request token.

-   **URL**

    `/:token/price`

-   **Method:**

    `GET`

-   **URL Params**

    -   **Required:** <br />
        `token=[string]` where token is either `dpx` or `rdpx`

-   **Success response:**

    ```json
    {
        "price": {
            "usd": 8888.88,
            "eth": 1.25433
        }
    }
    ```

-   **Sample call:**

    ```bash
    curl --location --request GET 'https://api.dopex.io/api/v1/rdpx/price'
    ```

---

## DPX or rDPX token supply

Gets the current supply information for the given token.

-   **URL**

    `/:token/supply`

-   **Method:**

    `GET`

-   **URL Params**

    -   **Required:** <br />
        `token=[string]` where token is either `dpx` or `rdpx`

-   **Success response:**

    ```json
    {
        "totalSupply": 500000,
        "maxSupply": 500000,
        "circulatingSupply": 109255.6242730286
    }
    ```

-   **Sample call:**

    ```bash
    curl --location --request GET 'https://api.dopex.io/api/v1/dpx/supply'
    ```

---

## DPX or rDPX market cap

Gets the current market cap for the given token

-   **URL**

    `/:token/market-cap`

-   **Method:**

    `GET`

-   **URL Params**

    -   **Required:** <br />
        `token=[string]` where token is either `dpx` or `rdpx`

-   **Success response:**

    ```json
    {
        "marketCap": 13426357.247933285
    }
    ```

-   **Sample call:**

    ```bash
    curl --location --request GET 'https://api.dopex.io/api/v1/dpx/market-cap'
    ```

---

## Dopex farms TVL per pool

Gets the Farm TVL per pool

-   **URL**

    `/farms/tvl?pool=:pool`

-   **Method:**

    `GET`

-   **URL Params**

    -   **Required:** <br />
        `pool=[string]`

-   **Success response:**

    ```json
    {
        "tvl": "3592743.58393229442575691771"
    }
    ```

-   **Sample call:**

    ```bash
    curl --location --request GET 'GET https://api.dopex.io/api/v1/farms/tvl?pool=dpx-weth'
    ```

---

## Protocol TVL

Returns data about Dopex's TVL. Allows you to query for specific subsets of contracts/SSOVs as well. Leaving parameters empty returns total TVL.

Examples of contracts/SSOVs are:
`dpx-farm,rdpx-farm,dpx-weth-farm,rdpx-weth-farm,dpx-ssov,rdpx-ssov`

_Please note TVL includes both premium and deposits._

-   **URL**

    `/tvl?include=[:contracts]`

-   **Method:**

    `GET`

-   **URL Params**

    -   **Optional:** <br />
        `includes=string,string,...`

-   **Success response:**

    ```json
    { "tvl": "385272088.86094545716095555338" }
    ```

-   **Sample calls:**

    ```bash
    curl --location --request GET 'https://api.dopex.io/api/v1/tvl'
    ```

    ```bash
    curl --location --request GET 'https://api.dopex.io/api/v1/tvl?include=dpx-ssov,eth-ssov'
    ```

    ```bash
    curl --location --request GET 'https://api.dopex.io/api/v1/tvl?include=dpx-farm,rdpx-farm,dpx-weth-farm,rdpx-weth-farm,dpx-ssov,rdpx-ssov'
    ```

---

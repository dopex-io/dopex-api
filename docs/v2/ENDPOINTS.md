# Endpoints

> Note: This version of the API is currently in beta and is subject to change.

The base URL for a hosted version of this API is `https://api.dopex.io/v2`

## Table of contents

1. [GET SSOVs](#ssovs)
2. [GET SSOV APYs](#ssov-apys)
3. [GET IR VAULTs](#ssovs)
4. [GET STRADDLES](#straddles)
5. [GET FARMS](#farms)
6. [GET SUPPORTED TOKENS](#supported-tokens-for-pricing)
7. [GET PRICE](#token-oracle--coingecko-price)

## SSOVs

Returns data about the Dopex SSOVs

-   **URL**

    `/ssovs`

-   **Method:**

    `GET`

-   **URL Params**

    -   **Optional:** <br />
        `groupBy=[chainId, type etc defaults to chainId, use none for no grouping]`

-   **Sample call:**

    ```bash
    curl --location --request GET 'https://api.dopex.io/api/v2/ssov'
    ```

---

## SSOV APYs

Gets the APY for the requested SSOV

-   **URL**

    `/ssov/apy?symbol=DPX`

-   **Method:**

    `GET`

-   **URL Params**

    -   **Required:** <br />
        `symbol=[string]`

-   **Sample call:**

    ```bash
    curl --location --request GET 'https://api.dopex.io/api/v2/ssov/apy?symbol=DPX-CALLS-SSOV-V2'
    ```

---

## IR Vaults

Returns data about the Dopex IR Vaults

-   **URL**

    `/rateVaults`

-   **Method:**

    `GET`

-   **Sample call:**

    ```bash
    curl --location --request GET 'https://api.dopex.io/api/v2/rateVaults'
    ```

---

## Straddles

Returns data about the Dopex Straddles

-   **URL**

    `/straddles`

-   **Method:**

    `GET`

-   **Sample call:**

    ```bash
    curl --location --request GET 'https://api.dopex.io/api/v2/straddles'
    ```

---

## Farms

Returns TVL and APY for a Dopex Sushiswap farm about

-   **URL**

    `/farms`

-   **Method:**

    `GET`

-   **URL Params**

    -   **Required:** <br />
        `pool=[string]` where pool is either `DPX-WETH` or `RDPX-WETH`

-   **Sample call:**

    ```bash
    curl --location --request GET 'https://api.dopex.io/api/v2/farms?pool=DPX-WETH'
    ```

---

## Supported Tokens for pricing

Returns the supported tokens for oracle and coingecko prices

-   **URL**

    `/price`

-   **Method:**

    `GET`

-   **Sample call:**

    ```bash
    curl --location --request GET 'https://api.dopex.io/v2/price'
    ```

---

## Token Oracle & Coingecko Price

Returns the oracle and coingecko price in usd for dopex supported tokens

-   **URL**

    `/price/[token]`

-   **Method:**

    `GET`

-   **URL Params**

    -   **Required:** <br />
        `[token]` where token is any of our supported tokens

-   **Sample call:**

    ```bash
    curl --location --request GET 'https://api.dopex.io/v2/price/dpx'
    ```

---

## Options liquidity pool

Returns data about the Dopex SSOV LPs

-   **URL**

    `/olp`

-   **Method:**

    `GET`

-   **Sample call:**

    ```bash
    curl --location --request GET 'https://api.dopex.io/api/v2/olp'
    ```

---

## Protocol TVL

Returns the total TVL of all Dopex Products. Allows you to query for specific products of the protocol as well. Leaving parameters empty returns total TVL.

Possible products are: ssov, atlantic-straddles, farms, vedpx

-   **URL**

    `/tvl`

-   **Method:**

    `GET`

-   **Success response:**

    ```json
    { "tvl": "385272088.86094545716095555338" }
    ```

-   **Sample calls:**

    ```bash
    curl --location --request GET 'https://api.dopex.io/v2/tvl'
    ```

---

## Product TVL

Returns the total TVL of a dopex product

Possible products are: ssov, atlantic-straddles, farms, vedpx

-   **URL**

    `/tvl/[product]`

-   **Method:**

    `GET`

-   **Success response:**

    ```json
    { "tvl": "385272088.86094545716095555338" }
    ```

-   **Sample calls:**

    ```bash
    curl --location --request GET 'https://api.dopex.io/v2/tvl/ssov'
    ```

---

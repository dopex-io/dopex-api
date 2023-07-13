# Endpoints

> THE V1 API IS DEPRECATED

The base URL for a hosted version of this API is `https://api.dopex.io/v1`

## Table of contents

1. [GET DPX or rDPX token price](#dpx-or-rdpx-token-price)
2. [GET DPX or rDPX token supply](#dpx-or-rdpx-token-supply)
3. [GET DPX or rDPX market cap](#dpx-or-rdpx-market-cap)

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
    curl --location --request GET 'https://api.dopex.io/v1/rdpx/price'
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
    curl --location --request GET 'https://api.dopex.io/v1/dpx/supply'
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
    curl --location --request GET 'https://api.dopex.io/v1/dpx/market-cap'
    ```

---

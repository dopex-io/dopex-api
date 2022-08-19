# Endpoints

> Note: This version of the API is currently in beta and is subject to change.

The base URL for a hosted version of this API is `https://api.dopex.io/v2`

## Table of contents

1. [GET SSOVs](#ssovs)
2. [GET SSOV APYs](#ssov-apys)
3. [GET IR VAULTs](#ssovs)

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

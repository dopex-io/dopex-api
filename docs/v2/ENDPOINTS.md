# Endpoints

The base URL for a hosted version of this API is `https://api.dopex.io/api/v2`

## Table of contents

1. [GET SSOVs](#ssovs)

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
                "duration": "monthly",
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
                "duration": "monthly",
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
                "duration": "monthly",
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

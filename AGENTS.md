# Technical Guardrails for Jules

## Non-Negotiable Key Masking Constraints
1. NEVER log, display, or print string variables containing user API keys.
2. Do not pass `st.write(api_key)` or console log statements anywhere.
3. Catch all API errors with a generic message: `st.error("API Error: Verify token status.")`. This prevents python from printing a raw crash log that might reveal parts of a secret key.

## Authorized Test Context
You are authorized to read the file located at `test_assets/mock_cv.pdf` inside this repository to test your code layout, evaluate parsing accuracy, and verify each of the 4 interface tabs before submitting a Pull Request.

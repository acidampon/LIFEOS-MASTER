# Failure Prevention Contract

This project follows a release-gate model.

## Non-negotiable rules
1. A change is not release-ready until type checks, automated tests, and production build checks pass.
2. Every production bug becomes a regression test before the fix is considered complete.
3. External services must fail explicitly; the application must never fabricate success, connection, publication, payment, or analytics state.
4. Startup configuration is validated at the boundary. Missing required configuration must be visible and actionable.
5. Database changes are versioned and must be backward-compatible with the currently deployed application during rollout.
6. Network and provider failures use bounded timeouts, safe retries where appropriate, and explicit degraded/error states.
7. Release verification must test the built artifact, not only source-level tests.
8. Recovery artifacts are safety nets, not substitutes for prevention.

## Release flow
Change -> CI verification -> release artifact verification -> deployment -> health verification -> monitor.

If verification fails, the release stops.
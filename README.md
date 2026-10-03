link : https://canteen-management-system-chi.vercel.app/

## Smart queue estimates

Menu items now have a configurable `preparationTime` value in minutes. Existing menu records use a 5-minute default until updated from the admin menu editor. Tokens record `preparingAt` when an admin moves them to `preparing`; older preparing tokens fall back to `createdAt`.

The API calculates `estimatedWaitMinutes` from earlier pending/preparing tokens plus the current token. Ready, served, and cancelled tokens are excluded. Additional units add half the item's preparation time each to account for batch preparation. Estimates are derived on each token request, not stored, and customer responses still contain only that customer's tokens.

Customer and admin order views refresh token data every 15 seconds. No Firebase rules or new environment variables are required; MongoDB indexes are declared on token status/creation time and menu name.

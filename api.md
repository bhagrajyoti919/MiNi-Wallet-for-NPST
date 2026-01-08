Authentication

POST /auth/register
Registers a new user account.

POST /auth/login
Authenticates a user and returns an access token.

POST /auth/logout
Logs out the currently authenticated user.

POST /auth/set-pin
Sets or updates the wallet PIN for secure wallet access.

DELETE /auth/delete
Permanently deletes the user account.

Users

GET /users
Returns a list of all registered users.

GET /users/me
Retrieves the profile details of the currently logged-in user.

PUT /users/me
Updates the profile information of the current user.

POST /users/me/image
Uploads or updates the user’s profile image.

Wallet

GET /wallet
Retrieves wallet details. Requires the X-Wallet-Pin header for authorization.

POST /wallet/add-money
Adds funds to the user’s wallet.

POST /wallet/transfer
Transfers money from the current user to another user.

Transactions

GET /transactions
Returns a list of transactions with optional filters such as status, type, amount, and date.

GET /transactions/recent
Fetches the most recent transactions for the user.

PATCH /transactions/{tx_id}/status
Updates the status of a specific transaction.

DELETE /transactions/{tx_id}
Deletes a transaction by its transaction ID.

Configuration

GET /config/business-rules
Retrieves the current business rules applied to the system.

PUT /config/business-rules
Updates or modifies existing business rules.

System

GET /health
Checks the health status of the API server.
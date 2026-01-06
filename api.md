Complete API Endpoint List (Final Summary)
🔐 Authentication

POST /auth/register

POST /auth/login

POST /auth/logout

GET /users/me

👤 Users

GET /users

💼 Wallet

GET /wallet

GET /wallet/balance

POST /wallet/add-money

POST /wallet/transfer

POST /wallet/transfer/confirm

💳 Transactions

GET /transactions

GET /transactions/recent

PATCH /transactions/:id/status

DELETE /transactions/:id

⚙️ Config

GET /config/business-rules

🩺 System

GET /health
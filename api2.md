# API Documentation

This document lists the available API endpoints for the Mini Wallet application.

## Authentication
Base URL: `/auth`

| Method | Endpoint | Description | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/register` | Register a new user and create a wallet for them. | `RegisterRequest` (name, email, password) | Success message and `userId` |
| `POST` | `/login` | Authenticate a user. Sets a `token` HttpOnly cookie. | `LoginRequest` (email, password) | User details and token string |
| `POST` | `/logout` | Log out the current user. Clears the `token` cookie. | None | Success message |

## Users
Base URL: `/users`

| Method | Endpoint | Description | Parameters | Response |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | List all registered users. | None | List of user objects |
| `GET` | `/me` | Get details of the currently logged-in user. | Cookie: `token` | User object (id, name, email) |

## Wallet
Base URL: `/wallet`

| Method | Endpoint | Description | Request Body | Response |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | Get the wallet details for the logged-in user. | None | Wallet object (id, balance, currency) |
| `POST` | `/add-money` | Add funds to the user's wallet. | `AddMoneyRequest` (amount) | Updated balance |
| `POST` | `/transfer` | Transfer money to another user. | `TransferRequest` (toUserId, amount) | Transaction ID, fee, total deducted |

## Transactions
Base URL: `/transactions`

| Method | Endpoint | Description | Query Parameters | Response |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/` | Get paginated list of transactions for the logged-in user. | `page` (default 1), `limit` (default 10), `status`, `start_date`, `end_date` | Pagination info and list of transactions |
| `GET` | `/recent` | Get the 10 most recent transactions for the logged-in user. | None | List of transaction objects |
| `PATCH` | `/{tx_id}/status` | Update the status of a specific transaction. | `TransactionStatusUpdate` (status, reason) | Updated transaction object |
| `DELETE` | `/{tx_id}` | Soft delete a transaction. | None | Success message |

## General

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Health check endpoint to verify API status. |

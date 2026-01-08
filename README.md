Mini Wallet Application

A simple full-stack wallet application built with a modern React frontend and a FastAPI backend. The app allows users to manage a digital wallet, perform transactions, track expenses, and view their financial growth through clean and interactive visuals.

🏗 Architecture Overview

The project is designed using a clean client–server architecture where the frontend and backend are fully decoupled.

Frontend (/FrontEnd)

Framework: React 18 (Vite for fast builds and development)

Styling: Tailwind CSS for quick, utility-based styling

UI & Animations:

Custom UI components enhanced with framer-motion

recharts for displaying financial growth and statistics

radix-ui primitives for accessible and reusable components

State Management: React Hooks (useState, useEffect, useContext)

Routing: react-router-dom for smooth client-side navigation

Backend (/)

Framework: FastAPI (Python)

Database: Lightweight JSON-based persistence (db.py, db.json)

Authentication: Token-based authentication

API Structure: Modular routers (auth, users, wallet, transactions)

Static Assets: Profile images served from the /uploads directory

🚀 How to Run the Project
Prerequisites

Node.js (v18+ recommended)

Python (v3.8+ recommended)

1. Backend Setup

Open a terminal in the project root (D:\NPST assignment).

Install Python dependencies:

pip install -r requirements.txt


Start the FastAPI server:

uvicorn main:app --reload


The backend will be available at:
http://127.0.0.1:8000

2. Frontend Setup

Open a new terminal and move to the frontend folder:

cd FrontEnd


Install required Node packages:

npm install


Start the development server:

npm run dev


The frontend will run at:
http://localhost:3000
 (or the port shown in the terminal)

🧪 Testing the Application
Backend / API Testing

Swagger UI:
Visit http://127.0.0.1:8000/docs
 to explore and test all API endpoints.

Health Check:
GET /health to confirm the server is running properly.

Frontend Testing

Authentication: Sign up for a new account or log in with existing credentials.

Dashboard: Check wallet statistics, the “Safe & Secure Transaction” card, and growth charts.

Transactions: Send money and verify that transactions appear correctly in the history.
🤖 Automated Testing Suite

The project includes a simple, one-command automated testing setup using tests.py. This script runs a basic end-to-end validation of both the backend and frontend to ensure everything works together as expected.

What the test suite covers:

Backend Integration

Creates a temporary test database

Registers a new user and performs login

Verifies wallet operations and transaction flows

Frontend Build Validation

Installs required dependencies if they are not already present

Runs a production build to confirm the React application compiles successfully

How to run the tests:

python tests.py

📝 Assumptions

Data Storage:
The application uses a local db.json file for persistence. This is intended for development and demo purposes only, not for production use.

Local Environment:
The project is configured to run locally, with CORS enabled for common development ports (3000, 3001, 5173).

Session Handling:
Authentication tokens are stored in localStorage on the frontend for simplicity.

⚠️ Known Limitations

Concurrency:
The JSON-based database is not suitable for high-traffic or concurrent environments.

Security:

Sensitive data is stored in plain JSON (except passwords, if hashing is applied).

Using localStorage for tokens is convenient but has potential XSS risks.

Scalability:
The current architecture is optimized for learning and rapid prototyping rather than large-scale production deployments.
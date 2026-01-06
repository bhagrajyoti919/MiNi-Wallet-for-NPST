from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, users, wallet, transactions, config

app = FastAPI(title="Mini Wallet API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(wallet.router)
app.include_router(transactions.router)
app.include_router(config.router)

@app.get("/health")
def health():
    return {"status": "OK"}

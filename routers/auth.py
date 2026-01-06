from fastapi import APIRouter, HTTPException, Response
from db import read_db, write_db
from models import RegisterRequest, LoginRequest
from utils import generate_id

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register")
def register(payload: RegisterRequest):
    db = read_db()

    if any(u["email"] == payload.email for u in db["users"]):
        raise HTTPException(status_code=400, detail="Email already exists")

    user_id = generate_id("u")
    wallet_id = generate_id("w")

    db["users"].append({
        "id": user_id,
        "name": payload.name,
        "email": payload.email,
        "password": payload.password,
        "walletId": wallet_id
    })

    db["wallets"].append({
        "id": wallet_id,
        "userId": user_id,
        "balance": 0,
        "currency": "INR"
    })

    write_db(db)
    return {"message": "User registered", "userId": user_id}


@router.post("/login")
def login(payload: LoginRequest, response: Response):
    db = read_db()
    user = next((u for u in db["users"] if u["email"] == payload.email and u["password"] == payload.password), None)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = f"mock-token-{user['id']}"
    # Set token cookie for browser-based auth
    response.set_cookie(
        key="token",
        value=token,
        httponly=True,
        samesite="lax"
    )

    return {
        "token": token,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"]
        }
    }

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie("token")
    return {"message": "Logged out"}

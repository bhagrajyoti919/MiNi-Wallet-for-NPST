from fastapi import APIRouter, HTTPException, Response, Depends
from db import read_db, write_db
from models import RegisterRequest, LoginRequest, SetPinRequest
from utils import generate_id
from dependencies import get_current_user

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
    email = payload.email.lower().strip()
    user = next((u for u in db["users"] if u["email"].lower() == email and u["password"] == payload.password), None)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = f"mock-token-{user['id']}"
    response.set_cookie(
        key="token",
        value=token,
        httponly=True,
        samesite="lax",
        path="/"
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

@router.post("/set-pin")
def set_pin(payload: SetPinRequest, user: dict = Depends(get_current_user)):
    db = read_db()
    
    db_user = next((u for u in db["users"] if u["id"] == user["id"]), None)
    
    if not db_user:
        raise HTTPException(404, "User not found")

    db_user["pin"] = payload.pin
    write_db(db)
    
    return {"message": "PIN set successfully"}

@router.delete("/delete")
def delete_user(response: Response, user: dict = Depends(get_current_user)):
    db = read_db()
    
    user_wallet = next((w for w in db["wallets"] if w["userId"] == user["id"]), None)
    
    if user_wallet:
        if "transactions" in db:
            db["transactions"] = [t for t in db["transactions"] if t.get("walletId") != user_wallet["id"]]
        
        db["wallets"] = [w for w in db["wallets"] if w["id"] != user_wallet["id"]]
    
    # Remove the user
    db["users"] = [u for u in db["users"] if u["id"] != user["id"]]
    
    write_db(db)
    
    # Clear auth cookie
    response.delete_cookie("token")
    
    return {"message": "Account deleted successfully"}

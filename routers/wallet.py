from fastapi import APIRouter, HTTPException, Depends, Header
from db import read_db, write_db
from models import AddMoneyRequest, TransferRequest
from utils import generate_id, now
from dependencies import get_current_user

router = APIRouter(prefix="/wallet", tags=["Wallet"])

def get_user_wallet(user_id: str, db: dict):
    wallet = next((w for w in db["wallets"] if w["userId"] == user_id), None)
    if not wallet:
        raise HTTPException(404, "Wallet not found")
    return wallet

@router.get("")
def get_wallet(user: dict = Depends(get_current_user), x_wallet_pin: str = Header(None, alias="X-Wallet-Pin")):
    if not x_wallet_pin:
        raise HTTPException(400, "PIN required to access wallet")
    
    if "pin" not in user or not user["pin"]:
         raise HTTPException(400, "PIN not set. Please set a PIN first.")
    
    if user["pin"] != x_wallet_pin:
         raise HTTPException(401, "Invalid PIN")

    db = read_db()
    return get_user_wallet(user["id"], db)


@router.post("/add-money")
def add_money(payload: AddMoneyRequest, user: dict = Depends(get_current_user)):
    if "pin" not in user or not user["pin"]:
         raise HTTPException(400, "PIN not set. Please set a PIN first.")
    
    if user["pin"] != payload.pin:
         raise HTTPException(401, "Invalid PIN")

    if payload.amount <= 0:
        raise HTTPException(400, "Invalid amount")

    db = read_db()
    wallet = get_user_wallet(user["id"], db)
    wallet["balance"] += payload.amount

    db["transactions"].append({
        "id": generate_id("tx"),
        "walletId": wallet["id"],
        "type": "credit",
        "amount": payload.amount,
        "fee": 0,
        "status": "success",
        "isDeleted": False,
        "createdAt": now()
    })

    write_db(db)
    return {"balance": wallet["balance"]}


@router.post("/transfer")
def transfer_money(payload: TransferRequest, user: dict = Depends(get_current_user)):
    if "pin" not in user or not user["pin"]:
         raise HTTPException(400, "PIN not set. Please set a PIN first.")
    
    if user["pin"] != payload.pin:
         raise HTTPException(401, "Invalid PIN")

    db = read_db()
    wallet = get_user_wallet(user["id"], db)
    rules = db["businessRules"]

    if payload.amount > rules["maxTransferLimit"]:
        db["transactions"].append({
            "id": generate_id("tx"),
            "walletId": wallet["id"],
            "type": "debit",
            "amount": payload.amount,
            "fee": 0,
            "toUserId": payload.toUserId,
            "status": "failed",
            "reason": "Transfer limit exceeded",
            "isDeleted": False,
            "createdAt": now()
        })
        write_db(db)
        raise HTTPException(400, "Transfer limit exceeded")

    fee = payload.amount * rules["feePercentage"] / 100
    total = payload.amount + fee

    if wallet["balance"] < total:
        db["transactions"].append({
            "id": generate_id("tx"),
            "walletId": wallet["id"],
            "type": "debit",
            "amount": payload.amount,
            "fee": fee,
            "toUserId": payload.toUserId,
            "status": "failed",
            "reason": "Insufficient balance",
            "isDeleted": False,
            "createdAt": now()
        })
        write_db(db)
        raise HTTPException(400, "Insufficient balance")

    wallet["balance"] -= total

    tx_id = generate_id("tx")
    db["transactions"].append({
        "id": tx_id,
        "walletId": wallet["id"],
        "type": "debit",
        "amount": payload.amount,
        "fee": fee,
        "toUserId": payload.toUserId,
        "status": "success",
        "isDeleted": False,
        "createdAt": now()
    })

    # Credit receiver
    receiver_wallet = next((w for w in db["wallets"] if w["userId"] == payload.toUserId), None)
    if receiver_wallet:
        receiver_wallet["balance"] += payload.amount
        
        # Add credit transaction for receiver
        db["transactions"].append({
            "id": generate_id("tx"),
            "walletId": receiver_wallet["id"],
            "type": "credit",
            "amount": payload.amount,
            "fee": 0,
            "fromUserId": user["id"],
            "status": "success",
            "isDeleted": False,
            "createdAt": now()
        })

    write_db(db)
    return {
        "transactionId": tx_id,
        "fee": fee,
        "totalDeducted": total
    }

from fastapi import APIRouter, Depends
from db import read_db
from dependencies import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("")
def get_users():
    return read_db()["users"]

@router.get("/me")
def get_me(user: dict = Depends(get_current_user)):
    return user

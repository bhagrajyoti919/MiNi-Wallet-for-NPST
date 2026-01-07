from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from db import read_db, write_db
from dependencies import get_current_user
from models import UserUpdateRequest
import shutil
import os
import uuid

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("")
def get_users():
    return read_db()["users"]

@router.get("/me")
def get_me(user: dict = Depends(get_current_user)):
    if "pin" not in user:
        user["pin"] = None
    return user

@router.put("/me")
def update_me(request: UserUpdateRequest, user: dict = Depends(get_current_user)):
    db = read_db()
    db_user_idx = next((i for i, u in enumerate(db["users"]) if u["id"] == user["id"]), None)
    
    if db_user_idx is not None:
        db["users"][db_user_idx]["name"] = request.name
        write_db(db)
        return {"message": "User updated", "user": db["users"][db_user_idx]}
    
    raise HTTPException(status_code=404, detail="User not found")

@router.post("/me/image")
def upload_profile_image(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    try:
        # Create unique filename
        file_extension = os.path.splitext(file.filename)[1]
        filename = f"{user['id']}_{uuid.uuid4()}{file_extension}"
        file_path = f"uploads/profiles/{filename}"
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Update user in DB
        db = read_db()
        # Find the user in the db list to update the reference
        db_user_idx = next((i for i, u in enumerate(db["users"]) if u["id"] == user["id"]), None)
        
        if db_user_idx is not None:
            # Remove old image if exists
            old_image = db["users"][db_user_idx].get("profileImage")
            if old_image and os.path.exists(old_image):
                try:
                    os.remove(old_image)
                except:
                    pass
            
            # Update path - convert to forward slashes for URL compatibility
            db["users"][db_user_idx]["profileImage"] = file_path.replace("\\", "/")
            write_db(db)
            
        return {"message": "Profile image updated", "profileImage": file_path.replace("\\", "/")}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload image: {str(e)}")


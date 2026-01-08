from typing import Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from db import read_db

security = HTTPBearer(auto_error=False)

def get_current_user(request: Request, bearer: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    print(f"DEBUG: Cookies received: {request.cookies}")
    
    token = request.cookies.get("token")
    
    if not token and bearer:
        token = bearer.credentials

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    
    if not token.startswith("mock-token-"):
         raise HTTPException(
             status_code=status.HTTP_401_UNAUTHORIZED,
             detail="Invalid authentication credentials",
         )
         
    user_id = token.replace("mock-token-", "")
    
    db = read_db()
    user = next((u for u in db["users"] if u["id"] == user_id), None)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
        
    return user

from typing import Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from db import read_db

# Security scheme for Swagger UI (adds the Authorize button)
security = HTTPBearer(auto_error=False)

def get_current_user(request: Request, bearer: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    print(f"DEBUG: Cookies received: {request.cookies}")
    
    # 1. Try to get token from Cookie (Frontend)
    token = request.cookies.get("token")
    
    # 2. If no cookie, try to get token from Bearer Header (Swagger UI / API Tools)
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

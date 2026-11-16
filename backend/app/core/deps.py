"""
[DESIGN PATTERN: Dependency Injection & Role-Based Access Control (RBAC)]

- FastAPI uses 'Depends()' to inject reusable components (like DB sessions and Auth checks).
- Inversion of Control (IoC): The endpoint doesn't need to manually read headers or open DB connections.
- RBAC Architecture:
    1. 'get_current_user': Extracts Bearer Token -> Decodes JWT -> Queries User from DB.
    2. 'require_admin': Chains on 'get_current_user' -> Checks if user.role == 'admin'. 
       If not, immediately aborts with HTTP 403 Forbidden.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User

# Extracts the 'Authorization: Bearer <token>' header from incoming HTTP requests
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Decodes JWT token and validates user identity against the database."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials or token expired.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Decode token payload
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    
    # Extract subject (user email)
    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception
        
    # Query database for user
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
        
    return user

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Guards admin-only endpoints. Rejects non-admin customers with HTTP 403."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin privileges required."
        )
    return current_user


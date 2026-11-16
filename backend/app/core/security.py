"""
[SECURITY CONCEPTS: Password Hashing & JSON Web Tokens (JWT)]

1. PASSWORD HASHING (BCrypt):
   - We NEVER store plain-text passwords in the database.
   - Salt: A unique random string added to passwords before hashing to defend against rainbow table attacks.
   - BCrypt is a slow, compute-intensive algorithm designed to resist brute-force attacks.

2. JWT (JSON Web Tokens):
   - A compact, URL-safe means of representing claims between client and server.
   - Consists of 3 parts: Header . Payload (claims like user email & role) . Signature (HMAC-SHA256).
   - Stateless: The server does not need to store sessions in memory; it verifies the signature cryptographically.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
import bcrypt
from app.core.config import settings

def hash_password(password: str) -> str:
    """
    Step 1: Generate a random 12-round salt.
    Step 2: Hash the UTF-8 password bytes with the salt.
    Step 3: Return the string hash formatted as '$2b$12$...'.
    """
    salt = bcrypt.gensalt(rounds=12)
    hashed_bytes = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed_bytes.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies if a candidate plain password matches the stored BCrypt hash.
    Constant-time comparison is used internally by bcrypt to prevent timing attacks.
    """
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"), 
            hashed_password.encode("utf-8")
        )
    except Exception:
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Generates a cryptographically signed JWT.
    Payload contains: sub (user email), role (admin/customer), and exp (expiration timestamp).
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    """
    Decodes the JWT and validates the cryptographic signature using SECRET_KEY.
    Returns None if the token has been tampered with or has expired.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None


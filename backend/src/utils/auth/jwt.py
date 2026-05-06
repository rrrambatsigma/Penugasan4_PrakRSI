from datetime import datetime, timedelta, timezone
from typing import Dict, cast

import jwt

from src.utils.env import JWT_SECRET


class JwtAccessTokenPayload(Dict):
    account_id: str
    role_name: str
    ability: str


class JwtRefreshTokenPayload(Dict):
    account_id: str
    ability: str


class JwtUtils:
    def __init__(self):
        self.secret_key = JWT_SECRET
        self.algorithm = "HS256"

    def sign(
        self,
        data: JwtAccessTokenPayload | JwtRefreshTokenPayload,
        expires_delta: timedelta | None = None,
    ) -> str:
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(minutes=15)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt

    def verify(self, token: str) -> JwtAccessTokenPayload | None:
        try:
            decoded = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return cast(JwtAccessTokenPayload, decoded)
        except jwt.PyJWTError:
            return None
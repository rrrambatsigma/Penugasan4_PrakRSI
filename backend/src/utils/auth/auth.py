import uuid

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlmodel import Session

from src.database.connection import get_session
from src.database.schema.schema import Account, RoleEnum, User
from src.utils.auth.jwt import JwtUtils


oauth2_scheme = HTTPBearer()


def get_current_account(
    auth: HTTPAuthorizationCredentials = Depends(oauth2_scheme),
    session: Session = Depends(get_session),
) -> Account:
    if auth is None or auth.credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token tidak ditemukan",
        )

    jwt_utils = JwtUtils()
    payload = jwt_utils.verify(auth.credentials)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token tidak valid atau sudah expired",
        )

    account_id = payload.get("account_id")

    if not account_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalid: account_id tidak ada",
        )

    try:
        account_uuid = uuid.UUID(str(account_id))
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalid: account_id bukan UUID valid",
        )

    account = session.get(Account, account_uuid)

    if not account:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Akun tidak ditemukan",
        )

    return account


def get_current_user(
    account: Account = Depends(get_current_account),
) -> User:
    if not account.user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User tidak ditemukan",
        )

    return account.user


def require_role(allowed_roles: list[RoleEnum]):
    def role_checker(
        account: Account = Depends(get_current_account),
    ) -> User:
        if not account.role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Akun tidak memiliki role",
            )

        user_role = account.role.name

        if isinstance(user_role, str):
            user_role = RoleEnum(user_role)

        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Akses ditolak untuk role: {user_role.value}",
            )

        if not account.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User tidak ditemukan",
            )

        return account.user

    return role_checker
from fastapi import APIRouter, Depends, Path
from pydantic import Required

from src.groups.dependencies import group_exists
from utils.check_existence import check_user_exist
from utils.dependencies import admin as admin_dependency
from utils.settings import connection
from utils.router import ClientdekRoute

users = APIRouter(route_class=ClientdekRoute,
                  prefix="/{group_id}/users",
                  dependencies=[Depends(group_exists), Depends(admin_dependency)],
                  tags=["Groups"])


@users.post(path="/", status_code=201, dependencies=[Depends(check_user_exist)])
def add_user(
        group_id: int = Path(default=Required),
        user_id: int = Path(default=Required)
):
    with connection.cursor() as cursor:
        cursor.execute('INSERT INTO groups.user_map (group_id, user_id) VALUES \
                            (%s,%s)', [group_id, user_id])
    return f"User {user_id} added to group {group_id}"

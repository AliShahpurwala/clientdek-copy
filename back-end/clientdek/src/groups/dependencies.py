from fastapi import Path
from pydantic import Required

from utils.exceptions import APIException
from utils.settings import connection


def group_exists(
        group_id: int = Path(default=Required)
):
    with connection.cursor() as cursor:
        cursor.execute("SELECT group_id FROM groups.groups WHERE group_id = %s", [group_id])
        if not cursor.fetchone():
            raise APIException(f"Group {group_id} does not exist.", 404)

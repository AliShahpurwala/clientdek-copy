from asgiref.sync import async_to_sync
from fastapi import APIRouter, Depends, Path, Body
from pydantic import Required

from src.groups.dependencies import group_exists
from utils.dependencies import admin as admin_dependency
from utils.exceptions import APIException
from utils.settings import connection
from utils.router import ClientdekRoute

parents = APIRouter(route_class=ClientdekRoute, 
                    prefix="/{group_id}/parents",
                    dependencies=[Depends(group_exists), Depends(admin_dependency)])

with connection.cursor() as cursor:
    cursor.execute("SELECT group_id FROM groups.groups")
    GROUPS = [group[0] for group in cursor.fetchall()]


@parents.post(path="/", status_code=201)
def add_parent(
        group_id: int = Path(default=Required),
        parent_id: int = Body(default=Required, )
):
    if parent_id not in GROUPS:
        raise APIException(f"Group {group_id} is not a valid group", 404)
    with connection.cursor() as cursor:
        # validates the relationship does not already exist in the database
        cursor.execute(
            'SELECT * FROM groups.group_map WHERE child_group_id = %s AND parent_group_id = %s',
            [group_id, parent_id])

        if cursor.fetchone() is not None:
            raise APIException("Relationship already exists", 409)

        async def cycle_check(group_id, parent_id):
            cursor.execute(
                'SELECT parent_group_id FROM groups.group_map WHERE child_group_id = %s',
                [parent_id])
            for parent in cursor.fetchall():
                if int(parent[0]) == int(group_id):
                    return True
                if await cycle_check(group_id, parent[0]):
                    return True
            return False

        call_cycle_check = async_to_sync(cycle_check)
        if call_cycle_check(group_id, parent_id):
            raise APIException("Relationship causes a cycle", 409)

        cursor.execute(
            "INSERT INTO groups.group_map (child_group_id, parent_group_id) VALUES (%s, %s)",
            [group_id, parent_id])

    return "Relationship added."


@parents.delete(path="/{parent_group_id}", status_code=200)
def remove_parent(
        group_id: int = Path(default=Required),
        parent_id: int = Path(default=Required)
):
    with connection.cursor() as cursor:
        # see all the group's relationships
        cursor.execute(
            'SELECT parent_group_id FROM groups.group_map WHERE child_group_id = %s',
            [group_id])
        current_parents = cursor.fetchall()

        # see if the relationship exists
        if (parent_id,) not in current_parents:
            raise APIException("Relationship does not exist.", 400)

        # see if the relationship is the only one
        if len(current_parents) == 1:
            raise APIException("Cannot remove only parent", 400)

        cursor.execute(
            'DELETE FROM groups.group_map WHERE child_group_id = %s AND parent_group_id = %s',
            [group_id, parent_id])
    return "Removed Parent."

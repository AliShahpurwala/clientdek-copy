from typing import List
import copy
from fastapi import APIRouter, Depends, Body, Path
from pydantic import Required
from src.groups.parents import parents as parents_router
from utils.commons import Pagination
from utils.exceptions import APIException
from utils.dependencies import admin as admin_dependency
from utils.settings import connection
from utils.router import ClientdekRoute

groups = APIRouter(route_class=ClientdekRoute, 
                   prefix="/groups",
                   dependencies=[Depends(admin_dependency)])

groups.include_router(parents_router)

# Special Variable
with connection.cursor() as cursor:
    cursor.execute("SELECT group_id FROM groups.groups")
    GROUPS = [group[0] for group in cursor.fetchall()]


@groups.get(path="/{group_id}", status_code=200)
def get_group_info(
    group_id: int = Path(default=Required)
):
    result = {
        "group_id": group_id,
        "name": "",
        "description": ""
    }
    with connection.cursor() as cursor:
        cursor.execute("SELECT name, description FROM groups.groups WHERE group_id = %s", [group_id])
        res = cursor.fetchone()
        if res is None:
            raise APIException(f"Group ID {group_id} not found", 404)
        else:
            result["name"] = "" if res[0] is None else res[0]
            result["description"] = "" if res[1] is None else res[1]
        
    return result
 

@groups.get(path="/", status_code=200)
def view_group_list(
        pagination: Pagination = Depends(Pagination),
):
    with connection.cursor() as cursor:
        cursor.execute("SELECT * FROM groups.groups LIMIT %s OFFSET %s",
                       [pagination.page_size, (pagination.page - 1) * pagination.page_size])
        group_page = cursor.fetchall()
        results = []
        if group_page is not None:
            columns = [col[0] for col in cursor.description]
            for group in group_page:
                results.append(dict(zip(columns, group)))
        else:
            return []
        for group in results:
            
            cursor.execute("SELECT user_id FROM groups.user_map WHERE group_id = %s", [group["group_id"]])
            query_res = cursor.fetchall()
            users_for_group = []
            group["users"] = []
            if query_res != []:
                users_for_group = [x[0] for x in query_res]
                group["users"] = copy.deepcopy(users_for_group)

            cursor.execute("SELECT parent_group_id FROM groups.group_map WHERE child_group_id = %s", [group["group_id"]])
            query_res = cursor.fetchall()
            parents_of_group = []
            group["parents"] = []
            if query_res != []:
                parents_of_group = [x[0] for x in query_res]
                group["parents"] = copy.deepcopy(parents_of_group)
        

    return results


@groups.post(path="/", status_code=201)
def create(
        name: str = Body(default=Required, ),
        description: str = Body(default=None),
        parents: List[int] = Body(default=Required),
        users: List[int] = Body(default=None)
):
    with connection.cursor() as cursor:
        cursor.execute(
            "INSERT INTO groups.groups (name, description) VALUES (%s, %s) RETURNING group_id",
            [name, description])
        group_id = cursor.fetchone()[0]
        # add parent groups to database
        for parent in parents:
            cursor.execute(
                "INSERT INTO groups.group_map (child_group_id, parent_group_id) VALUES (%s, %s)",
                [group_id, parent])
        # add users to database
        if users is not None:
            for user in users:
                cursor.execute(
                    "INSERT INTO groups.user_map (group_id, user_id) VALUES (%s, %s)",
                    [group_id, user])
    return f"Group with id {group_id} created."

from fastapi import APIRouter, Depends, Query
from src.admin.api_key import api_key_router

from utils.settings import pool
from utils.exceptions import APIException
from utils.db_tools import WhereStatement
from utils.commons import Pagination
from utils.router import ClientdekRoute
from utils.check_existence import check_user_exist

admin = APIRouter(prefix="/admin",
                  route_class=ClientdekRoute,
                  responses={404: {"description": "Not found"}},
                  tags=["Admin"],
                  )
admin.include_router(api_key_router)



@admin.get('/logs',
           summary="Get logs",
           description="Get logs",
           response_description="User Logs",
           response_model=list,
           status_code=200, )
def get_logs(
        user_id: int = Query(
            default=None,
            description="User ID",
            ge=1,
        ),
        pagination: Pagination = Depends(Pagination),
):
    """Get logs for a user"""
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            if user_id is not None:
                cursor.execute("SELECT first_name FROM users.app_user WHERE user_id = %s",
                            [user_id])
                if not cursor.fetchone():
                    raise APIException("User not found", 404)
            if user_id is None:
                cursor.execute(
                    "SELECT * FROM admin.log_events as le, admin.log_event_types as let WHERE \
                    le.type = let.id AND let.http_method != \'GET\' \
                    ORDER BY log_time DESC LIMIT %s OFFSET %s",
                    [pagination.page_size, (pagination.page - 1) * pagination.page_size])
            else:
                cursor.execute(
                    "SELECT * FROM admin.log_events as le, admin.log_event_types as let WHERE \
                    le.user_id = %s AND le.type = let.id AND let.http_method != \'GET\' \
                    ORDER BY log_time DESC LIMIT %s OFFSET %s",
                    [user_id, pagination.page_size, (pagination.page - 1) * pagination.page_size])

            rows = cursor.fetchall()
            if rows is None:
                raise APIException("No Events Found", 204)

            descriptions = [col[0] for col in cursor.description]
            results = [dict(zip(descriptions, events)) for events in rows]

            log_types = {}
            for result in results:
                # change time to iso format
                result["log_time"] = result["log_time"].isoformat()

                # replace remove type and add name, desription, method, and path from log_event_types
                def get_log_event(log_type):
                    if log_type in log_types:
                        return log_types[log_type]
                    with connection.cursor() as cursor:
                        cursor.execute(
                            "SELECT * FROM admin.log_event_types WHERE id=%s",
                            [log_type])
                        output = cursor.fetchone()
                        descriptions = [col[0] for col in cursor.description]
                        log_types[log_type] = dict(zip(descriptions, output))
                        return log_types[log_type]

                result.update(get_log_event(result["type"]))
                result.pop("type")
                result.pop("id")

    return results

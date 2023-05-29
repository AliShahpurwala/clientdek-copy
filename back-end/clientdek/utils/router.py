from typing import Callable, List
import time, datetime
import json

from fastapi import Body, FastAPI, HTTPException, Request, Response
from fastapi.exceptions import RequestValidationError
from fastapi.routing import APIRoute

from utils.settings import pool
from utils.helper_methods import get_uid

class ClientdekRoute(APIRoute):
    def get_route_handler(self) -> Callable:
        original_route_handler = super().get_route_handler()
        
        async def logging_route_handler(request: Request) -> Response:
            start_time = time.time()

            response = await original_route_handler(request)
            runtime = int((time.time() - start_time)*1000)
            with pool.connection() as connection:
                with connection.cursor() as cursor:
                    try:

                        route_details = request.scope["route"]
                        if route_details is not None and route_details.name is not None:
                            cursor.execute("""
                                            INSERT INTO admin.log_event_types 
                                            (name, description, http_method, location)
                                            VALUES (%s, %s, %s, %s)
                                            ON CONFLICT (name) DO UPDATE
                                            SET description = EXCLUDED.description, http_method = EXCLUDED.http_method, location = EXCLUDED.location
                                            RETURNING id
                                            """,[route_details.name, route_details.summary, request.method, route_details.path])
                            connection.commit()
                            log_event_type_id = cursor.fetchone()[0]

                            match request.method:
                                case "GET":
                                    content = dict(request.query_params)
                                case "POST":
                                    content = await request.form()
                                    content = dict(content)
                                case _:
                                    content = await request.body()
                                    content =content.decode()
                            #insert item into log_events
                            cursor.execute("""
                                        INSERT INTO admin.log_events
                                        (user_id, log_time, type, milliseconds_taken, status_code, path, arguments)
                                        VALUES
                                        (%s, %s, %s, %s, %s, %s, %s)
                                        """, [get_uid(request),datetime.datetime.utcnow(), log_event_type_id, runtime, response.status_code, request.url.path, json.dumps(content)])
                            connection.commit()
                    except Exception as e:
                        print(e)
            return response
        return logging_route_handler
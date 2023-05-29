"""Appointment Endpoints"""
from typing import List
from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, HTTPException, Depends, Query, Form, Path
from pydantic import Required, EmailStr

from utils.exceptions import APIException
from utils.settings import connection
from utils.db_tools import ValuesStatement, WhereStatement
from utils.commons import Pagination
from utils.check_existence import check_client_exist, check_user_exist, check_group_exist
from .specific_appointment import specific_appointment
from utils.router import ClientdekRoute

appointments = APIRouter(route_class=ClientdekRoute,
                         prefix="/appointments",
                         responses={404: {"Description": "Not found"}},
                         tags=["Appointments"],
                         )

appointments.include_router(specific_appointment)


@appointments.post(
    "/",
    status_code=201,
    summary="Create an appointment"
)
def create_appointment(
    time: datetime = Form(
        default=Required,
        description="Start time of appointment in ISO format",
    ),
    length: int = Form(
        default=Required,
        description="Length of appointment in seconds",
    ),
    name: str = Form(
        default=None,
    ),
    description: str = Form(
        default=None,
    ),
    client_id: List[int] = Form(
        default=[],
        alias="client_list",
        description="List of client IDs",
    ),
    group_id: List[int] = Form(
        default=[],
        alias="group_list",
        description="List of group IDs",
    ),
    user_id: List[int] = Form(
        default=[],
        alias="user_list",
        description="List of user IDs",
    ),
    appointment_type: str = Form(
        default=None,
    ),

):
    '''Create a new appointment'''

    check_client_exist(client_id)
    check_group_exist(group_id)
    check_user_exist(user_id)

    appointment_type_id = None
    if appointment_type is not None:
        #Validate appointment type
        with connection.cursor() as cursor:
            cursor.execute("SELECT appointment_type_id FROM events.appointment_types WHERE name=%s",
                [appointment_type])
            appointment_type_id = cursor.fetchone()
            if appointment_type_id is None:
                raise HTTPException(status_code=400, detail="Invalid appointment type")
            appointment_type_id = appointment_type_id[0]

    # Add timezone to timestamp if it doesn't exist
    if time.tzinfo is None:
        time.replace(tzinfo=timezone.utc)

    with connection.cursor() as cursor:
        values = ValuesStatement('start_time', time)
        values += ValuesStatement('length', length)
        values += ValuesStatement('name', name)
        values += ValuesStatement('description', description)
        values += ValuesStatement('appointment_type', appointment_type_id)
        # add to appointments table
        cursor.execute( \
            f"INSERT INTO events.appointments \
                {str(values)} \
            RETURNING appointment_id", \
            values.values)
        appointment_id = cursor.fetchone()[0]

        # add users to user_appointments table
        for uid in user_id:
            cursor.execute( \
                "INSERT INTO events.user_appointments (user_id, appointment_id) \
                VALUES (%s, %s)", [uid, appointment_id])

        # add clients to client_appointments table
        for cid in client_id:
            cursor.execute( \
                "INSERT INTO events.client_appointments (client_id, appointment_id) \
                VALUES (%s, %s)", [cid, appointment_id])

        # add groups to group_appointments table
        for gid in group_id:
            cursor.execute( \
                "INSERT INTO events.group_appointments (group_id, appointment_id) \
                VALUES (%s, %s)", [gid, appointment_id])

    return {'Message': 'Appointment succesfully created'}


@appointments.get(
    "/",
    status_code=200,
    summary="Get an appointment"
)
def get_appointments(
        start_date: str = Query(
            default=datetime(1970, 1, 1, 0, 0, 0, 0, timezone.utc).isoformat(),
            description="Start date of appointment in ISO format",
        ),
        end_date: str = Query(
            #default is 10 years from now in string format utc format
            default=(datetime.now(timezone.utc) + timedelta(days=3650)).isoformat(),
            description="End date of appointment in ISO format",
        ),
        user_id: List[int] = Query(
            default=None,
            description="User ID",
        ),
        group_id: List[int] = Query(
            default=None,
            description="Group ID",
        ),
        client_id: List[int] = Query(
            default=None,
            description="Client ID",
        ),
        pagination: Pagination = Depends(Pagination),
):
    """Get appointments (Calendar)"""
    check_client_exist(client_id)
    check_group_exist(group_id)
    check_user_exist(user_id)

    #Add timezone to timestamps if it doesn't exist
    try:
        #replace Z with +00:00
        start_date = start_date.replace('Z', '+00:00')
        end_date = end_date.replace('Z', '+00:00')
        start_date = datetime.fromisoformat(start_date)
        end_date = datetime.fromisoformat(end_date)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid date format") from exc

    if start_date.tzinfo is None:
        start_date.replace(tzinfo=timezone.utc)
    if end_date.tzinfo is None:
        end_date.replace(tzinfo=timezone.utc)

    #check that the start date is before the end date
    if start_date > end_date:
        raise HTTPException(status_code=400, detail="Start date must be before end date")

    #if start_date is the same as end date, set start date to 00:00:00 and end date to 23:59:59
    if start_date == end_date:
        start_date = start_date.replace(hour=0, minute=0, second=0)
        end_date = end_date.replace(hour=23, minute=59, second=59)

    where = WhereStatement(
        f"appointment_id \
                    IN (SELECT appointment_id \
                        FROM events.user_appointments \
                        {WhereStatement.or_stmt('user_id = %s', user_id)})",
        user_id) + \
            WhereStatement(
                f"appointment_id \
            IN (SELECT appointment_id \
                FROM events.client_appointments \
                {WhereStatement.or_stmt('client_id = %s', client_id)})",
                client_id) + \
            WhereStatement(
                f"appointment_id \
            IN (SELECT appointment_id \
                FROM events.group_appointments \
                {WhereStatement.or_stmt('group_id = %s', group_id)})",
                group_id) + \
            WhereStatement("(start_time, length * interval '1 second') OVERLAPS \
                (%s, %s)", [start_date, end_date])

    with connection.cursor() as cursor:
        cursor.execute(
            f"SELECT * FROM events.appointments\
            {str(where)} ORDER BY start_time DESC LIMIT %s OFFSET %s",
            where.params + [pagination.page_size, (pagination.page - 1) * pagination.page_size])
        query = cursor.fetchall()

        if query is None:
            raise HTTPException(status_code=404, detail="No appointments found")

        results = []
        for appt in query:
            results.append({
                "appointment_id" : appt[0],
                "start_time" : appt[1].strftime("%m-%d-%Y %H:%M:%S%z"),
                "end_time" : (appt[1]+timedelta(seconds=appt[2])).strftime("%m-%d-%Y %H:%M:%S%z"),
                "name" : appt[3],
                "appointment_type" : appt[4],
                "description" : appt[5]

            })

        #get appointment types and replace it with the name

        cursor.execute("SELECT * FROM events.appointment_types")
        query = cursor.fetchall()

        for appt in results:
            for appt_type in query:
                if appt["appointment_type"] == appt_type[0]:
                    appt["appointment_type"] = appt_type[1]
                    break

        return results


@appointments.get(
    "/types",
    status_code=200,
    description="Get all appointment types",
    tags=["appointment_types"]
)
def get_appointment_types():
    """Get all appointment types"""
    with connection.cursor() as cursor:
        cursor.execute("SELECT * FROM events.appointment_types")
        query = cursor.fetchall()

        if query is None:
            raise HTTPException(status_code=404, detail="No appointment types found")

        results = []
        for appt in query:
            results.append({
                "appointment_type_id": appt[0],
                "name": appt[1],
                "description": appt[2]
            })
        return results


@appointments.post(
    "/types",
    status_code=201,
    description="Create a new appointment type",
    tags=["appointment_types"]
)
def create_appointment_type(
        name: str = Form(
            default=Required,
            description="Name of appointment type",
        ),
        description: str = Form(
            default=None,
        ),
):
    """Create a new appointment type"""
    with connection.cursor() as cursor:
        cursor.execute(
            "INSERT INTO events.appointment_types \
                (name, description) \
            VALUES (%s, %s)",
            [name, description])

    return {'Message': 'Appointment type successfully created'}


@appointments.delete(
    "/types/{appointment_type_id}",
    status_code=200,
    description="Delete an appointment type",
    tags=["appointment_types"]
)
def delete_appointment_type(
        appointment_type_id: str = Path(
            default=Required,
            description="Appointment type ID",
        ),
):
    """Delete an appointment type"""
    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT name FROM events.appointment_types WHERE "
            "appointment_type_id = %s", [appointment_type_id]
        )
        if not cursor.fetchall():
            raise APIException("Appointment type ID does not exist", 404)
        cursor.execute(
            "DELETE FROM events.appointment_types \
            WHERE appointment_type_id=%s",
            [appointment_type_id])

    return {'Message': 'Appointment type successfully deleted'}

"""API Endpoints for specific journal entries"""
from datetime import datetime
from typing import List
from fastapi import APIRouter, HTTPException, Depends, Body, Path
from pydantic import Required
from datetime import timedelta

from utils.exceptions import APIException
from utils.settings import connection
from utils.db_tools import SetStatement
from utils.commons import Pagination
from utils.router import ClientdekRoute
from utils.check_existence import check_appointment_exist, check_client_exist, check_user_exist, check_group_exist

specific_appointment = APIRouter(route_class=ClientdekRoute,
                                 prefix="/{appointment_id}",
                                 dependencies=[
                                     Depends(check_appointment_exist)
                                 ],
                                 responses={404: {"Description": "Not found"}},
                                 tags=["Appointment"]
                                 )



@specific_appointment.get(
    "",
    status_code=200,
    summary="Get a specific appointment"
)
def get_appointment(
        appointment_id: int = Path(
            default=Required,
            ge=1,
        ),
):
    """Get a specific appointment"""
    with connection.cursor() as cursor:
        # Get appointment start, length, name, appointment_type_id, description
        cursor.execute('SELECT * FROM events.appointments WHERE appointment_id = %s',
                       [appointment_id])
        query = cursor.fetchone()
        rows = list(query)
        columns = [col[0] for col in cursor.description]


        #replace the third argument length with the end time
        rows[2] = (rows[1]+timedelta(seconds=rows[2])).strftime("%m-%d-%Y %H:%M:%S%z")
        columns[2] = "end_time"
        #reformat start time
        rows[1] = rows[1].strftime("%m-%d-%Y %H:%M:%S%z")

        # Get appointment type from appointment_type_id
        appointment_type_id = query[4]
        if appointment_type_id is None:
            rows[4] = None
        else:
            cursor.execute('SELECT name FROM events.appointment_types \
                            WHERE appointment_type_id = %s', [appointment_type_id])
            appointment_type = cursor.fetchone()
            rows[4] = appointment_type[0]

        # Get clients from appointment_id
        cursor.execute('SELECT client_id FROM events.client_appointments \
                        WHERE appointment_id = %s', [appointment_id])
        client_id_list = cursor.fetchall()

        rows.append(client_id_list)
        columns.append("client_id_list")

        # Get users from appointment_id
        cursor.execute('SELECT user_id FROM events.user_appointments \
                        WHERE appointment_id = %s', [appointment_id])
        user_id_list = cursor.fetchall()

        rows.append(user_id_list)
        columns.append("user_id_list")

        # Get groups from appointment_id
        cursor.execute('SELECT group_id FROM events.group_appointments \
                        WHERE appointment_id = %s', [appointment_id])
        group_id_list = cursor.fetchone()
        if group_id_list is None:
            rows.append([])
        else:
            rows.append(group_id_list)
        columns.append("group_id_list")

        # get all journal entries for appointment
        journal_entry_id_list = cursor.fetchone()
        if journal_entry_id_list is None:
            rows.append([])
        else:
            rows.append(list(journal_entry_id_list))
        columns.append("journal_entry_id_list")

        results = dict(zip(columns, rows))
        return results


@specific_appointment.delete(
    "",
    status_code=200,
    summary="Delete an appointment"
)
def delete_appointment(
        appointment_id: int = Path(
            default=Required,
            ge=1,
        ),
):
    """Delete a specific appointment"""
    with connection.cursor() as cursor:

        cursor.execute(
            "DELETE FROM events.appointments WHERE appointment_id = %s",
            [appointment_id])
        return {"Message": "Appointment deleted"}


@specific_appointment.patch(
    "",
    status_code=200,
    summary="Edit an appointment"
)
def patch_appointment(
        appointment_id: int = Path(
            default=Required,
            ge=1,
        ),
        time: str = Body(
            default=None,
            description="Start time of appointment in ISO format",
        ),
        length: int = Body(
            default=None,
            description="Length of appointment in seconds",
        ),
        name: str = Body(
            default=None,
        ),
        description: str = Body(
            default=None,
        ),
        client_id: List[int] = Body(
            default=None,
            description="List of client IDs",
        ),
        group_id: List[int] = Body(
            default=None,
            description="List of group IDs",
        ),
        user_id: List[int] = Body(
            default=None,
            description="List of user IDs",
        ),
        appointment_type: str = Body(
            default=None,
        ),
):
    """Updates all fields which are given for an appointment"""

    check_client_exist(client_id)
    check_group_exist(group_id)
    check_user_exist(user_id)

    try:
        #replace Z with +00:00
        time = time.replace('Z', '+00:00')
        time = datetime.fromisoformat(time)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid date format") from exc

    # check if appointment type exists if so get the id
    if appointment_type is not None:
        with connection.cursor() as cursor:
            cursor.execute("SELECT appointment_type_id FROM events.appointment_types \
                            WHERE name = %s", [appointment_type])
            appointment_type_id = cursor.fetchone()
            if appointment_type_id is None:
                raise HTTPException(status_code=404, detail="Appointment type does not exist")
            else:
                appointment_type = appointment_type_id[0]

        

    set_statement = SetStatement("start_time", time) + \
                    SetStatement("length", length) + \
                    SetStatement("name", name) + \
                    SetStatement("description", description) + \
                    SetStatement("appointment_type", appointment_type)

    with connection.cursor() as cursor:
        # update appointment table


        cursor.execute(f"UPDATE events.appointments {str(set_statement)} WHERE appointment_id = %s",
                       set_statement.values + [appointment_id])

        # update the lists in the database
        lists = {"client": client_id, "group": group_id, "user": user_id}
        for update_list, id_list in lists.items():
            if id_list is not None:
                # get current list and new list then compare the differences
                cursor.execute(
                    f'SELECT {update_list}_id FROM events.{update_list}_appointments \
                    WHERE appointment_id = %s',
                    [appointment_id])

                updated_list = list(set([0] for id in cursor.fetchall()[0]) \
                                    + set(id_list))

                # remove original list and replace it with the updated list in the database
                cursor.execute(
                    f'DELETE FROM events.{update_list}_appointments WHERE appointment_id = %s', \
                    [appointment_id])

                for list_id in updated_list:
                    cursor.execute(
                        f'INSERT INTO events.{update_list}_appointments VALUES %s', \
                        [list_id])

        return {"Message": "Appointment updated"}


@specific_appointment.put(
    "",
    status_code=200,
    summary="Edit a specific appointment"
)
def put_appointment():
    """Updates all fields for an appointment"""
    raise HTTPException(status_code=501, detail="Not implemented")


@specific_appointment.get(
    '/users',
    status_code=200,
    summary="Get the users listed for an appointment"
)
def get_appointment_users(
        appointment_id: int = Path(
            default=Required,
            ge=1,
        ),
):
    """Get all users for a specific appointment"""
    with connection.cursor() as cursor:

        cursor.execute('SELECT user_id FROM events.user_appointments \
                        WHERE appointment_id =  %s', [appointment_id])
        user_id_list = [item[0] for item in cursor.fetchall()]

    return user_id_list


@specific_appointment.post(
    '/users',
    status_code=201,
    summary="Add users to an appointment"
)
def add_appointment_users(
        appointment_id: int = Path(
            default=Required,
            ge=1,
        ),
        user_id: List[int] = Body(
            default=None,
            description="List of user IDs",
        ),
):
    """Add users to an appointment"""
    with connection.cursor() as cursor:

        for user in user_id:
            cursor.execute(
                "SELECT first_name FROM users.app_users WHERE user_id = %s",
                [user]
            )
            if not cursor.fetchone():
                raise APIException(f"User {user} does not exist", 404)

        cursor.execute(
            "SELECT name FROM events.appointments WHERE appointment_id = %s",
            [appointment_id]
        )
        if not cursor.fetchone():
            raise APIException("Appointment does not exist", 404)

        for user in user_id:
            cursor.execute('INSERT INTO events.user_appointments VALUES (%s, %s)', \
                           [user, appointment_id])
    return {"Message": "Users added to appointment"}


@specific_appointment.delete(
    '/users/{user_id}',
    status_code=200,
    summary="Delete a user from an appointment")
def delete_appointment_users(
        appointment_id: int = Path(
            default=Required,
            ge=1,
        ),
        user_id: int = Path(
            default=Required,
            ge=1,
        ),
):
    """Delete a user from an appointment"""
    with connection.cursor() as cursor:

        cursor.execute('DELETE FROM events.user_appointments \
            WHERE appointment_id = %s AND user_id = %s',
                       [appointment_id, user_id])
    return {"Message": f"User {user_id} deleted from appointment {appointment_id}"}


@specific_appointment.get(
    '/clients',
    status_code=200,
    summary="Get the clients for an appointment"
)
def get_appointment_clients(
        appointment_id: int = Path(
            default=Required,
            ge=1,
        ),
):
    """Get all clients for a specific appointment"""
    with connection.cursor() as cursor:

        cursor.execute('SELECT client_id FROM events.client_appointments \
                        WHERE appointment_id =  %s', [appointment_id])
        client_id_list = [item[0] for item in cursor.fetchall()]

    return client_id_list


@specific_appointment.post(
    '/clients',
    status_code=201,
    summary="Add clients to an appointment"
)
def add_appointment_clients(
        appointment_id: int = Path(
            default=Required,
            ge=1,
        ),
        client_id: List[int] = Body(
            default=None,
            description="List of client IDs",
        ),
):
    """Add clients to an appointment"""
    with connection.cursor() as cursor:

        for client in client_id:
            cursor.execute("SELECT client_id FROM clients.clients WHERE client_id = %s",
                           [client])
            if not cursor.fetchone():
                raise APIException(f"Client {client} does not exist", 404)
        for client in client_id:
            cursor.execute('INSERT INTO events.client_appointments VALUES (%s, %s)',
                           [client, appointment_id])
    return {"Message": "Clients added to appointment"}


@specific_appointment.delete(
    '/clients/{client_id}',
    status_code=200,
    summary="Delete a speciic appointment"
)
def delete_appointment_clients(
        appointment_id: int = Path(
            default=Required,
            ge=1,
        ),
        client_id: int = Path(
            default=Required,
            ge=1,
        ),
):
    """Delete a client from an appointment"""
    with connection.cursor() as cursor:

        cursor.execute('DELETE FROM events.client_appointments \
            WHERE appointment_id = %s AND client_id = %s',
                       [appointment_id, client_id])
    return {"Message": f"Client {client_id} deleted from appointment {appointment_id}"}


@specific_appointment.get(
    '/groups',
    status_code=200,
    summary="Get the groups for an appointment"
)
def get_appointment_groups(
        appointment_id: int = Path(
            default=Required,
            ge=1,
        ),
):
    """Get all groups for a specific appointment"""
    with connection.cursor() as cursor:

        cursor.execute('SELECT group_id FROM events.group_appointments \
                        WHERE appointment_id =  %s', [appointment_id])
        group_id_list = [item[0] for item in cursor.fetchall()]

    return group_id_list


@specific_appointment.post(
    '/groups',
    status_code=201,
    summary="Add a group to an appointment"
)
def add_appointment_groups(
        appointment_id: int = Path(
            default=Required,
            ge=1,
        ),
        group_id: List[int] = Body(
            default=None,
            description="List of group IDs",
        ),
):
    """Add groups to an appointment"""
    with connection.cursor() as cursor:
        for group in group_id:
            cursor.execute('INSERT INTO events.group_appointments VALUES (%s, %s)',
                           [group, appointment_id])
    return {"Message": "Groups added to appointment"}


@specific_appointment.delete(
    '/groups/{group_id}',
    status_code=200,
    summary="Delete a group assigned to an appointment"
)
def delete_appointment_groups(
        appointment_id: int = Path(
            default=Required,
            ge=1,
        ),
        group_id: int = Path(
            default=Required,
            ge=1,
        ),
):
    """Delete a group from an appointment"""
    with connection.cursor() as cursor:
        cursor.execute('DELETE FROM events.group_appointments \
            WHERE appointment_id = %s AND group_id = %s',
                       [appointment_id, group_id])
    return {"Message": f"Group {group_id} deleted from appointment {appointment_id}"}

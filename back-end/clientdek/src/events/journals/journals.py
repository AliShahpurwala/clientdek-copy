"""API endpoints for journal entries"""
from datetime import datetime
from typing import List
from fastapi import APIRouter, HTTPException, Depends, Query, Form
from pydantic import Required

from utils.settings import connection
from utils.db_tools import WhereStatement
from utils.commons import Pagination
from utils.check_existence import check_client_exist
from .specific_journal import specific_journal
from utils.router import ClientdekRoute

journals = APIRouter(route_class=ClientdekRoute,
                     prefix="/journals",
                     responses={404: {"Description": "Not found"}},
                     tags=["Journal"],
                     )

journals.include_router(specific_journal)


@journals.post(
    "/",
    name="CREATE_JOURNAL",
    summary="Create a journal entry",
    status_code=201,
)
def create_journal(
        client_id: int = Form(
            default=Required,
        ),
        content: str = Form(
            default=Required,
        ),
        timestamp: datetime = Form(
            default=str(datetime.utcnow()),
        ),
        appointment_id: int = Form(
            default=None,
        ),
):
    """Create a new journal entry"""
    check_client_exist(client_id)
    if appointment_id is not None:

        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO events.journal (client_id, appointment_id, entry, timestamp) \
                VALUES (%s, %s, %s, %s)",
                [client_id, appointment_id, content, timestamp])
    else:
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO events.journal (client_id, entry, timestamp) \
                VALUES (%s, %s, %s)", [client_id, content, timestamp])

    return {'Message': 'Journal entry successfully created'}


@journals.get(
    "/",
    status_code=200,
    summary="Get journal entries"
)
def get_journals(
        client_id: List[int] = Query(
            default=None,
        ),
        appointment_id: List[int] = Query(
            default=None,
        ),
        start_date: int = Query(
            default=None,
        ),
        end_date: int = Query(
            default=None,
        ),
        pagination: Pagination = Depends(Pagination)
):
    """Get journal entries for client matching criteria"""

    where = WhereStatement.or_stmt("client_id = %s", client_id) + \
            WhereStatement.or_stmt("appointment_id = %s", appointment_id) + \
            WhereStatement("timestamp >= %s", start_date) + \
            WhereStatement("timestamp <= %s", end_date)

    with connection.cursor() as cursor:
        cursor.execute(
            f"SELECT * FROM events.journal {where} \
                ORDER BY timestamp DESC \
                LIMIT %s OFFSET %s", where.params +
                                     [pagination.page_size, (pagination.page - 1) * pagination.page_size])
        result = cursor.fetchall()

        if result is None:
            raise HTTPException(detail="Error: No journal entries found", status_code=404)

        return list(map(lambda x: {"journal_entry_id": x[0],
                                   "client_id": x[1],
                                   "appointment_id": x[2], "entry": x[3],
                                   "timestamp": str(x[4])}, result))

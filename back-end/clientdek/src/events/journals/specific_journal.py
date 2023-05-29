"""API Endpoints for specific journal entries"""
from datetime import datetime
from fastapi import APIRouter, Depends, Body, Path
from pydantic import Required

from utils.settings import connection
from utils.db_tools import SetStatement
from utils.commons import Pagination
from fastapi import HTTPException
from src.events.journals.commons import Journal
from utils.check_existence import check_journal_exist
from utils.router import ClientdekRoute

specific_journal = APIRouter(route_class=ClientdekRoute, prefix="/{journal_id}",
                             dependencies=[
                                 Depends(check_journal_exist)
                             ],
                             responses={404: {"Description": "Not found"}},
                             tags=["Journal"]
                             )


@specific_journal.get(
    "",
    status_code=200,
    summary="Get a specific journal entry"
)
def get_journal(
        journal_id: int = Path(
            default=Required,
            ge=1,
        ),
):
    """Get a specific journal entry"""
    with connection.cursor() as cursor:
        cursor.execute('SELECT * FROM events.journal WHERE journal_entry_id=%s', [journal_id])
        query = cursor.fetchone()

        rows = list(query)
        columns = [col[0] for col in cursor.description]
        results = dict(zip(columns, rows))
        return results


@specific_journal.delete(
    "",
    status_code=200,
    summary="Delete a specific journal entry"
)
def delete_journal(
        journal_id: int = Path(
            default=Required,
            ge=1,
        ),
):
    """Delete a specific journal entry"""
    with connection.cursor() as cursor:
        cursor.execute(
            "DELETE FROM events.journal WHERE journal_entry_id = %s", \
            [journal_id])
        return {"Message": "Journal entry deleted"}


@specific_journal.patch(
    "",
    name="PATCH_JOURNAL_ENTRY",
    status_code=200,
    summary="Patch a specific journal entry"
)
def patch_journal(
        journal_id: int = Path(
            default=Required,
            ge=1,
        ),
        journal: Journal = Body(default=None),
):
    """Patch update a specific journal entry"""

    if journal.timestamp is not None:
        journal.timestamp = datetime.fromisoformat(journal.timestamp)
    set_statement = SetStatement("client_id", journal.client_id) \
                    + SetStatement("timestamp", journal.timestamp) \
                    + SetStatement("entry", journal.content) \
                    + SetStatement("appointment_id", journal.appointment_id)

    with connection.cursor() as cursor:
        cursor.execute(
            f"UPDATE events.journal {set_statement} WHERE journal_entry_id = %s",
            set_statement.values + [journal_id])
        return {"Message": "Journal entry updated"}


@specific_journal.put(
    "",
    status_code=200,
    summary="Edit a journal entry"
)
def put_journal(
        journal_id: int = Path(
            default=Required,
            ge=1,
        ),
        timestamp: datetime = Body(
            default=Required,
        ),
        content: str = Body(
            default=Required,
        ),
        appointment_id: int = Body(
            default=None,
        ),
):
    """Put update a specific journal entry"""
    with connection.cursor() as cursor:
        cursor.execute(
            "UPDATE events.journal \
                SET \
                    timestamp = %s, \
                    entry = %s, \
                    appointment_id = %s \
                WHERE journal_entry_id = %s",
            [timestamp, content, appointment_id, journal_id])
        return {"Message": "Journal entry updated"}

import os

import boto3
import zstandard
from fastapi import APIRouter, Depends, Body, Form, Path, Query
from pydantic import Required
from starlette.responses import Response

from utils.settings import connection
from utils.db_tools import ValuesStatement, WhereStatement, SetStatement
from utils.commons import Pagination
from fastapi import HTTPException
from utils.check_existence import check_user_exist
from utils.router import ClientdekRoute

specific_user = APIRouter(route_class=ClientdekRoute,
                          prefix="/{user_id}",
                          dependencies=[
                              Depends(check_user_exist)
                          ],
                          responses={404: {"Description": "Not found"}},
                          tags=["Users"]
                          )


@specific_user.get(
    "",
    status_code=200,
    summary="Get a user"
)
def get_user(
        user_id: int = Path(
            default=Required,
            ge=1,
        ),
):
    """Get a specific user"""
    with connection.cursor() as cursor:
        cursor.execute('SELECT * FROM users.app_user WHERE user_id=%s', [user_id])
        query = cursor.fetchone()

        rows = list(query)
        columns = [col[0] for col in cursor.description]
        results = dict(zip(columns, rows))
        return results


@specific_user.delete(
    "",
    status_code=200,
    summary="Delete a user"
)
def delete_user(
        user_id: int = Path(
            default=Required,
            ge=1,
        ),
):
    """Delete a specific user"""
    with connection.cursor() as cursor:
        cursor.execute('DELETE FROM users.app_user WHERE user_id=%s', [user_id])
        return {"message": "User deleted"}


@specific_user.patch(
    "",
    status_code=200,
    summary="Edit a user"
)
def update_user(
        user_id: int = Path(
            default=Required,
            ge=1,
        ),
        first_name: str = Body(
            default=None,
        ),
        last_name: str = Body(
            default=None,
        ),
        preferred_name: str = Body(
            default=None,
        ),
        email: str = Body(
            default=None,
        ),
        company_id: str = Body(
            default=None,
        ),
):
    """Update a specific user"""
    with connection.cursor() as cursor:
        updates = SetStatement("first_name", first_name) + \
                  SetStatement("last_name", last_name) + \
                  SetStatement("preferred_name", preferred_name) + \
                  SetStatement("email", email) + \
                  SetStatement("company_id", company_id)

        cursor.execute(f'UPDATE users.app_user {updates} WHERE user_id=%s', \
                       updates.values + [user_id])
        return {"message": "User updated"}


@specific_user.put(
    "",
    status_code=200,
    summary="Edit a user"
)
def replace_user(
        user_id: int = Path(
            default=Required,
            ge=1,
        ),
        first_name: str = Body(
            default=None,
        ),
        last_name: str = Body(
            default=None,
        ),
        preferred_name: str = Body(
            default=None,
        ),
        email: str = Body(
            default=None,
        ),
        company_id: str = Body(
            default=None,
        ),
):
    """Replace a specific user"""
    with connection.cursor() as cursor:
        cursor.execute('UPDATE users.app_user \
            SET first_name=%s, last_name=%s, preferred_name=%s, email=%s, company_id=%s \
             WHERE user_id=%s', [first_name, last_name, preferred_name, email, company_id, user_id])
        return f"Updated user {user_id}"


@specific_user.put(
    '/status',
    status_code=200,
    description="Update a specific user's status",
)
def update_user_status(
        user_id: int = Path(
            default=Required,
            ge=1,
        ),
        status: str = Form(
            default=Required,
            regex="^(active|deactivated)$",
        ),
):
    """Update a specific user's status"""
    with connection.cursor() as cursor:
        cursor.execute('UPDATE users.app_user SET account_status=%s WHERE user_id=%s', \
                       [status, user_id])
        return f"Updated account status for user {user_id}"


@specific_user.get(
    '/status',
    status_code=200,
    description="Get a specific user's status",
)
def get_user_status(
        user_id: int = Path(
            default=Required,
            ge=1,
        ),
):
    """Get a specific user's status"""
    with connection.cursor() as cursor:
        cursor.execute('SELECT account_status FROM users.app_user WHERE user_id=%s', [user_id])
        query = cursor.fetchone()[0]
        return query


@specific_user.get(
    '/settings',
    status_code=200,
    description="Get a specific user's settings",
)
def get_user_settings(
        user_id: int = Path(
            default=Required,
            ge=1,
        ),
):
    """Get a specific user's settings"""
    with connection.cursor() as cursor:
        cursor.execute('SELECT * FROM users.settings WHERE user_id=%s', [user_id])
        query = cursor.fetchone()

        rows = list(query)
        columns = [col[0] for col in cursor.description]
        results = dict(zip(columns, rows))
        results.pop('user_id')
        return results


@specific_user.put(
    '/settings',
    status_code=200,
    description="Update a specific user's settings",
)
def update_user_settings(
        user_id: int = Path(default=Required, ge=1),
        colour: str = Body(
            default=Required,
            regex="^(dark|light|system)$"
        ),
        locale: str = Body(
            default=Required,
            regex="[a-z]{2}-[A-Z]{2}"
        ),
        timezone: str = Body(
            default=Required
        )
):
    """Update a specific user's settings"""
    """
    Review this link: https://stackoverflow.com/questions/61952845/fastapi-single-parameter-body-cause-pydantic-validation-error?rq=1
    """
    with connection.cursor() as cursor:
        cursor.execute('UPDATE users.settings SET colour=%s, language=%s, region=%s WHERE user_id=%s', [colour, locale, timezone, user_id])
        return f"Updated settings for user {user_id}"


@specific_user.get(path="/profile-image", description="Get a users profile image")
def get_user_profile_image(
        user_id: int = Path(default=Required, ge=1)
):
    result = None
    s3 = boto3.client('s3', aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'),
                      aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY'))
    with connection.cursor() as cursor:
        cursor.execute("SELECT image_link FROM users.app_user WHERE user_id = %s", [user_id])
        result = cursor.fetchone()[0]
        if result is None:
            return Response(content="No image use placeholder", media_type="text/plain")
        else:
            dctx = zstandard.ZstdDecompressor()
            img = s3.get_object(Bucket="clientdek-file-storage", Key=result)
            decompressed_file = dctx.decompress(img["Body"].read())
            return Response(content=decompressed_file, media_type="image/jpeg")

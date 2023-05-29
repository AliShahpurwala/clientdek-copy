import os
import uuid
from typing import List

from fastapi import APIRouter, HTTPException, Depends, Query, Form
from jinja2 import Environment, FileSystemLoader
from pydantic import Required, EmailStr
from sendgrid import sendgrid, Email, To, Content, Mail

from utils.settings import connection, redis_connection
from utils.db_tools import ValuesStatement, WhereStatement
from utils.commons import Pagination
from utils.router import ClientdekRoute
from .specific_user import specific_user

users = APIRouter(route_class=ClientdekRoute, 
                  prefix="/users",
                  responses={404: {"Description": "Not found"}},
                  tags=["Users"],
                  )



@users.post(
    "/",
    status_code=201,
    summary="Create a user"
)
def create_user(
        first_name: str = Form(
            default=Required,
        ),
        last_name: str = Form(
            default=Required,
        ),
        preferred_name: str = Form(
            default=None,
        ),
        email: EmailStr = Form(
            default=Required,
        ),
        admin_status: str = Form(
            default="general_user",
            regex="^(admin|general_user)$",
        ),
        company_id: str = Form(
            default=None,
        ),
):
    """Create a new user"""
    # TODO verify email is valid

    with connection.cursor() as cursor:
        cursor.execute('SELECT email FROM users.app_user WHERE email= %s', [email])
        if cursor.fetchone() is not None:
            # This means corresponding email exists
            raise HTTPException(detail="Error: Email already exists", status_code=409)

        values = ValuesStatement("first_name", first_name) + \
                 ValuesStatement("last_name", last_name) + \
                 ValuesStatement("preferred_name", preferred_name) + \
                 ValuesStatement("email", email) + \
                 ValuesStatement("admin_status", admin_status) + \
                 ValuesStatement("company_id", company_id)

        cursor.execute(f'INSERT INTO users.app_user {str(values)} RETURNING user_id',
                       values.values)
        user_id = cursor.fetchone()[0]
        cursor.execute('INSERT INTO users.settings (user_id, colour) VALUES (%s, %s)', [user_id, 'system'])

    redis_key = f"reset_password_{user_id}"
    unique_token = uuid.uuid4()
    redis_connection.set(redis_key, str(unique_token))
    redis_connection.expire(redis_key, 60 * 60 * 24)

    sg_instance = sendgrid.SendGridAPIClient(api_key=os.environ.get('SENDGRID_API_KEY'))
    from_email = Email("noreply@clientdek.com")
    to_email = To(email)
    subject = "New User Password Reset for Clientdek"
    env = Environment(loader=FileSystemLoader('./src/templates'))
    template = env.get_template("new_user_reset_email.html")
    html_template = template.render({"user_id": user_id, "unique_token": unique_token})

    content = Content("text/html", str(html_template))
    mail = Mail(from_email, to_email, subject, content)

    sg_instance.client.mail.send.post(request_body=mail.get())

    return f'Created User {user_id}'


@users.get(
        "/names",
        status_code=200,
        summary="Get the list of user names from a list of ids",
        description="Get user names"
)
def get_user_names(
        ids: List[int] = Query(
            default=None,
            ge=1,
            alias="id",
        ),
):
    """Get a list of user names from a list of ids"""

    where_statement = WhereStatement("user_id in %s", [tuple(ids)])

    with connection.cursor() as cursor:
        cursor.execute(
            'SELECT user_id, first_name, last_name, preferred_name FROM users.app_user' + str(where_statement), 
            where_statement.params)
        rows = cursor.fetchall()
        descriptions = [col[0] for col in cursor.description]
        results = [dict(zip(descriptions, user)) for user in rows]

        if not results:
            return HTTPException(detail={'Warning': 'No users found'}, status_code=204)
        return results  

@users.get(
    "/",
    status_code=200,
    summary="Get the list of users"
)
def get_users(
        pagination: Pagination = Depends(Pagination),
        sort_by: str = Query(
            default="last_name",
            regex="^(last_name|admin_status)$",
        ),
        sort_order: str = Query(
            default="asc",
            regex="^(asc|desc)$",
        ),
        filter_admin: str = Query(
            default=None,
            regex="^(true|false)$",
        ),
        group: list = Query(
            default=None,
        ),
        name: str = Query(
            default=None,
        ),
):
    '''Get a list of users'''
    where_statement = WhereStatement("", [])

    # TODO support more advanced searching
    if name is not None:
        where_statement.append(
            "(concat(first_name, ' ', last_name, preferred_name, ' ', last_name) ILIKE %s)",
            ["%" + name + "%"])

    if filter_admin is not None:
        if filter_admin == "true":
            admin_filter = "admin"
        else:
            admin_filter = "general_user"

        where_statement += WhereStatement("admin_status = %s", admin_filter)
    where_statement += WhereStatement("user_id in ( \
            SELECT user_id \
            FROM groups.user_map \
            WHERE %s = group_id)",
                                      group)

    order = " ORDER BY " + sort_by + " " + sort_order.upper()

    query = 'SELECT * FROM users.app_user' + str(where_statement) + order + ' LIMIT %s OFFSET %s'
    params = where_statement.params
    params += [pagination.page_size, (pagination.page - 1) * pagination.page_size]

    # execute Fquery
    with connection.cursor() as cursor:

        cursor.execute(query, params)

        rows = cursor.fetchall()
        descriptions = [col[0] for col in cursor.description]
        results = [dict(zip(descriptions, user)) for user in rows]

        if not results:
            return HTTPException(detail={'Warning': 'No users found'}, status_code=204)
        return results

users.include_router(specific_user)

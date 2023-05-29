import os
import uuid

import jwt
from fastapi import APIRouter, Form, Body, Depends, Query
from pydantic import Required, EmailStr
from sendgrid import sendgrid, Email, To, Content, Mail
from starlette.responses import JSONResponse
from jinja2 import Template, Environment, FileSystemLoader
from utils.dependencies import request_uid_matches_parameter_uid
from utils.exceptions import APIException
from utils.settings import redis_connection, PASSWORD_RESET_EXPIRY, pool
from utils.router import ClientdekRoute

auth = APIRouter(prefix="",
                 tags=["Authentication"],
                 route_class=ClientdekRoute)


@auth.post(path="/login")
def login(
        email: EmailStr = Form(default=Required),
        pass_hash: str = Form(default=Required)
):
    """
    General Workflow of what will happen:
        1) First check if the cookie already exists
        2) If the cookie exists, then return a custom status
        3) If it doesn't exist, then start checking and setting the cookie
    """
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            # Now we have a cursor object to query the DB
            cursor.execute("SELECT ul.user_id FROM users.login AS ul, users.app_user AS ua \
            WHERE ua.email = %s and ua.user_id = ul.user_id and ul.password = %s", [
                email,
                pass_hash
            ])

            # Now check if anything was returned
            result = cursor.fetchone()
            if result is None:
                # This means the pair provided is not a valid login
                raise APIException(message="Invalid Credentials", error_code=404)

            # If we reach here, that means that the login does exist
            encoded_jwt_token = create_jwt_token(result[0])

            # Now that the token has been created, we can create the response object
            response = JSONResponse(content={'Message': 'Login Success'},
                                    status_code=200)

            response.set_cookie(key='clientdek', value=encoded_jwt_token, expires=3600)
            return response


def create_jwt_token(user_id: int):
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT colour, language, region  FROM users.settings WHERE user_id = %s", [user_id])
            res = cursor.fetchone()
            user_colour = res[0]
            user_locale = res[1]
            user_region = res[2]

            cursor.execute("SELECT admin_status FROM users.app_user WHERE user_id = %s", [user_id])
            user_admin_status = cursor.fetchone()[0]


            jwt_payload = {
                'user_id': user_id,
                'admin_status': user_admin_status,
                'colour': user_colour,
                'locale': user_locale,
                'timezone': user_region}

            # Now that the payload is ready, we can create the token that will be set
            return jwt.encode(jwt_payload, os.environ['DJANGO_SECRET_KEY'], algorithm='HS256')


@auth.get(path="/logout")
def logout():
    response = JSONResponse(content="Logout successful", status_code=200)
    response.delete_cookie(key="clientdek")
    return response


@auth.put(path="/change-password-logged-in",
          dependencies=[Depends(dependency=request_uid_matches_parameter_uid)])
def change_password_logged_in(
        user_id: int = Body(default=Required),
        current_hash: str = Body(default=Required),
        new_hash: str = Body(default=Required),
):
    """
    changePasswordLoggedIn(userID, currentHash, newHash)
    Notes:
        - userID provided as a parameter must match the
          userID present in the JWT
    """

    # Match the currentHash to the saved hash in the DB
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT password FROM users.login WHERE user_id = %s",
                        [user_id])
            current_hash_from_db = cursor.fetchone()
            if current_hash_from_db is None:
                raise APIException("Error retrieving Information", 404)
            current_hash_from_db = current_hash_from_db[0]

    if current_hash_from_db != current_hash:
        raise APIException(message="Current password does not match records.", error_code=403)

    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute('UPDATE users.login SET password = %s WHERE user_id = %s',
                        [new_hash, user_id])
            connection.commit()

    return JSONResponse(content="Password changed", status_code=201)


@auth.post("/reset-password-logged-out")
def reset_password_logged_out(
        email: EmailStr = Form(default=Required)
):
    # Check email exists
    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT user_id FROM users.app_user WHERE email = %s",
                        [email])
            user_id = cursor.fetchone()
            if user_id is None:
                raise APIException(message="Email does not exist", error_code=403)
            user_id = user_id[0]

    redis_key = f"reset_password_{user_id}"

    if redis_connection.get(redis_key) is not None:
        raise APIException(error_code=429, message='Reset password token already issued.')

    unique_token = uuid.uuid4()
    redis_connection.set(redis_key, str(unique_token))
    redis_connection.expire(redis_key, 60 * PASSWORD_RESET_EXPIRY)

    sg_instance = sendgrid.SendGridAPIClient(api_key=os.environ.get('SENDGRID_API_KEY'))
    from_email = Email("noreply@clientdek.com")
    to_email = To(email)
    subject = "Password Reset for Clientdek"
    env = Environment(loader=FileSystemLoader('./src/templates'))
    template = env.get_template("reset_email.html")
    html_template = template.render({"user_id": user_id, "unique_token": unique_token})

    content = Content("text/html", str(html_template))
    mail = Mail(from_email, to_email, subject, content)

    sg_instance.client.mail.send.post(request_body=mail.get())
    return JSONResponse(status_code=201, content={'Message': 'Password reset token set.'})


@auth.post("/change-password-logged-out")
def change_password_logged_out(
        user_id: int = Form(default=Required),
        new_hash: str = Form(default=Required),
        password_reset_token: str = Form(default=Required)
):
    """Changes the password if the user is logged out"""

    users_unique_token = redis_connection.get(f"reset_password_{user_id}")
    if users_unique_token is None:
        raise APIException("No reset password request found", 404)
    if users_unique_token != password_reset_token:
        raise APIException("Invalid Token", 403)

    redis_connection.delete(f"reset_password_{user_id}")

    with pool.connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute("UPDATE users.login SET password = %s WHERE user_id = %s",
                        [new_hash, user_id])
            connection.commit()

    return JSONResponse(status_code=201, content={'Message': 'Password reset properly'})


@auth.get("/verify-reset-password-token", status_code=200)
def verify_reset_password_token(
        user_id: int = Query(default=Required),
        reset_token: str = Query(default=Required)
):
    users_unique_token = redis_connection.get(f"reset_password_{user_id}")
    if users_unique_token is None:
        raise APIException("No reset password request found", 404)
    if users_unique_token != reset_token:
        raise APIException("Invalid token", 403)
    return "Valid token"

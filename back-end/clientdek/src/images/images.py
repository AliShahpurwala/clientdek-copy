import zstandard
from botocore.exceptions import ClientError
from fastapi import APIRouter, Path, Form, File, UploadFile
from pydantic import Required
from starlette.responses import Response
import boto3
import uuid
import os

from utils.settings import connection

BUCKET_NAMES = ['clientdek-file-storage']

CACHEABLE_IMAGES = ['placeholder.jpeg']

images = APIRouter(prefix="/images",
                   tags=["Images"], )


@images.get('/{image_name}', deprecated=True)
def get_image(image_name: str = Path(default=Required)):
    s3 = boto3.client('s3', aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'),
                      aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY'))
    img = s3.get_object(Bucket="clientdek-file-storage", Key=image_name)
    if image_name in CACHEABLE_IMAGES:
        return Response(content=img["Body"],
                        media_type="image/jpeg",
                        headers={"Cache-Control": "max-age=5000, private"})
    return Response(content=img["Body"].read(), media_type="image/jpeg")


@images.post(path="/upload-image", status_code=201, description="Upload a Profile Picture", name="POST Upload Image")
def upload_image(user_id: int = Form(default=Required), image_file: UploadFile = File(default=Required)):
    s3 = boto3.client('s3', aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'),
                      aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY'))
    with connection.cursor() as cursor:
        cursor.execute("SELECT image_link FROM users.app_user WHERE user_id = %s", [user_id])
        res = cursor.fetchone()
        if res[0] is not None:
            s3.delete_object(Bucket="clientdek-file-storage", Key=res[0])
    image_uid = str(uuid.uuid4())
    try:
        cctx = zstandard.ZstdCompressor()
        compressed_file = cctx.compress(image_file.file.read())
        s3.put_object(Body=compressed_file, Bucket="clientdek-file-storage", Key=image_uid)
    except ClientError as e:
        print(e)
        return f"Error occurred in uploading image: {e}"
    with connection.cursor() as cursor:
        cursor.execute("UPDATE users.app_user SET image_link = %s WHERE user_id = %s", [image_uid,
                                                                                        user_id])
    return f"Successfully uploaded image {image_file.filename}"

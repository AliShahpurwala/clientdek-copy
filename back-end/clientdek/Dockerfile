FROM python:3.11-slim-bullseye
RUN apt --yes update && \
    apt --yes install libpq-dev python3-dev gcc

WORKDIR /app
COPY ./requirements.txt .
RUN pip install -r requirements.txt
COPY . .

CMD ["uvicorn", "src.main:app", "--proxy-headers", "--host", "0.0.0.0", "--port", "8080"]

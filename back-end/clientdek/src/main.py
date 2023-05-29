from fastapi import FastAPI
import uvicorn
from starlette.routing import Mount
from utils.settings import pool
from .api import api
import time
app = FastAPI(name="Clientdek",
              description="Clientdek API",
              routes=[
                  Mount("/api", app=api)
              ])

@app.on_event("startup")
def open_pool():
    print("Opening connection pool")
    pool.open()
    print(pool.get_stats())

@app.on_event("shutdown")
def close_pool():
    print(pool.get_stats())
    pool.close()

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)

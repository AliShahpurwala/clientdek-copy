from fastapi import Query
from pydantic import BaseModel, Field


class Pagination():
    """Pagination class for pagination parameters"""
    def __init__(self,
                 page: int = Query(default=1, ge=1),
                 page_size: int = Query(default=10, ge=1, le=100)):
        self.page = page
        self.page_size = page_size

'''Events API Router'''''
from fastapi import APIRouter

from .journals.journals import journals
from .appointments.appointments import appointments
from utils.router import ClientdekRoute

events = APIRouter(route_class=ClientdekRoute, 
                    prefix="/events",
                  responses={404: {"Description": "Not found"}},
                  tags=["Events"],
                  )

events.include_router(journals)
events.include_router(appointments)

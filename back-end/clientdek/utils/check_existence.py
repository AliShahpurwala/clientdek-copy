"""
    This module contains functions that verify the existence of various objects in the database.
    All functions take in an integer or list of integers and return a boolean value.

    Available Functions:
    check_journal_exist(journal_id)
    check_user_exist(user_id)
    check_client_exist(client_id)
    check_group_exist(group_id)

"""


import threading
import queue
from utils.settings import pool
from fastapi import HTTPException


class ExistenceChecker():
    """Checks the existence of various objects in the database."""

    def __run_threads(self, func, args: list):
        """
        Takes a function and a list of arguments and runs the function on each
        argument in a separate thread.
        """
        if args == []:
            return True
        # que = queue.SimpleQueue()
        # for arg in args:
        #     threading.Thread(target=func, args=(arg, que)).start()

        import concurrent.futures
        with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
            future_results = [executor.submit(func, arg) for arg in args]

            for future in concurrent.futures.as_completed(future_results):
                try:
                    actual_res = future.result()
                except Exception as exc:
                    return False
                else:
                    if actual_res: return True
        return False

        # check all items in queue to see if any are True
        # for _ in range(len(args)):
        #     if que.get():
        #         return True
        # return False

    def __sort(self, inputs):
        if inputs is None:
            return []
        if isinstance(inputs, list):
            return inputs
        return [inputs]

    def journal(self, inputs):
        """Checks if a journal id exists in the database."""
        inputs = self.__sort(inputs)
        return self.__run_threads(self.__journal, inputs)

    def __journal(self, journal):
        with pool.connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM events.journal WHERE journal_entry_id = %s", [journal])
                return cursor.fetchone() is not None

    def user(self, inputs):
        """Checks if a user id exists in the database."""
        inputs = self.__sort(inputs)
        return self.__run_threads(self.__user, inputs)

    def __user(self, user):
        with pool.connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM users.app_user WHERE user_id = %s", [user])
                return cursor.fetchone() is not None

    def client(self, inputs):
        """Checks if a client id exists in the database."""
        inputs = self.__sort(inputs)
        return self.__run_threads(self.__client, inputs)

    def __client(self, client):
        with pool.connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM clients.clients WHERE client_id = %s", [client])
                return cursor.fetchone() is not None

    def group(self, inputs):
        """Checks if a group id exists in the database."""
        inputs = self.__sort(inputs)
        return self.__run_threads(self.__group, inputs)

    def __group(self, group):
        with pool.connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM groups.groups WHERE group_id = %s", [group])
                return cursor.fetchone() is not None

    def appointment(self, inputs):
        """Checks if an appointment id exists in the database."""
        inputs = self.__sort(inputs)
        return self.__run_threads(self.__appointment, inputs)

    def __appointment(self, appointment):
        with pool.connection() as connection:
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM events.appointments WHERE appointment_id = %s", [appointment])
                return cursor.fetchone() is not None


def check_journal_exist(journal_id):
    """Checks if a journal id exists in the database."""

    if not ExistenceChecker().journal(journal_id):
        raise HTTPException(status_code=404, detail="Journal entry not found")


def check_user_exist(user_id):
    """Checks if a user id exists in the database."""
    if not ExistenceChecker().user(user_id):
        raise HTTPException(status_code=404, detail="User not found")


def check_client_exist(client_id):
    """Checks if a client id exists in the database."""
    if not ExistenceChecker().client(client_id):
        raise HTTPException(status_code=404, detail="Client not found")


def check_group_exist(group_id):
    """Checks if a group id exists in the database."""
    if not ExistenceChecker().group(group_id):
        raise HTTPException(status_code=404, detail="Group not found")


def check_appointment_exist(appointment_id):
    """Checks if an appointment id exists in the database."""
    if not ExistenceChecker().appointment(appointment_id):
        raise HTTPException(status_code=404, detail="Appointment not found")

class NotLoggedInException(Exception):
    def __init__(self, name: str):
        self.name = name


class APIException(Exception):
    def __init__(self, message: str, error_code: int):
        self.message = message
        self.error_code = error_code



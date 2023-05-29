'''This class has classes and functions that are used to create a DB query statement
and its parameters.'''
from datetime import datetime

class WhereStatement:
    ''' Pass in an an argument name and a value or list of values. To generate a WhereStatement.

        If the value is None the statement will be blank and the params will be empty.

        Can use the string representation of the object to get the statement and params() to get the params.


        To grow the where statement:
            1. Create a WhereStatement object
            2. Use the append() method to add more statements
            3. Use the + operator to add two WhereStatements together   
    '''
    def __init__(self, statement:str, params):
        if params is None:
            self.statement = ""
            self.params = []
        elif isinstance(params, list):
            self.statement = statement
            self.params = params
        elif isinstance(params, str):
            self.statement = statement
            self.params = [params]
        elif isinstance(params, int):
            self.statement = statement
            self.params = [str(params)]
        else:
            raise TypeError("params must be a list or a string")

    def __add__(self, other):
        '''Adds two WhereStatements together. Or adds a string to a WhereStatement.'''
        if isinstance(other, WhereStatement):
            if self.statement != "" and other.statement != "":
                stmt = self.statement + " AND " + other.statement
            elif self.statement == "" and other.statement != "":
                stmt = other.statement
            else:
                stmt = self.statement
            return WhereStatement(stmt, self.params + other.params)

        else:
            raise TypeError("Can only add WhereStatements together")

    def __str__(self) -> str:
        if self.statement != "":
            return " WHERE " + self.statement
        return ""
    def append(self, statement:str, params:list):
        '''Appends a statement to the where statement.'''
        if self.statement == "":
            self.statement += statement
        else:
            self.statement += " AND " + statement
        self.params += params

    @classmethod
    def or_stmt(cls, statement:str, params:list):
        '''Appends a statement to the where statement.'''
        if params is None:
            return cls("",[])
        elif isinstance(params, str):
            return cls(statement, [params])
        elif isinstance(params, list):
            if len(params) == 0:
                return cls("",[])
            or_statement = "("
            for item in range(len(params)):
                if item == len(params)-1:
                    or_statement += statement + ")"
                else:
                    or_statement += statement + " OR "
            return cls(or_statement, params)
        else:
            raise TypeError("params must be a list or a string")


class ValuesStatement:
    '''Used for for the values clause of an insert statement.'''
    def __init__(self, column:str, value):
        if isinstance(value, (int, float, datetime)):
            value = str(value)
        if value is None or column is None or value == [] or column == []:
            self.columns = []
            self.values = []
            return
        elif isinstance(value, list):
            self.values = value
        elif isinstance(value, str):
            self.values = [value]
        else:
            raise TypeError(f"value must be a list or a string but is of type {value.__class__}") 
        if isinstance(column, list):
            self.columns = column
        else:
            self.columns = [column]

    def __add__(self, other):
        if isinstance(other, ValuesStatement):
            return ValuesStatement(self.columns + other.columns, self.values + other.values)
        return self

    def __str__(self) -> str:
        return \
             "(" + ",".join(self.columns) + ") VALUES (" + \
                ",".join(["%s" for _ in self.columns]) + ")"

class SetStatement:
    '''Used for the set clause of an update statement.'''
    def __init__(self, column:str, value):
        if isinstance(value, (int, float, datetime)):
            value = str(value)
        if value is None or column is None or value == [] or column == []:
            self.columns = []
            self.values = []
            return
        elif isinstance(value, list):
            self.values = value
        elif isinstance(value, str):
            self.values = [value]
        else:
            raise TypeError(f"value must be a list or a string but is of type {value.__class__}") 
        if isinstance(column, list):
            self.columns = column
        else:
            self.columns = [column]

    def __add__(self, other):
        if isinstance(other, SetStatement):
            return SetStatement(self.columns + other.columns, self.values + other.values)
        return self

    def __str__(self) -> str:
        return " SET " + ",".join([f"{column}=%s" for column in self.columns])

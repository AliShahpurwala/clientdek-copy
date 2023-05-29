from datetime import date
from typing import List
from pydantic import BaseModel, Field, EmailStr, Required


class Name(BaseModel):
    '''Name of Client'''
    prefix: str = Field(default=None, title="Name Prefix of Client")
    first: str = Field(default=None, title="First Name of Client")
    preferred: str = Field(default=None, title="Preferred Name of Client")
    middle: str = Field(default=None, title="Middle Name of Client")
    last: str = Field(default=None, title="Last Name of Client")
    suffix: str = Field(default=None, title="Name Suffix of Client")

class Email(BaseModel):
    '''Email of Client'''
    type: str = Field(default=None, title="Type of the Email", regex="^(personal|work|other)$")
    email: EmailStr = Field(default=None, title="Email of Client")
    contact_preference: str = Field(default=None, regex="^(no_contact|no_marketing|contact)$")

class Phone(BaseModel):
    '''Phone of Client'''
    type: str = Field(default=None, title="Type of the Phone", regex="^(home|work|mobile|other)$")
    country_code: str = Field(default=None, title="Country Code of Phone")
    phone: str = Field(default=None, title="Phone Number of Client")
    contact_preference: str = Field(default=None, regex="^(no_contact|no_marketing|contact)$")
    
class Contact(BaseModel):
    ''''Contact Information of Client'''
    email: List[Email] = Field(default=None, title="Email of Client")
    phone: List[Phone] = Field(default=None, title="Phone of Client")

class Address(BaseModel):
    '''Address of Client'''
    building_name: str = Field(default=None)
    street_number: str = Field(default=None)
    street_number_suffix: str = Field(default=None)
    street_name: str = Field(default=None)
    street_type: str = Field(default=None)
    street_direction: str = Field(default=None)
    address_type: str = Field(default=None)
    address_type_identifier: str = Field(default=None)
    local_municipality: str = Field(default=None)
    city: str = Field(default=None)
    governing_district: str = Field(default=None)
    postal_code: str = Field(default=None)
    country: str = Field(default=None)

class Demographics(BaseModel):
    '''Demographics of Client'''
    gender: str = Field(default=None, regex="^(Male|Female|Other|Prefer not to say)$")
    date_of_birth: date = Field(default=None, title="Date of Birth of Client")

class ClientCreate(BaseModel):
    '''Client Input Model'''
    name: Name = Field(default=None, title="Name of Client")
    contact: Contact = Field(default=None, title="Contact Information of Client")
    address: Address = Field(default=None, title="Address of Client")
    demographics: Demographics = Field(default=None, title="Demographics of Client")

class Client(BaseModel):
    '''Client Model'''
    status: str = Field(default=None, title="Status of Client")
    name: Name = Field(default=None, title="Name of Client")
    contact: Contact = Field(default=None, title="Contact Information of Client")
    address: Address = Field(default=None, title="Address of Client")
    demographics: Demographics = Field(default=None, title="Demographics of Client")

class ClientPatch(BaseModel):
    first_name: str = Field(default=None, title="First Name of Client")
    last_name: str = Field(default=None, title="Last Name of Client")
    middle_name: str = Field(default=None, title="Middle Name of Client")
    preferred_name: str = Field(default=None, title="Preferred Name of Client")
    name_prefix: str = Field(default=None, title="Name Prefix of Client")
    name_suffix: str = Field(default=None, title="Name Suffix of Client")
    date_of_birth: date = Field(default=None, title="Date of Birth of Client")
    gender: str = Field(default=None, regex="^(Male|Female|Other|Prefer not to say)$")
    street_number: int = Field(default=None)
    street_number_suffix: str = Field(default=None)
    building_name: str = Field(default=None)
    street_name: str = Field(default=None)
    street_direction: str = Field(default=None)
    street_type: str = Field(default=None)
    address_type: str = Field(default=None)
    address_type_identifier: str = Field(default=None)
    local_municipality: str = Field(default=None)
    city: str = Field(default=None)
    governing_district: str = Field(default=None)
    postal_code: str = Field(default=None)
    country: str = Field(default=None)
    phone: int = Field(default=None)
    phone_type: str = Field(default=None, regex="^(home|work|mobile|other)$")


class AddressPut(BaseModel):
    street_number: int = Field(default=None)
    street_number_suffix: str = Field(default=None)
    building_name: str = Field(default=None)
    street_name: str = Field(default=None)
    street_direction: str = Field(default=None)
    street_type: str = Field(default=None)
    address_type: str = Field(default=None)
    address_type_identifier: str = Field(default=None)
    local_municipality: str = Field(default=None)
    city: str = Field(default=None)
    governing_district: str = Field(default=None)
    postal_code: str = Field(default=None)
    country: str = Field(default=None)


class EmailPatch(BaseModel):
    contact_preference: str = Field(default=None)
    new_type: str = Field(default=Required, regex="^(personal|work|other)$")
    new_email: EmailStr = Field(default=Required)


class PhoneIn(BaseModel):
    phone: int = Field(default=None, gt=0, )
    contact_preference: str = Field(default=None, regex="^(no_contact|no_marketing|contact)$")
    country_code: int = Field(default=None, gt=0)
    new_type: str = Field(default=None, regex="^(home|work|mobile|other)$")


class NewPhone(BaseModel):
    phone_number: int = Field(default=Required, gt=0, )
    contact_preference: str = Field(default=None, regex="^(no_contact|no_marketing|contact)$")
    country_code: int = Field(default=None, gt=0)
    phone_type: str = Field(default=Required, regex="^(home|work|mobile|other)$")

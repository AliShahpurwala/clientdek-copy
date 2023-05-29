import random
import string
import requests
import os
import pandas as pd
import datetime
import threading
import multiprocessing
import numpy as np
import gender_guesser.detector as gender
from faker import Faker

  
# api-endpoint
URL = "http://localhost:8000/api/clients/add/"

'''Generates random client data'''
NUM_OF_CLIENTS = 100000

values = ["first_name", "last_name", "middle_name", "preferred_name", "name_prefix", "name_suffix", "date_of_birth", "gender",
              "street_number", "street_number_suffix", "street_name", "building_name", "street_type", "street_direction", "address_type", "address_type_identifier", "city", "governing_district", "postal_code", "country"]

list_values = ["email", "email_type","phone", "phone_type"]

first_names = pd.read_csv(os.path.join(os.path.dirname(__file__), "datasets/first_names.csv"))
last_names = pd.read_csv(os.path.join(os.path.dirname(__file__), "datasets/last_names.csv"))
last_names_sum = last_names["count"].sum()
cities = pd.read_csv(os.path.join(os.path.dirname(__file__), "datasets/cities.csv"))
population_sum = cities["population"].sum()
area_codes = pd.read_csv(os.path.join(os.path.dirname(__file__), "datasets/area_codes.csv"))
street_names = pd.read_csv(os.path.join(os.path.dirname(__file__), "datasets/street_names.csv"))

male_prefix = {"Mr.": 0.92, "Dr.": 0.05, "Prof.": 0.01, "Rev.": 0.01, "Sir": 0.01}
female_prefix = {"Ms.": 0.9, "Miss.": .02, "Mrs.": 0.05, "Dr.": 0.01, "Prof.": 0.01, "Rev.": 0.01, "Lady": 0.01}
name_suffix = {"Jr.": 0.5, "Sr.": 0.41, "II": 0.01, "III": 0.01, "IV": 0.01, "V": 0.01, "VI": 0.01, "VII": 0.01, "VIII": 0.01, "IX": 0.01, "X": 0.01}

building_name_end = ["Place","Plaza","Court","Towers","Square","Center"]


d = gender.Detector()

class Client:
    def __init__(self):
        for attribute in values:
            setattr(self, attribute, None)
        
        for attribute in list_values:
            setattr(self, attribute, [])
    
    def __getitem__(self, key):
        return getattr(self, key)
    
    def keys(self):
        keys = []
        for value in values:
            if getattr(self, value) is not None:
                keys.append(value)
        for value in list_values:
            if len(getattr(self, value)) !=0:
                keys.append(value)
        return keys
    
    def __str__(self):
        string = "{"
        for key in self.keys():
            string += key + ": " + str(self[key]) + ", "
        
        string += "}"
        return string

def odds(probability):
    return np.random.random() < probability

def email_builder(first_name, last_name):
    formats = ["underscore", "dot", "first_initial", "last_initial"]
    format = formats[np.random.randint(len(formats))]
    match format:
        case "underscore":
            string = f"{first_name.lower()}_{last_name.lower()}"
        case "dot":
            string = f"{first_name.lower()}.{last_name.lower()}"
        case "first_initial":
            string = f"{first_name[0].lower()}{last_name.lower()}"
        case "last_initial":
            string = f"{first_name.lower()}{last_name[0].lower()}"
            
    if odds(.9):
        string += str(np.random.randint(100))
        
    return string

def get_area_code(city):
    try:
        area_code = area_codes.loc[area_codes["city"] == city]["area-code"].sample(n=1).iloc[0]
    except:
        area_code = area_codes.sample(n=1).iloc[0]["area-code"]
    
    return str(int(area_code))
def create_client(i,):
    client = Client()
    Faker.seed( np.random.randint(NUM_OF_CLIENTS))
    #set gender
    random_index = np.random.random()
    if random_index < 0.46:
        client.gender = "Male"
    elif random_index < 0.98:
        client.gender = "Female"
    elif random_index < 0.99:
        client.gender = "Other"
    else:
        client.gender = "Prefer not to say"
        
    #use poisson distribution to calculate random date of birth with lambda 2 and mean 1960-01-01
    date_of_birth = datetime.date(1960, 1, 1) + datetime.timedelta(days = np.random.randint(365))
    new_year = 2018
    while new_year > 2017:
        new_year = int(np.random.gamma(6,10) + 1917)
    date_of_birth = datetime.date(new_year, date_of_birth.month, date_of_birth.day)
    client.date_of_birth=  date_of_birth.strftime("%Y-%m-%d")
    
    #select random first name
    names = first_names.loc[first_names["Year"] == new_year].sort_values(by="Frequency", ascending=False)
    while True:
        random_index = np.random.randint(names["Frequency"].sum())
        for index, row in names.iterrows():
            if random_index < row["Frequency"]:
                client.first_name = row["Name"].title()
                break
            random_index -= row["Frequency"]
        if d.get_gender(u'{}'.format(client.first_name)) in ("unkown", "andy",client.gender.lower(),f"mostly_{client.gender.lower()}"):
            break
    
    if odds(0.1):
    #select random middle name
        while True:
            random_index = np.random.randint(names["Frequency"].sum())
            for index, row in names.iterrows():
                if random_index < row["Frequency"]:
                    client.middle_name = row["Name"].title()
                    break
                random_index -= row["Frequency"]
            if d.get_gender(u'{}'.format(client.first_name)) in ("unkown", "andy",client.gender.lower(),f"mostly_{client.gender.lower()}"):
                break
    
    #get random preferred name
    preferred_names = names.head(200)
    if odds(0.01):
           while True:
            random_index = np.random.randint(preferred_names["Frequency"].sum())
            for index, row in preferred_names.iterrows():
                if random_index < row["Frequency"]:
                    client.preferred_name = row["Name"].title()
                    break
                random_index -= row["Frequency"]
            if d.get_gender(u'{}'.format(client.first_name)) in ("unkown", "andy",client.gender.lower(),f"mostly_{client.gender.lower()}"):
                break
            
    #select random last name
    random_index = np.random.randint(last_names_sum)
    for index, row in last_names.iterrows():
        if random_index < row["count"]:
            client.last_name = row["name"].title()
            break
        random_index -= row["count"]
    
    #add name prefix
    if odds(.07):
        random_index = np.random.random()
        if client.gender == "Male":
            for title, frequency in male_prefix.items():
                if frequency +random_index > 1:
                    client.name_prefix = title
                    break
                else:
                    random_index += frequency
        elif client.gender == "Female":
            for title, frequency in female_prefix.items():
                if frequency +random_index > 1:
                    client.name_prefix = title
                    break
                else:
                    random_index += frequency
        #remove odd cases
        match client.name_prefix:
            case "Dr.":
                if new_year > 2000:
                    client.name_prefix = None
            case "Prof.":
                if new_year > 2000:
                    client.name_prefix = None
            case "Rev.":
                if new_year > 2000:
                    client.name_prefix = None
            case "Miss.":
                if new_year < 1992:
                    client.name_prefix = None
            case "Mrs.":
                if new_year > 2000:
                    client.name_prefix = None
    
    #add suffix
    random_index = np.random.random()
    if odds(.01) and client.gender == "Male":
        for title, frequency in name_suffix.items():
            if frequency + random_index > 1:
                client.name_suffix = title
                break
            else:
                random_index += frequency
    
    #add address
    if odds(1):
        
        #assign city
        random_index = np.random.randint(population_sum)
        for index, row in cities.iterrows():
            if random_index < row["population"]:
                client.city = row["city"].title()
                client.governing_district = row["province_id"]
                codes = row["postal"].split(" ")
                final_chars = "".join([random.choice(string.digits),random.choice(string.ascii_uppercase),random.choice(string.digits)])
                client.postal_code = random.choice(codes) +  " " + final_chars
                client.country = "Canada"
                break
            random_index -= row["population"]
        
        #generate street
        client.street_number = np.random.geometric(0.02)
        client.street_name = street_names.sample(n=1).iloc[0]["StreetName"].title()
        client.street_type = str(street_names.sample(n=1).iloc[0]["StreetType"]).title()
        if odds(.1):
            client.street_direction = random.choice(["N","S","E","W"])
        
        if odds(.1):
            client.address_type = random.choice(["Apt","Suite","Unit"])
            client.address_type_identifier = np.random.randint(10,10000)
            
            if odds(.5):
                #first part of the building name is a random last name
                building_name = last_names["name"].sample(n=1).iloc[0].title()
                building_name += " " + random.choice(building_name_end)
                client.building_name = building_name
    
    #building a fake email
    if odds(.9):
        client.email.append(email_builder(client.first_name,client.last_name) + "@" + Faker().free_email_domain())
        client.email_type.append(random.choice(["personal","work","other"]))
        
        if odds(.3):
            client.email.append(email_builder(client.first_name,client.last_name) + "@" + Faker().free_email_domain())

            while True:
                new_type = random.choice(["personal","work","other"])
                if new_type not in client.email_type:
                    client.email_type.append(new_type)
                    break
    
    #building a fake phone number
    
    if odds(.9):
        area_code = get_area_code(client.city)
        area_code += str(np.random.randint(1000000,9999999))
        client.phone = area_code
        client.phone_type.append(random.choice(["home","work","mobile","other"]))
        
        if odds(.1):
            area_code = get_area_code(client.city)
            area_code += str(np.random.randint(1000000,9999999))
            client.phone = area_code
            while True:
                new_type = random.choice(["home","work","mobile","other"])
                if new_type not in client.phone_type:
                    client.phone_type.append(new_type)
                    break
            
            if odds(.05):
                area_code = get_area_code(client.city)
                area_code += str(np.random.randint(1000000,9999999))
                client.phone = area_code
                while True:
                    new_type = random.choice(["home","work","mobile","other"])
                    if new_type not in client.phone_type:
                        client.phone_type.append(new_type)
                        break
    
    if i%100 == 0:
        print(f"Sending {i}")      
    response = requests.post(url = URL, data = dict(client))

    if response.status_code != 201:
        print(response.content)
if __name__ == '__main__':
    pool = multiprocessing.Pool(7)
    pool.map(create_client,range(NUM_OF_CLIENTS))
        

    #odds each are present
    
    #first name- 99.9% of the time
    #last name - 99.9% of the time
    #middle name - if first and last are present and it exists then 10% of the time
    #preferred name - if first and last are present and it exists 90% of the time
    #name prefix - if first and last are present and it exists 90% of the time
    #name suffix - if first and last are present and it exists 90% of the time
    #gender 80% of the time
    #date of birth 60% of the time

    #street number - exponential distribution integer - present 50% of the time along with street name
    #no dataset needed
    
    
    #address type from chosen list - present 10% of the time street name is present
    #no dataset needed
    
    #adddress type identifier from random list - present every time address type is present
    #no dataset needed
    
    
    #email present 70% of the time for 1, 10% of the time for 2 if personal, combination of first and last name 10% of the time else random words + integers + common domains at a certain frequency unless personal name then custom domain with last name at a 5% frquency, if work, combination of first and last name all the time + company domain
    #no dataset needed
    #email type from chosen list - present every time email is present 80% personal 10% work 10% other
    #no dataset needed
    
    #phone number present 80%  for 1 and 90% of the time for 2 of the time matching canadian area codes every time, no country code for now
    #using area code dataset
    #phone number typeis home 30% of the time, work 10% of the time and mobile 60% of the time 
    #no dataset needed
    
import requests
  
# api-endpoint
URL = "http://localhost:8000/login/"
  
  
# defining a params dict for the parameters to be sent to the API
PARAMS = {}
# sending get request and saving the response as response object
r = requests.get(url = URL, params = PARAMS)
  
# extracting data in json format
data = r.json()
  


# printing the output
print(data)
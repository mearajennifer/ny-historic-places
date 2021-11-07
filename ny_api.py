## National Register of Historic Places API

# endpoint: https://data.ny.gov/resource/iisn-hnyv.json
# https://data.seattle.gov/resource/kzjm-xkqj.json?$$app_token=APP_TOKEN
# Resource
# County
# National Register Date
# National Register Number
# Longitude, x
# Latitude, y
# Georeference


# pip install sodapy
# https://pypi.org/project/sodapy/

from sodapy import Socrata
import os
import requests
from pprint import pprint

NY_APP_TOKEN = os.environ["NY_HISTORY_APP_TOKEN"]
LATITUDE =  os.environ["LATITUDE"]
LONGITUDE = os.environ["LONGITUDE"]


payload = {
    "$$app_token": NY_APP_TOKEN,
    "$where": f"within_circle(georeference, {LATITUDE}, {LONGITUDE}, 1000)"
}

res = requests.get('https://data.ny.gov/resource/iisn-hnyv.json',
                   params=payload)
data = res.json()
pprint(data)

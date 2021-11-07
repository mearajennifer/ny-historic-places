"""Use Google Maps to display location of NY Historic places near the user."""

from jinja2 import StrictUndefined
from flask import Flask, render_template, jsonify, request
from flask_debugtoolbar import DebugToolbarExtension

import requests
import googlemaps
import os
from pprint import pprint

from model import connect_to_db, db

app = Flask(__name__)
app.config["SECRET_KEY"] = "Excelsior"
app.jinja_env.undefined = StrictUndefined

#---------------------------------------------------------------------#

NY_APP_TOKEN = os.environ["NY_HISTORY_APP_TOKEN"]
LATITUDE =  os.environ["LATITUDE"]
LONGITUDE = os.environ["LONGITUDE"]
MAPS_API_KEY = os.environ["MAPS_API_KEY"]

#---------------------------------------------------------------------#

@app.route("/")
def view_map():
    """Open map, locate user, display markers."""

    return render_template("index.html", MAPS_API_KEY=MAPS_API_KEY)

@app.route("/api/places", methods=["GET"])
def get_nearby_places():
    """API request for places w/i 5000 meters of the user's position."""

    lat = request.args.get('lat')
    lng = request.args.get('lng')

    places = request_ny_data(lat, lng)

    return jsonify(places)

@app.route("/api/address-search", methods=["GET"])
def get_address_places():
    
    street = request.args.get('street')
    city = request.args.get('city')

    gmaps = googlemaps.Client(key=MAPS_API_KEY)
    geocode_result = gmaps.geocode(f'{street}, {city}, NY')
    coords = geocode_result[0]['geometry']['location']
    formatted_address = geocode_result[0]['formatted_address']

    lat = coords['lat']
    lng = coords['lng']

    places = request_ny_data(lat, lng)
    
    data = {
        'coords': coords,
        'address': formatted_address,
        'places': places
    }

    return jsonify(data)

def request_ny_data(lat, lng):
    """Make request to API with lat/long coords and return list."""
    payload = {
        "$$app_token": NY_APP_TOKEN,
        "$where": f"within_circle(georeference, {lat}, {lng}, 5000)",
        "$limit": 25
    }
    res = requests.get('https://data.ny.gov/resource/iisn-hnyv.json', params=payload)
    places = res.json()

    return(places)


if __name__ == "__main__":
    app.debug = True
    connect_to_db(app)
    # DebugToolbarExtension(app)

    app.run(host="0.0.0.0")

from flask import Flask, Response
from data import get_location_data


app = Flask(__name__)


@app.route("/")
def index():
    return "<p>INF252 Project</p>"


@app.route("/api/map")
def get_map():
    map_data = get_location_data()

    return Response(
            map_data.to_json(orient="records"),
            mimetype="application/json"
    )

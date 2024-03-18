from flask import Flask, Response, render_template
from data import get_location_data


app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/map")
def get_map():
    map_data = get_location_data()

    return Response(
            map_data.to_json(orient="records"),
            mimetype="application/json"
    )

from flask import Flask, Response, render_template, send_file, request
from data import get_location_data


app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/locations")
def locations():
    wing_length = int(request.args.get("wing-length"))
    kipps_distance = int(request.args.get("kipps-distance"))
    map_data = get_location_data(wing_length, kipps_distance)

    return Response(
            map_data.to_json(orient="records"),
            mimetype="application/json"
    )


@app.route("/api/map-topology")
def map_topology():
    return send_file("./static/data/countries-110m.json", mimetype="application/json")

from flask import Flask, Response, render_template
from data import get_location_data


app = Flask(__name__)


@app.route("/")
def index():
    return render_template("gear.html")


@app.route("/api/map")
def get_map():
    map_data = get_location_data()

    return Response(
            map_data.to_json(orient="records"),
            mimetype="application/json"
    )

@app.route("/api/wing")
def get_wings():
    wing_data = get_wing_data()
    return Response(
        wing_data.to_json(orient="records"),
        mimetype="application/json"
    )


@app.route("/api/bird_name")
def get_name():
    name_data = get_bird_name()
    return Response(
        name_data.to_json(orient="records"),
        mimetype="application/json"
    )
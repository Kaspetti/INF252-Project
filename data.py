import pandas as pd


def get_location_data():
    df = pd.read_csv("./static/data/data.csv")
    return df[["Centroid.Longitude", "Centroid.Latitude"]]

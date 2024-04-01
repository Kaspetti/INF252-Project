import pandas as pd


def get_location_data():
    df = pd.read_csv("./static/data/data.csv")
    df = df.rename(columns={"Centroid.Longitude": "Longitude", "Centroid.Latitude": "Latitude"})
    return df[["Longitude", "Latitude"]]

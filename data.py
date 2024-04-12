import pandas as pd


def get_location_data():
    df = pd.read_csv("./static/data/data.csv")
    return df[["Centroid.Longitude", "Centroid.Latitude"]]


def get_wing_data():
    df = pd.read_csv("./static/data/data.csv")
    return df[["Wing.Length", "Kipps.Distance", "Mass", "Secondary1"]]


def get_bird_name():
    df = pd.read_csv("INF252-Project\static\data\data.csv")
    df = df[df['Species1'].str.startswith('A')]
    return df["Species1"].head(10)
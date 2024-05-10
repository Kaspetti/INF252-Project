import pandas as pd


def get_location_data(wing_length, kipps_distance, mass):
    df = pd.read_csv("./static/data/dataCommon.csv")
    interval = 5

    winglength_mask = df['Wing.Length'].between(wing_length - interval, wing_length + interval)
    kipps_mask = df['Kipps.Distance'].between(kipps_distance - interval, kipps_distance + interval)
    mass_mask = df['Mass'].between(mass - interval, mass + interval)

    mask = winglength_mask & kipps_mask & mass_mask

    filtered = df.loc[mask]
    filtered = filtered.rename(columns={
        "Centroid.Longitude": "CentroidLongitude",
        "Centroid.Latitude": "CentroidLatitude",
        "Range.Size": "RangeSize",
        "Species1": "Species",
        "Wing.Length": "WingLength",
        "Kipps.Distance": "KippsDistance",
    })

    return filtered[["CentroidLongitude", "CentroidLatitude", "RangeSize", "Species", "Common Name", "WingLength", "KippsDistance", "Mass"]]


def get_wing_data():
    df = pd.read_csv("./static/data/data.csv")
    return df[["Wing.Length", "Kipps.Distance", "Mass", "Secondary1"]]


def get_bird_name():
    df = pd.read_csv("INF252-Project\static\data\data.csv")
    df = df[df['Species1'].str.startswith('A')]
    return df["Species1"].head(10)

import pandas as pd


def get_location_data(wing_length, kipps_distance):
    df = pd.read_csv("./static/data/data.csv")

    winglength_mask = df['Wing.Length'].between(wing_length - 50, wing_length + 50)
    kipps_mask = df['Kipps.Distance'].between(kipps_distance - 50, kipps_distance + 50)

    mask = winglength_mask & kipps_mask

    filtered = df.loc[mask, ['Centroid.Longitude', 'Centroid.Latitude']]

    filtered = filtered.rename(columns={"Centroid.Longitude": "Longitude", "Centroid.Latitude": "Latitude"})

    return filtered

import pandas as pd


def get_location_data(wing_length, kipps_distance, mass):
    df = pd.read_csv("./static/data/data.csv")

    winglength_mask = df['Wing.Length'].between(wing_length - 50, wing_length + 50)
    kipps_mask = df['Kipps.Distance'].between(kipps_distance - 50, kipps_distance + 50)
    mass_mask = df['Mass'].between(mass - 50, mass + 50)

    mask = winglength_mask & kipps_mask & mass_mask

    filtered = df.loc[mask]
    filtered = filtered.rename(columns={
        "Centroid.Longitude": "CentroidLongitude",
        "Centroid.Latitude": "CentroidLatitude",
        "Range.Size": "RangeSize",
    })

    return filtered[["CentroidLongitude", "CentroidLatitude", "RangeSize"]]

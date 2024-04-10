import pandas as pd


def get_location_data(wing_length, kipps_distance, mass):
    df = pd.read_csv("./static/data/data.csv")

    winglength_mask = df['Wing.Length'].between(wing_length - 10, wing_length + 10)
    kipps_mask = df['Kipps.Distance'].between(kipps_distance - 10, kipps_distance + 10)
    mass_mask = df['Mass'].between(mass - 10, mass + 10)

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

    return filtered[["CentroidLongitude", "CentroidLatitude", "RangeSize", "Species", "WingLength", "KippsDistance", "Mass"]]

/// <reference types="d3" />
/// <reference types="topojson" />

async function showMap() {
  let topology = await d3.json("/api/map-topology")
  console.log(topology)

  let features = topojson.feature(topology, topology.objects.countries).features;
  console.log(features)

  let data = await d3.json("api/locations")
  console.log(data)

  const xAccessor = d => path.projection()([d.Longitude, d.Latitude])[0]
  const yAccessor = d => path.projection()([d.Longitude, d.Latitude])[1]

  const path = d3.geoPath().projection(d3.geoEqualEarth())

  const svg = d3.select("#map")
    .append("svg")
    .attr("width", 1280)
    .attr("height", 720)
    .attr("viewBox", [0, 0, 1280, 720])
    .attr("style", "width: 100%; height: auto; height: intrinsic;");


  // Draw the map
  svg.append("path")
    .datum(topojson.feature(topology, topology.objects.countries))
    .attr("fill", "#fff")
    .attr("stroke", "black")
    .attr("d", path)  

  
  // Draw all centroids on the map
  svg.append("g")
    .attr("fill", "red")
    .attr("fill-opacity", 0.25)
    .selectAll()
    .data(data)
    .join("circle")
    .attr("cx", d => xAccessor(d))
    .attr("cy", d => yAccessor(d))
    .attr("r", 1)
}

showMap();

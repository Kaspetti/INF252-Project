/// <reference types="d3" />
/// <reference types="topojson" />

let wingLengthSlider = document.getElementById("winglength-slider")
let wingLengthLabel = document.getElementById("winglength-label")

let kippsSlider = document.getElementById("kipps-slider")
let kippsLabel = document.getElementById("kipps-label")


let parameters = {
  wingLength: wingLengthSlider.value,
  kippsDistance: kippsSlider.value,
}


// Can use "oninput" but may be slow
wingLengthSlider.onmouseup = function() {
    updatePoints();
}

wingLengthSlider.oninput = function() {
  if (parameters.wingLength != wingLengthSlider.value) {
    parameters.wingLength = wingLengthSlider.value

    wingLengthLabel.innerHTML = `Wing Length: ${parameters.wingLength}`;
  }
}

kippsSlider.onmouseup = function() {
    updatePoints();
}

kippsSlider.oninput = function() {
  if (parameters.kippsDistance != kippsSlider.value) {
    parameters.kippsDistance = kippsSlider.value

    kippsLabel.innerHTML = `Kipps Distance: ${parameters.kippsDistance}`;
  }
}

wingLengthLabel.innerHTML = `Wing Length: ${wingLengthSlider.value}`;
kippsLabel.innerHTML = `Kipps Distance: ${kippsSlider.value}`;


async function initMap() {
  let topology = await d3.json("/api/map-topology")

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

  updatePoints();
}


async function updatePoints() {
  const data = await d3.json(`/api/locations?wing-length=${parameters.wingLength}&kipps-distance=${parameters.kippsDistance}`)

  const svg = d3.select("#map svg")
  const path = d3.geoPath().projection(d3.geoEqualEarth())

  const xAccessor = d => path.projection()([d.CentroidLongitude, d.CentroidLatitude])[0]
  const yAccessor = d => path.projection()([d.CentroidLongitude, d.CentroidLatitude])[1]

  const radiusAccessor = function(d) {
    const earthRadiusKm = 6371;
    const radiusKm = Math.sqrt(d.RangeSize / Math.PI);

    // Get the scale factor for the given latitude
    const scaleFactor = path.projection().scale() * getScaleFactorForLatitude(d.CentroidLatitude);

    return radiusKm * scaleFactor / (2 * Math.PI * earthRadiusKm);
  }

  svg.selectAll("circle").remove();

  svg.append("g")
    .attr("fill", "red")
    .attr("fill-opacity", 0.25)
    .selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", d => xAccessor(d))
    .attr("cy", d => yAccessor(d))
    .attr("r", d => radiusAccessor(d))
}


// Function to calculate the scale factor for a given latitude
// in the Equal Earth projection
function getScaleFactorForLatitude(latitude) {
  const phi = latitude * Math.PI / 180; // Convert latitude to radians
  const scaleFactor = Math.cos(phi / (2 * Math.sqrt(2))) / Math.sqrt(2);
  return scaleFactor;
}

initMap();


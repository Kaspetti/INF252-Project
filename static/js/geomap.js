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

  const xAccessor = d => path.projection()([d.Longitude, d.Latitude])[0]
  const yAccessor = d => path.projection()([d.Longitude, d.Latitude])[1]

  svg.selectAll("circle").remove();

  svg.append("g")
    .attr("fill", "red")
    .attr("fill-opacity", 0.25)
    .selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", d => xAccessor(d))
    .attr("cy", d => yAccessor(d))
    .attr("r", 2)
}

initMap();


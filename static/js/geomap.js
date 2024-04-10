/// <reference types="topojson" />
/// <reference types="d3" />

let wingLengthInput = document.getElementById("winglength-input")
let kippsInput = document.getElementById("kipps-input")
let massInput = document.getElementById("mass-input")

const path = d3.geoPath().projection(d3.geoEqualEarth())


let parameters = {
  wingLength: wingLengthInput.value,
  kippsDistance: kippsInput.value,
  mass: massInput.value,
}


wingLengthInput.oninput = function() {
  const inputValue = wingLengthInput.value

  if (parameters.wingLength != inputValue && inputValue !== "") {
    parameters.wingLength = inputValue

    updatePoints()
  }
}


kippsInput.oninput = function() {
  const inputValue = kippsInput.value

  if (parameters.kippsDistance != inputValue && inputValue !== "") {
    parameters.kippsDistance = inputValue

    updatePoints();
  }
}


massInput.oninput = function() {
  const inputValue = massInput.value

  if (parameters.mass != inputValue && inputValue !== "") {
    parameters.mass = inputValue

    updatePoints();
  }
}


async function initMap() {
  let topology = await d3.json("/api/map-topology")

  const svg = d3.select("#map")
    .append("svg")
    .attr("width", 1280)
    .attr("height", 720)
    .attr("viewBox", [0, 0, 1280, 720])
    .attr("style", "width: 100%; height: auto; height: intrinsic;");


  // Draw the map
  svg.append("path")
    .datum(topojson.feature(topology, topology.objects.countries))
    .attr("fill", "#ddd")
    .attr("stroke", "black")
    .attr("d", path)  

  updatePoints();
}


async function updatePoints() {
  const data = await d3.json(`/api/locations?wing-length=${parameters.wingLength}&kipps-distance=${parameters.kippsDistance}&mass=${parameters.mass}`)

  const svg = d3.select("#map svg")

  const xAccessor = d => path.projection()([d.CentroidLongitude, d.CentroidLatitude])[0]
  const yAccessor = d => path.projection()([d.CentroidLongitude, d.CentroidLatitude])[1]

  const radiusAccessor = function(d) {
    //const earthRadiusKm = 6371;

    //// Get the scale factor for the given latitude
    //const scaleFactor = path.projection().scale() * getScaleFactorForLatitude(d.CentroidLatitude);

    const radiusKm = Math.sqrt(d.RangeSize / Math.PI);

    const latDist = 111;
    const x = path.projection()([d.CentroidLongitude, d.CentroidLatitude])[0]
    const y = path.projection()([d.CentroidLongitude, d.CentroidLatitude])[1]
    const newX = path.projection()([d.CentroidLongitude, d.CentroidLatitude + 1])[0]
    const newY = path.projection()([d.CentroidLongitude, d.CentroidLatitude + 1])[1]

    const kmInPx = Math.sqrt(Math.pow(x - newX, 2) + Math.pow(y - newY, 2)) / latDist
    return radiusKm * kmInPx;


    //return radiusKm * scaleFactor / (2 * Math.PI * earthRadiusKm);
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

  svg.selectAll("circle")
    .on("mouseenter", onMouseEnter)
    .on("mouseleave", onMouseLeave)

  const tooltip = d3.select("#tooltip")

  function onMouseEnter(e, d) {
    tooltip.html(`
      Species: ${d.Species}<br>
      Wing Length: ${d.WingLength}<br>
      Kipps Distance: ${d.KippsDistance}<br>
      Mass: ${d.Mass}<br>
      Range Size (DEBUG): ${d.RangeSize}
    `)

    // move tooltip to dot position, with % shift so is centered, not top-left positioned
    tooltip.style("transform", `translate(${e.clientX}px, ${e.clientY}px)`)

    tooltip.style("opacity", 1)   
  }

  function onMouseLeave() {
    tooltip.style("opacity", 0)

  }
}


// Function to calculate the scale factor for a given latitude
// in the Equal Earth projection
function getScaleFactorForLatitude(latitude) {
  const phi = latitude * Math.PI / 180;
  return Math.cos(phi / (2 * Math.sqrt(2))) / Math.sqrt(2);
}

initMap();


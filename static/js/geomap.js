/// <reference types="topojson" />
/// <reference types="d3" />

let wingLengthInput = document.getElementById("winglength-input")
let kippsInput = document.getElementById("kipps-input")
let massInput = document.getElementById("mass-input")

const path = d3.geoPath().projection(d3.geoEqualEarth())

const hexCharacters = [0,1,2,3,4,5,6,7,8,9,"A","B","C","D","E","F"]

const colors = [
  "#fcfe04",
  "#fc9a04",
  "#fc6605",
  "#fc3204",
  "#cc0204",
  "#9c0264",
  "#640264",
  "#040364",
  "#04319c",
  "#022928",
  "#309705",
  "#65cb0b",
]

let focused = false

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


async function initMap() {
  let topology = await d3.json("/api/map-topology")

  const svg = d3.select("#geomap")
    .append("svg")
     .attr("width", 1280)
     .attr("height", 720)
     .attr("viewBox", [0, 0, 1280, 720])
    .attr("style", "width: 100%; height: auto; height: intrinsic;")


  // Draw the map
  svg.append("path")
    .datum(topojson.feature(topology, topology.objects.countries))
    .attr("fill", "#eee")
    .attr("stroke", "grey")
    .attr("d", path)  
    .on("click", onMapClick)

  svg.append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", "transparent")
    .on("click", onMapClick)

  function onMapClick() {
    focused = false

    svg.selectAll("circle").remove();

    const areas = document.getElementsByClassName("area")
    for (let i = 0; i < areas.length; i++) {
      areas[i].setAttribute("fill-opacity", 0.75)
    }
  }

  updatePoints();
}


async function updatePoints() {
  let data = await d3.json(`/api/locations?wing-length=${parameters.wingLength}&kipps-distance=${parameters.kippsDistance}&mass=${parameters.mass}`)

  const svg = d3.select("#geomap svg")

  // Cluster all overlapping circles
  let clusters = []
  let hulls = []
  const resolution = 2

  while (data.length > 0) {
    let p = data.pop()
    clusters.push([p])
    let points = generateCircleOutlinePoints(p, resolution)

    for (let i = 0; i < clusters[clusters.length - 1].length; i++) {
      const d1 = clusters[clusters.length - 1][i]
      const d1x = xAccessor(d1)
      const d1y = yAccessor(d1)
      const d1r = radiusAccessor(d1)

      let added = []
      data.forEach(d2 => {
        const d2x = xAccessor(d2)
        const d2y = yAccessor(d2)
        const d2r = radiusAccessor(d2)

        const maxDistSqrd = (d1r + d2r)*(d1r + d2r)

        if (Math.pow(d1x - d2x, 2) + Math.pow(d1y - d2y, 2) < maxDistSqrd) {
          clusters[clusters.length - 1].push(d2)
          added.push(d2)

          points = points.concat(generateCircleOutlinePoints(d2, resolution))
        }
      })

      data = data.filter(d => !added.includes(d))
    }

    hulls.push(hull(points))
  }

  svg.selectAll("circle").remove();
  svg.selectAll("path.area").remove();

  const lineGenerator = d3.line()
    .x(d => d[0])
    .y(d => d[1])
    .curve(d3.curveCatmullRom)

  hulls.forEach((h, i) => {
    svg.append("path")
      .attr("class", "area")
      .attr("fill", colors[i % colors.length])
      .attr("circle_fill", colors[(i + colors.length / 2) % colors.length])
      .attr("fill-opacity", 0.5)
      .attr("d", lineGenerator(h))
      .attr("path-id", i)
  })

  svg.selectAll("path.area")
    .on("mouseenter", onMouseEnter)
    .on("mouseleave", onMouseLeave)
    .on("click", onMouseClick)

  function onMouseEnter(e) {
    if (focused) {
      return
    }

    const areas = document.getElementsByClassName("area")
    for (let i = 0; i < areas.length; i++) {
      const area = areas[i]
      if (area.getAttribute("path-id") != e.target.getAttribute("path-id")) {
        area.setAttribute("fill-opacity", 0.1)
      }
    }

    e.target.setAttribute("fill-opacity", 1)
  }

  function onMouseLeave(e) {
    if (focused) {
      return
    }

    const areas = document.getElementsByClassName("area")
    for (let i = 0; i < areas.length; i++) {
      areas[i].setAttribute("fill-opacity", 0.75)
    }
  }

  function onMouseClick(e) {
    const areas = document.getElementsByClassName("area")
    for (let i = 0; i < areas.length; i++) {
      const area = areas[i]
      if (area.getAttribute("path-id") != e.target.getAttribute("path-id")) {
        area.setAttribute("fill-opacity", 0.1)
      }
    }

    e.target.setAttribute("fill-opacity", 1)

    focused = true
    svg.selectAll("circle").remove();
    const cluster = clusters[parseInt(e.target.getAttribute("path-id"))]

    svg.append("g")
      .attr("fill", e.target.getAttribute("circle_fill"))
      .attr("fill-opacity", 0.5)
      .selectAll("circle")
      .data(cluster)
      .join("circle")
      .attr("cx", d => xAccessor(d))
      .attr("cy", d => yAccessor(d))
      .attr("r", d => radiusAccessor(d))
  }
}


// Function to calculate the scale factor for a given latitude
// in the Equal Earth projection
function getScaleFactorForLatitude(latitude) {
  const phi = latitude * Math.PI / 180;
  return Math.cos(phi / (2 * Math.sqrt(2))) / Math.sqrt(2);
}


function getCharacter(index) {
  return hexCharacters[index]
}


function generateCircleOutlinePoints(circle, resolution) {
  let angle = 0.0
  const points = []

  const cx = xAccessor(circle)
  const cy = yAccessor(circle)
  const cr = radiusAccessor(circle)

  const circumfrence = 2 * Math.PI * cr
  const numPoints = circumfrence / resolution
  const step = 2*Math.PI / numPoints

  while(angle < 2*Math.PI) {
    const px = cx + cr * Math.cos(angle)
    const py = cy + cr * Math.sin(angle)

    points.push([px, py])
    angle += step
  }

  return points
}


initMap();


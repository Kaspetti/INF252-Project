/// <reference types="topojson" />
/// <reference types="d3" />

let wingLengthInput = document.getElementById("winglength-input")
let kippsInput = document.getElementById("kipps-input")
let massInput = document.getElementById("mass-input")

const path = d3.geoPath().projection(d3.geoEqualEarth())

const hexCharacters = [0,1,2,3,4,5,6,7,8,9,"A","B","C","D","E","F"]

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
    .attr("fill", "#eee")
    .attr("stroke", "grey")
    .attr("d", path)  

  updatePoints();
}


async function updatePoints() {
  let data = await d3.json(`/api/locations?wing-length=${parameters.wingLength}&kipps-distance=${parameters.kippsDistance}&mass=${parameters.mass}`)

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

  // Cluster all overlapping circles
  let clusters = []
  while (data.length > 0) {
    clusters.push([data.pop()])

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
        }
      })

      data = data.filter(d => !added.includes(d))
    }
  }

  let outlines = []
  let hulls = []
  let resolution = 10

  clusters.forEach(c => {
    let outline = []
    c.forEach(c1 => {
      let angle = 0.0

      const cx = xAccessor(c1)
      const cy = yAccessor(c1)
      const radius = radiusAccessor(c1)

      let circumfrence = 2 * Math.PI * radius
      let numPoints = circumfrence / resolution
      let step = 2*Math.PI / numPoints

      while(angle < 2*Math.PI) {
        const px = cx + radius * Math.cos(angle)
        const py = cy + radius * Math.sin(angle)

        outline.push([px, py])

        angle += step
      }
    })

    let outlineHull = hull(outline)
    
    outlines.push(outline)
    hulls.push(outlineHull)
  })

  svg.selectAll("circle").remove();
  svg.selectAll("path.area").remove();

  const lineGenerator = d3.line()
    .x(d => d[0])
    .y(d => d[1])
    .curve(d3.curveCatmullRom)

  //outlines.forEach(a => {
  //  svg.append("g")
  //    .attr("fill", "blue")
  //    .attr("fill-opacity", 1)
  //    .selectAll("circle")
  //    .data(a)
  //    .join("circle")
  //    .attr("cx", d => d[0])
  //    .attr("cy", d => d[1])
  //    .attr("r", 2)
  //})

  hulls.forEach(h => {
    svg.append("path")
      .attr("class", "area")
      .attr("fill", generateNewColor())
      .attr("fill-opacity", 0.5)
      .attr("d", lineGenerator(h))
  })

  svg.selectAll("circle")
    .on("mouseenter", onMouseEnter)
    .on("mouseleave", onMouseLeave)

  const tooltip = d3.select("#tooltip")

  function onMouseEnter(e, d) {
    tooltip.html(`
      Species: ${d.Species}<br>
      Wing Length: ${d.WingLength}<br>
      Kipps Distance: ${d.KippsDistance}<br>
      Mass: ${d.Mass}
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


function getCharacter(index) {
  return hexCharacters[index]
}

// https://www.freecodecamp.org/news/generate-colors-in-javascript/
function generateNewColor() {
  let hexColorRep = "#"

  for (let index = 0; index < 6; index++){
    const randomPosition = Math.floor ( Math.random() * hexCharacters.length ) 
    hexColorRep += getCharacter( randomPosition )
  }

  return hexColorRep
}

initMap();


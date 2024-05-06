/// <reference types="d3" />

let container = d3.select("#scroll")
let graphic = container.select(".scroll_graphic")
let chart = graphic.select(".chart")
let text = container.select(".scroll_text")
let step = text.selectAll(".step")


let scroller = scrollama()


function handleResize() {
  let stepHeight = Math.floor(window.innerHeight * 0.75)
  step.style("height", stepHeight + "px")
  
  let bodyWidth = d3.select("body").node().offsetWidth;

  graphic.style("height", window.innerHeight + "px")

  let chartMargin = 32;
  let textWidth = text.node().offsetWidth
  let chartWidth = graphic.node().offsetWidth - textWidth - chartMargin
  let chartHeight = Math.floor(window.innerHeight / 2)

  chart
    .style("width", chartWidth + "px")
    .style("height", chartHeight + "px")

  scroller.resize()
}


function handleStepEnter(response) {
  step.classed("is-active", function (d, i) {
    return i === response.index
  })

  let stepData = step.attr("data-step")
}


function handleContainerEnter(response) {
  graphic.classed("is-fixed", true)
  graphic.classed("is-bottom", false)
}


function handleContainerExit(response) {
  graphic.classed("is-fixed", false)
  graphic.classed("is-bottom", response.direction === "down")
}


function init() {
  handleResize()

  scroller
    .setup({
      container: "#scroll",
      graphic: ".scroll_graphic",
      text: ".scroll_text",
      step: ".scroll_text.step",
      offset: 0.5,
      debug: true,
    })
    .onStepEnter(handleStepEnter)
    .onContainerEnter(handleContainerEnter)
    .onContainerExit(handleContainerExit)

  window.addEventListener("resize", handleResize)
}


init()

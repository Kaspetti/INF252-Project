/// <reference types="d3" />

let container = d3.select('#scroll');
let graphic = container.select('.scroll__graphic');
let chart = graphic.select('.chart');
let text = container.select('.scroll__text');
let step = text.selectAll('.step');

function onStepEnter(response) {
	step.classed('is-active', function (d, i) {
		return i === response.index;
  })
}


function resize() {
	// 1. update height of step elements for breathing room between steps
	let stepHeight = Math.floor(window.innerHeight * 0.75);
	step.style('height', stepHeight + 'px');

	// 2. update height of graphic element
	let bodyWidth = d3.select('body').node().offsetWidth;

	graphic
		.style('height', window.innerHeight + 'px');

	// 3. update width of chart by subtracting from text width
	let chartMargin = 32;
	let textWidth = text.node().offsetWidth;
	let chartWidth = graphic.node().offsetWidth - textWidth - chartMargin;
	// make the height 1/2 of viewport
	let chartHeight = Math.floor(window.innerHeight / 2);

	chart
		.style('width', chartWidth + 'px')
		.style('height', chartHeight + 'px');

	// 4. tell scrollama to update new element dimensions
	scroller.resize();
}


function init() {
  const scroller = scrollama();

  scroller
    .setup({
      container: "#scroll",
      graphic: ".scroll_graphic",
      text: ".scroll_text",
      step: ".scroll_text .step",
      offset: 0.5,
      debug: true,
    })
    .onStepEnter(onStepEnter)
    .resize(resize)
}

init()

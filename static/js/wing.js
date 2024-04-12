//import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
/**
async function drawChart() {
 
    const dataset = await d3.json("/api/data");

    // set up accessor functions 

    const x = Math.sin(2 * Math.PI / 3);
    const y = Math.cos(2 * Math.PI / 3);


    // set dimensions of chart - include size of wrapper

    let dimensions = {
        width: window.innerWidth * 0.8,
        height: window.innerHeight * 0.7,
        margin: {
            top: 15,
            right: 15,
            bottom: 40,
            left: 60
        }
    }

    dimensions.boundedWidth = dimensions.width
        - dimensions.margin.left
        - dimensions.margin.right

    dimensions.boundedHeight = dimensions.height
        - dimensions.margin.top
        - dimensions.margin.bottom


    const wrapper = d3.select("#wrapper")
        .append("svg")
        .attr("width", dimensions.width)
        .attr("height", dimensions.height)

    const bounds = wrapper.append("g")
        .style("transform", `translate(${dimensions.margin.left
            }px, ${dimensions.margin.top
            }px)`)
    
    const path = frame.selectAll().data([
            { fill: "#c6dbef", teeth: 80, radius: -0.5, origin: [0, 0], annulus: true },
            { fill: "#6baed6", teeth: 16, radius: +0.1, origin: [0, 0] },
            { fill: "#9ecae1", teeth: 32, radius: -0.2, origin: [0, -0.3] },
            { fill: "#9ecae1", teeth: 32, radius: -0.2, origin: [-0.3 * x, -0.3 * y] },
            { fill: "#9ecae1", teeth: 32, radius: -0.2, origin: [0.3 * x, -0.3 * y] }
        ])
        .join("path")
        .attr("fill", d => d.fill)
        .attr("d", d => gear({ ...d, toothRadius: 0.008, holeRadius: 0.02 }));

    return Object.assign(svg.node(), {
        update({ angle, frameAngle }) {
            path.attr("transform", d => `translate(${d.origin}) rotate(${(angle / d.radius) % 360})`);
            frame.attr("transform", `rotate(${frameAngle % 360})`);
        }
    });
}
 */
 


function graphic (){
    const x = Math.sin(2 * Math.PI / 3);
    const y = Math.cos(2 * Math.PI / 3);


    const svg = d3.select("#gears")
        .append("svg")
        .attr("width", 320)
        .attr("viewBox", [-0.53, -0.53, 1.06, 1.06])
        .attr("stroke", "black")
        .attr("stroke-width", 1 / 640)
        .attr("style", "max-width: 100%; height: auto;");

    const frame = svg.append("g");

    const path = frame.selectAll()
        .data([
            { fill: "#c6dbef", teeth: 80, radius: -0.5, origin: [0, 0], annulus: true },
            { fill: "#6baed6", teeth: 16, radius: +0.1, origin: [0, 0] },
            { fill: "#9ecae1", teeth: 32, radius: -0.2, origin: [0, -0.3] },
            { fill: "#9ecae1", teeth: 32, radius: -0.2, origin: [-0.3 * x, -0.3 * y] },
            { fill: "#9ecae1", teeth: 32, radius: -0.2, origin: [0.3 * x, -0.3 * y] }
        ])
        .join("path")
        .attr("fill", d => d.fill)
        .attr("d", d => gear({ ...d, toothRadius: 0.008, holeRadius: 0.02 }));

    Object.assign(svg.node(), {
        update({ angle, frameAngle }) {
            path.attr("transform", d => `translate(${d.origin}) rotate(${(angle / d.radius) % 360})`);
            frame.attr("transform", `rotate(${frameAngle % 360})`);
        }
    });
}
graphic()

function update() {
    const speed = 0.08;
    let angle = 0;
    let frameAngle = 0;
    while(true) {
        graphic.update({ angle, frameAngle });
        yield;
        angle += speed;
        frameAngle += speed / frameRadius;
    }
} 

function gear({ teeth, radius, annulus, toothRadius, holeRadius }) {
    const n = teeth;
    let r2 = Math.abs(radius);
    let r0 = r2 - toothRadius;
    let r1 = r2 + toothRadius;
    let r3 = holeRadius;
    if (annulus) r3 = r0, r0 = r1, r1 = r3, r3 = r2 + toothRadius * 3;
    const da = Math.PI / n;
    let a0 = -Math.PI / 2 + (annulus ? Math.PI / n : 0);
    const path = ["M", r0 * Math.cos(a0), ",", r0 * Math.sin(a0)];
    let i = -1;
    while (++i < n) {
        path.push(
            "A", r0, ",", r0, " 0 0,1 ", r0 * Math.cos(a0 += da), ",", r0 * Math.sin(a0),
            "L", r2 * Math.cos(a0), ",", r2 * Math.sin(a0),
            "L", r1 * Math.cos(a0 += da / 3), ",", r1 * Math.sin(a0),
            "A", r1, ",", r1, " 0 0,1 ", r1 * Math.cos(a0 += da / 3), ",", r1 * Math.sin(a0),
            "L", r2 * Math.cos(a0 += da / 3), ",", r2 * Math.sin(a0),
            "L", r0 * Math.cos(a0), ",", r0 * Math.sin(a0)
        );
    }
    path.push("M0,", -r3, "A", r3, ",", r3, " 0 0,0 0,", r3, "A", r3, ",", r3, " 0 0,0 0,", -r3, "Z");
    return path.join("");
}


//drawChart()

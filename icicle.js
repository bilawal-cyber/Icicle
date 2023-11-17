import * as d3 from "d3";
import data from './data.json'

const chart = () => {
    // Specify the chart’s dimensions.
    const width = 928;
    const height = 1200;

    // Create the color scale.
    const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1));

    // Compute the layout.
    const hierarchy = d3.hierarchy(data)
        .sum(d => d.value)
        //.sort((a, b) => b.height - a.height || b.value - a.value);
    const root = d3.partition()
        .size([height, (hierarchy.height + 1) * width / 3])
        (hierarchy);


    // Create the SVG container.
    const svg = d3.create("svg")
        .attr("viewBox", [0, 0, width, height])
        .attr("width", width)
        .attr("height", height)
        .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

    // Append cells.
    const cell = svg
        .selectAll("g")
        .data(root.descendants())
        .join("g")
        .attr("transform", d => `translate(${d.y0},${d.x0})`);

    const rect = cell.append("rect")
        .attr("width", d => d.y1 - d.y0 - 1)
        .attr("height", d => rectHeight(d))
        .attr("fill-opacity", 0.6)
        .attr("fill", d => {
            if (!d.depth) return "#ccc";
            while (d.depth > 1) d = d.parent;
            return color(d.data.name);
        })
        .style("cursor", "pointer")
        .on("click", clicked);

    const text = cell.append("text")
        .style("user-select", "none")
        .attr("pointer-events", "none")
        .attr("x", 4)
        .attr("y", 13)
        .attr("fill-opacity", d => +labelVisible(d));

    text.append("tspan")
        .text(d => d.data.name);

    // Add an image to each cell
    const image  = cell.append("image")
        .attr("xlink:href", "/fileV.jpg") // Change the path to your image
        .attr("width", 100)  // Adjust the width of the image
        .attr("height", 100)  // Adjust the height of the image
        .attr("x",20)
        .attr("y",300)
        .classed("img", true);
    //
    // Add a text area to each cell
    const textarea = cell.append("foreignObject")
        .attr("width", 500)  // Adjust the width of the text area
        .attr("height", 100)  // Adjust the height of the text area
        .attr("x",20)
        .attr("y",1200/2)
        .append("xhtml:textarea")
        .on("blur", function(event, d) {
            // Add your onblur logic here
            console.log("Textarea blur event:", d.data.name, "value", event.target.value);
        });

    console.log(cell._parents)

    // Add a div to each cell
    // const div = cell.append("foreignObject")
    //     .attr("width", 100)  // Adjust the width of the div
    //     .attr("height", 200)  // Adjust the height of the div
    //     .attr("x",20)
    //     .attr("y",500)
    //     .append("xhtml:div")
    //     .classed("cellDiv", true);  // Add a class to the div

    // ... (existing code)



    const format = d3.format(",d");
    const tspan = text.append("tspan")
        .attr("fill-opacity", d => labelVisible(d) * 0.7)
        .text(d => ` ${d.value}`);

    cell.append("title")
        .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${d.value}`);

    // On click, change the focus and transitions it into view.
    let focus = root;
    function clicked(event, p) {
    focus = focus === p ? p = p.parent : p;

    root.each(d => d.target = {
        x0: (d.x0 - p.x0) / (p.x1 - p.x0) * height,
        x1: (d.x1 - p.x0) / (p.x1 - p.x0) * height,
        y0: d.y0 - p.y0,
        y1: d.y1 - p.y0
    });

    const t = cell.transition().duration(750)
        .attr("transform", d => `translate(${d.target.y0},${d.target.x0})`);

    rect.transition(t).attr("height", d => rectHeight(d.target));
    text.transition(t).attr("fill-opacity", d => +labelVisible(d.target));
    tspan.transition(t).attr("fill-opacity", d => labelVisible(d.target) * 0.7);
}

function rectHeight(d) {
    return d.x1 - d.x0 - Math.min(1, (d.x1 - d.x0) / 2);
}

function labelVisible(d) {
    return d.y1 <= width && d.y0 >= 0 && d.x1 - d.x0 > 16;
}

return svg.node();
}

const chartContainer = document.getElementById('chart-container');
const svg = chart();
chartContainer.appendChild(svg);
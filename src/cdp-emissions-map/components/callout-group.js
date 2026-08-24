export function setupCallouts(calloutsGroup, data, abbr, centroid){
	calloutsGroup.append("line")
	.attr("class", "state-callout-line")
	.attr("x1", centroid[0])
	.attr("y1", centroid[1])
	.attr("x2", data.pillX - 18)
	.attr("y2", data.pillY);

	console.log(data);

	var fontSize = 20;
	var pillWidth = 100;
	var pillHeight = 60;

	// Draw interactive pill group
	const pill = calloutsGroup.append("g")
	.datum(data)
	.attr("class", "state-callout-pill")
	.attr("transform", `translate(${data.pillX}, ${data.pillY})`)

	pill.append("rect")
	.attr("rx", 0)
	.attr("ry", 0)
	.attr("x", -pillWidth * .5)
	.attr("y", -pillHeight * 1.5)
	// .attr("width", pillWidth)
	// .attr("height", pillHeight)
	.attr("class", "state-callout-bg")
	.attr("id", "state-callout-bg-" + data.abbr);


	pill.append("text")
	.text(data.name)
	.attr("text-anchor", "middle")
	.attr("font-size", `${fontSize}px`)
	.attr("dy", "4")
	.attr("class", "state-callout-text")
	.attr("id", "state-callout-text-" + data.abbr);

	let textBox = document.querySelector("#state-callout-text-" + data.abbr);
	let svg = document.querySelector("svg");
	let rect = document.querySelector("#state-callout-bg-" + data.abbr);
	let box = textBox.getBBox();
	let endX = box.width + 5 * 2 | 0;
	let endY = box.height + 5 * 2 | 0;


	rect.setAttribute("width", endX);
	rect.setAttribute("height", endY);
	rect.style = "fill:none;stroke-width:0;stroke:rgb(0,0,0)";

	makeBG(textBox);

	//return pill to hook up with external events
	return pill; 
}

export function setupPillInteraction(pill, feature, statesGroup, zoomToState, stateHover, exitStateHover){
	pill.on("click", (event, data) => {
		event.stopPropagation();
		zoomToState(feature, data.abbr);
	})
	.on("mouseover", (data) => {
		stateHover(statesGroup, data.abbr)
	})
	.on("mouseout", () => {
		exitStateHover(statesGroup);
	});
}

export function showCallouts(calloutsGroup){
	calloutsGroup
		.transition()
		.duration(400)
		.style("opacity", 1)
		.style("pointer-events", "auto");

}

export function hideCallouts(calloutsGroup){
	calloutsGroup
		.transition()
		.duration(200)
		.style("opacity", 0)
		.style("pointer-events", "none");
}

export function resetCallouts(calloutsGroup){
	calloutsGroup
		.selectAll(".state-callout-pill")
		.classed("active", false);
}

function makeBG(elem) {
  var svgns = "http://www.w3.org/2000/svg"
  var bounds = elem.getBBox()
  var bg = document.createElementNS(svgns, "rect")
  var style = getComputedStyle(elem)
  var padding_top = parseInt(style["padding-top"]);
  var padding_left = parseInt(style["padding-left"]);
  var padding_right = parseInt(style["padding-right"]);
  var padding_bottom = parseInt(style["padding-bottom"]);
  bg.setAttribute("x", bounds.x - parseInt(style["padding-left"]))
  bg.setAttribute("y", bounds.y - parseInt(style["padding-top"]) )
  bg.setAttribute("width", bounds.width + padding_left + padding_right)
  bg.setAttribute("height", bounds.height + padding_top + padding_bottom)
  bg.setAttribute("fill", style["background-color"])
  bg.setAttribute("vector-effect", "non-scaling-stroke")
  bg.setAttribute("rx", parseInt(style["border-radius"]))
  bg.setAttribute("stroke-width", style["border-top-width"])
  bg.setAttribute("stroke", style["border-top-color"])
  if (elem.hasAttribute("transform")) {
    bg.setAttribute("transform", elem.getAttribute("transform"))
  }
  elem.parentNode.insertBefore(bg, elem)
}
export function initializeCallout(calloutsGroup, data, abbr, centroid){
	calloutsGroup.append("line")
	.attr("class", "state-callout-line")
	.attr("x1", centroid[0])
	.attr("y1", centroid[1])
	.attr("x2", data.pillX - 18)
	.attr("y2", data.pillY);


	// Draw interactive pill group
	const pill = calloutsGroup.append("g")
	.datum(data)
	.attr("class", "state-callout-pill")
	.attr("transform", `translate(${data.pillX}, ${data.pillY})`)

	pill.append("rect")
	.attr("rx", 8)
	.attr("ry", 8)
	.attr("x", -18)
	.attr("y", -10)
	.attr("width", 36)
	.attr("height", 20)
	.attr("class", "state-callout-bg");

	pill.append("text")
	.text(abbr)
	.attr("text-anchor", "middle")
	.attr("dy", "4")
	.attr("class", "state-callout-text");

	//return pill to hook up with external events
	return pill; 
}


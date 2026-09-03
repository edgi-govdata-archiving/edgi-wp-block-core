export function setupCountyPaths(countiesGroup, path, stateCounties, countyData, scale, setCurrentCounty, mapHover, mapExitHover){
	var countyPaths = countiesGroup
		.selectAll(".county-boundary")
		.data(stateCounties)
		.enter()
		.append("path")
		.attr("d", path)
		.attr("class", "county-boundary")
		.style("stroke-width", `${0.6 / scale}px`)

	countyPaths.on("click", (event, d) => {
			event.stopPropagation();
			setCurrentCounty(d, d.id);
		})
	countyPaths.on("mouseover", (event, d) => {
			event.stopPropagation();
			//showLabel(countiesGroup, path, event.target, d, scale);
			mapHover(countiesGroup, path, event.target, d.id);
		})
	countyPaths.on("mouseout", (event, d) => {
			event.stopPropagation();
			//hideLabel(countiesGroup);
			mapExitHover(countiesGroup);
		})

	countiesGroup.transition()
		.duration(200)
		.style("opacity", 1)

	return countyPaths;
}

function showLabel(countiesGroup, path, target, countyData, scale){
	countiesGroup.selectAll(".county-hover-pill").remove();

	var centroid = getCentroid(target);
	var fontSize = 20 / scale;
	var label = countyData.properties.name + " County";
	const pill = countiesGroup.append("g")
	.datum(countyData)
	.attr("class", "county-hover-pill")
	.attr("transform", `translate(${centroid[0]}, ${centroid[1]})`)

	pill.append("line")
	.attr("class", "county-hover-line")
	.attr("x1", 0)
	.attr("y1", -8)
	.attr("x2", 0)
	.attr("y2", -1);

	var pillWidth = 250 / scale;
	var pillHeight = 60 / scale;

	pill.append("rect")
	.attr("rx", 0)
	.attr("ry", 0)
	.attr("x", -pillWidth * .5)
	.attr("y", -pillHeight * 1.5)
	.attr("width", pillWidth)
	.attr("height", pillHeight)
	.attr("class", "county-hover-bg");

	pill.append("text")
	.text(label)
	.attr("text-anchor", "middle")
	.attr("font-size", `${fontSize}px`)
	.attr("dy", -fontSize - pillHeight * .5)
	.attr("class", "county-hover-text");
}

function hideLabel(countiesGroup, countyId){
	countiesGroup.selectAll(".county-hover-pill").remove();
}

function getCentroid(element){
	let bbox = element.getBBox();
	return [bbox.x + bbox.width * .5, bbox.y + bbox.height * .5]
}

export function resetCountyPaths(countiesGroup){
	//countiesGroup.innerHTML = "";
	countiesGroup.selectAll(".county-boundary").remove();
	countiesGroup.selectAll(".county-tooltip-line").remove();
	countiesGroup.transition()
	.duration(200)
	.style("opacity", 0);
}

export function lockCountyPaths(countiesGroup){
	countiesGroup.style.zIndex = "-1";
}


export function selectCounty(countyPaths, scale, countyId){
	// Thin outline stroke when zoomed in
	countyPaths
		.transition()
		.duration(800)
		.style("stroke-width", `${1.5 / scale}px`);

	// Fade out other states
	countyPaths
		.transition()
		.duration(400)
		.style("opacity", (d) =>
			d.id === countyId ? 1 : 0,
		)
		.attr("class", (d) =>
		`county-boundary${d.id === countyId ? " active" : ""}`,
	);
}

export function deselectCounty(countyPaths){
	// Restore county outline stroke width and opacity
	countyPaths
		.transition()
		.duration(400)
		.style("stroke-width", "1px")
		.style("opacity", 1)
		.attr("class", "county-boundary");
}
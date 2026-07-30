export function setupCountyPaths(countiesGroup, path, stateCounties, countyData, scale, setCurrentCounty){
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
			const countyId = d.id;
			//if (abbr) zoomToState(d, abbr);
			//selectCounty(countyPaths, scale, countyId);
			setCurrentCounty(d, countyId);
		})

	countiesGroup.transition()
		.duration(200)
		.style("opacity", 1)

	return countyPaths;
}

export function resetCountyPaths(countiesGroup){
	//countiesGroup.innerHTML = "";
	countiesGroup.selectAll(".county-boundary").remove();
	countiesGroup.selectAll(".county-tooltip-line").remove();
	countiesGroup.transition()
	.duration(200)
	.style("opacity", 0)

	console.log(countiesGroup);
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
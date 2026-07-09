import { getNameToAbbr, getStateToFips } from "../utilities/convert.js"

export function setupStatePaths(statesGroup, stateData, path){
	let statePaths = statesGroup
		.selectAll(".state-boundary")
		.data(stateData)
		.enter()
		.append("path")
		.attr("class", "state-boundary")
		.attr("d", path)

	return statePaths;
}

export function hover(statesGroup, abbr){
	statesGroup
		.selectAll(".state-boundary")
		.filter((f) => getNameToAbbr(f.properties.name) === abbr)
		.classed("hover", true);
}

export function exitHover(statesGroup){
	statesGroup.selectAll(".state-boundary").classed("hover", false);
}


export function zoomInStates(statePaths, scale, selectedAbbr){
	// Thin outline stroke when zoomed in
	statePaths
		.transition()
		.duration(800)
		.style("stroke-width", `${1.5 / scale}px`);

	// Fade out other states
	statePaths
		.transition()
		.duration(400)
		.style("opacity", (d) =>
			getNameToAbbr(d.properties.name) === selectedAbbr ? 1 : 0.4,
		)
		.attr("class", (d) =>
		`state-boundary${getNameToAbbr(d.properties.name) === selectedAbbr ? " active" : ""}`,
	);
}

export function zoomOutStates(statePaths){
	// Restore state outline stroke width and opacity
	statePaths
		.transition()
		.duration(800)
		.style("stroke-width", "1px")
		.style("opacity", 1)
		.attr("class", "state-boundary");
}
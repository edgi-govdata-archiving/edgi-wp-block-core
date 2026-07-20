import { getNameToAbbr, getStateToFips } from "../utilities/convert.js"

export function setupStatePaths(statesGroup, stateData, path, getStateColor, zoomToState){
	let statePaths = statesGroup
		.selectAll(".state-boundary")
		.data(stateData)
		.enter()
		.append("path")
		.attr("class", "state-boundary")
		.attr("d", path)
		.style("fill", (d) => {
			const abbr = getNameToAbbr(d.properties.name);
			return getStateColor(d.properties.name)
		})
		.on("click", (event, d) => {
			console.log(d);
			event.stopPropagation();
			const abbr = getNameToAbbr(d.properties.name);
			if (abbr) zoomToState(d, abbr);
		})

	return statePaths;
}

export function stateHover(statesGroup, abbr){
	statesGroup
		.selectAll(".state-boundary")
		.filter((f) => getNameToAbbr(f.properties.name) === abbr)
		.classed("hover", true);
}

export function exitStateHover(statesGroup){
	statesGroup.selectAll(".state-boundary").classed("hover", false);
}


export function selectState(statePaths, scale, selectedAbbr){
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

export function deselectState(statePaths){
	// Restore state outline stroke width and opacity
	statePaths
		.transition()
		.duration(800)
		.style("stroke-width", "1px")
		.style("opacity", 1)
		.attr("class", "state-boundary");
}
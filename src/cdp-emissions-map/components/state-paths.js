import { getNameToAbbr, getStateToFips } from "../utilities/convert.js"

export function setupStatePaths(statesGroup, stateData, path, getStateColor, setCurrentState){
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
			event.stopPropagation();
			const abbr = getNameToAbbr(d.properties.name);
			if (abbr) setCurrentState(d, abbr);
		})

	return statePaths;
}

export function hideTexas(statePaths){
	console.log("hideTexas()!");
	statePaths
		.transition()
		.duration(200)
		.style("opacity", (d) =>
			d.properties.name == "Texas" ? 0 : 1,
		)
}

export function showTexas(statePaths){
	console.log("showTexas()!");
	statePaths
		.transition()
		.duration(200)
		.style("opacity", 1)
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
			getNameToAbbr(d.properties.name) === selectedAbbr ? 1 : 0,
		)
		.attr("class", (d) =>
		`state-boundary${getNameToAbbr(d.properties.name) === selectedAbbr ? " active" : ""}`,
	);
}

export function deselectState(statePaths, includeTexas){
	// Restore state outline stroke width and opacity
	statePaths
		.transition()
		.duration(800)
		.style("stroke-width", "1px")
        .style("opacity", (d) =>
          (!includeTexas && d.properties.name === "Texas") ? 0 : 1,
        )
		.attr("class", "state-boundary");
}
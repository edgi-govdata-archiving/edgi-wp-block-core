import { setupLocationLabel } from "./location-label.js"

export function setupCallouts(calloutsGroup, data, abbr, centroid){
	calloutsGroup.append("line")
	.attr("class", "state-callout-line")
	.attr("x1", centroid[0])
	.attr("y1", centroid[1])
	.attr("x2", data.pillX - 18)
	.attr("y2", data.pillY);

	var fontSize = 20;
	var pillWidth = 100;
	var pillHeight = 60;

	// Draw interactive pill group
	var pill = calloutsGroup.append("g")
	.datum(data)
	.attr("class", "state-callout-pill")
	.attr("transform", `translate(${data.pillX}, ${data.pillY + 30})`)

	pill = setupLocationLabel(pill, data.abbr, null, 1, "state-callout", "-" + data.abbr);


	return pill; 
}

export function setupPillInteraction(pill, feature, statesGroup, calloutsGroup,
																		zoomToState, stateHover, exitStateHover, mapHover, mapExitHover){
	pill.on("click", (event, data) => {
		event.stopPropagation();
		zoomToState(feature, data.abbr);
	})
	.on("mouseover", (event, data) => {
		var statePath = stateHover(statesGroup, data.abbr);
		//console.log("statePath: " + JSON.stringify(statePath));
		// console.log("feature: " + feature);
		// console.log("pill: " + pill);
		// console.log("pill: " + pill);
		mapHover(calloutsGroup, event.target, data.abbr);
	})
	.on("mouseout", () => {
		exitStateHover(statesGroup);
		mapExitHover(calloutsGroup);
	})
	// 	countyPaths.on("mouseover", (event, d) => {
	// 		event.stopPropagation();
	// 		//showLabel(countiesGroup, path, event.target, d, scale);
	// 		mapHover(countiesGroup, path, event.target, d.id);
	// 	})
	// countyPaths.on("mouseout", (event, d) => {
	// 		event.stopPropagation();
	// 		//hideLabel(countiesGroup);
	// 		mapExitHover(countiesGroup);
	// 	})


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

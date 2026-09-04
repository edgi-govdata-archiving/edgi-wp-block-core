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

	var pill = calloutsGroup.append("g")
	.attr("class", "state-callout-pill")
	.attr("transform", `translate(${data.pillX}, ${data.pillY + 30})`)

	pill = setupLocationLabel(pill, data.abbr, null, 1, "state-callout", "-" + data.abbr);

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

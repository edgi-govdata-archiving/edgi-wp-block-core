import { setupLocationLabel } from "./location-label.js"

export function showLabel(elementGroup, target, name, emissions, scale){
	elementGroup.selectAll(".hover-label").remove();

	var centroid = getCentroid(target);
	const pill = elementGroup.append("g")
	.attr("class", "hover-label")
	.attr("transform", `translate(${centroid[0]}, ${centroid[1]})`)

	pill.append("line")
	.attr("class", "hover-label-line")
	.attr("x1", 0)
	.attr("y1", -50 / scale)
	.attr("x2", 0)
	.attr("y2", 10 / scale);

	setupLocationLabel(pill, name, emissions, scale, "hover-label", "");
}

export function hideLabel(elementGroup){
	elementGroup.selectAll(".hover-label").remove();
}

function getCentroid(element){
	let bbox = element.getBBox();
	return [bbox.x + bbox.width * .5, bbox.y + bbox.height * .5]
}
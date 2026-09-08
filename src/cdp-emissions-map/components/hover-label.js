import { setupLocationLabel } from "./location-label.js"

export function showLabel(elementGroup, target, name, emissions, scale, includeLine=true){
	elementGroup.selectAll(".hover-label").remove();

	var centroid = getCentroid(target);
	//console.log(centroid);
	const pill = elementGroup.append("g")
	.attr("class", "hover-label")
	.attr("transform", () => {
		if (includeLine){
			return `translate(${centroid[0]}, ${centroid[1]})`
		}
		else{
			return `translate(${centroid[0]}, ${centroid[1] + 150})`
		}
	})
	//.attr("transform", "translate(100, 100)")

	if (includeLine){
	pill.append("line")
		.attr("class", "hover-label-line")
		.attr("x1", 0)
		.attr("y1", -50 / scale)
		.attr("x2", 0)
		.attr("y2", 10 / scale);
	}

	setupLocationLabel(pill, name, emissions, scale, "hover-label", "");
}

export function hideLabel(elementGroup){
	elementGroup.selectAll(".hover-label").remove();
}

function getCentroid(element){
	let bbox = element.getBBox();
	return [bbox.x + bbox.width * .5, bbox.y + bbox.height * .5]
}
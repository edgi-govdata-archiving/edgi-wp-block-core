export function showLabel(elementGroup, path, target, text, scale, width){
	elementGroup.selectAll(".hover-label").remove();

	var centroid = getCentroid(target);
	var fontSize = 20 / scale;
	const pill = elementGroup.append("g")
	//.datum(countyData)
	.attr("class", "hover-label")
	.attr("transform", `translate(${centroid[0]}, ${centroid[1]})`)

	pill.append("line")
	.attr("class", "hover-label-line")
	.attr("x1", 0)
	.attr("y1", -30 / scale)
	.attr("x2", 0)
	.attr("y2", 10 / scale);

	var pillWidth = width / scale;
	var pillHeight = 60 / scale;

	pill.append("rect")
	.attr("rx", 0)
	.attr("ry", 0)
	.attr("x", -pillWidth * .5)
	.attr("y", -pillHeight * 1.5)
	.attr("width", pillWidth)
	.attr("height", pillHeight)
	.attr("class", "hover-label-bg");

	pill.append("text")
	.text(text)
	.attr("text-anchor", "middle")
	.attr("font-size", `${fontSize}px`)
	.attr("dy", -fontSize - pillHeight * .5)
	.attr("class", "hover-label-text");
}


export function hideLabel(elementGroup){
	elementGroup.selectAll(".hover-label").remove();
}

function getCentroid(element){
	let bbox = element.getBBox();
	return [bbox.x + bbox.width * .5, bbox.y + bbox.height * .5]
}
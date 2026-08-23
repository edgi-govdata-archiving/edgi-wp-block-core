var hoverLabel = `
	<svg width="100%" height="100%">
	<defs>
	<filter x="0" y="0" width="1" height="1" id="solid">
	  <feFlood flood-color="yellow" result="bg" />
	  <feMerge>
	    <feMergeNode in="bg"/>
	    <feMergeNode in="SourceGraphic"/>
	  </feMerge>
	</filter>
	</defs>
	<text filter="url(#solid)" x="20" y="50" font-size="50">solid background</text>
	</svg>`


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
	.attr("y1", -40 / scale)
	.attr("x2", 0)
	.attr("y2", 10 / scale);

	var pillWidth = width / scale;
	var pillHeight = 60 / scale;

	pill.append("rect")
	.attr("rx", 0)
	.attr("ry", 0)
	.attr("x", -pillWidth * .5)
	.attr("y", -pillHeight * 1.5)
	// .attr("width", pillWidth)
	// .attr("height", pillHeight)
	.attr("id", "hover-label-bg")
	.attr("class", "hover-label-bg");

	pill.append("text")
	.text(text)
	.attr("text-anchor", "middle")
	.attr("font-size", `${fontSize}px`)
	.attr("dy", -fontSize - pillHeight * .5)
	.attr("class", "hover-label-text")
	.attr("id", "hover-label-text");

	let textBox = document.querySelector('#hover-label-text');
	let svg = document.querySelector('svg');
	let rect = document.querySelector('#hover-label-bg');
	let box = textBox.getBBox();
	let endX = box.width + 5 * 2 | 0;
	let endY = box.height + 5 * 2 | 0;


	rect.setAttribute("width", endX);
	rect.setAttribute("height", endY);
	rect.style = "fill:none;stroke-width:0;stroke:rgb(0,0,0)";

	makeBG(textBox, scale);

}


export function hideLabel(elementGroup){
	elementGroup.selectAll(".hover-label").remove();
}

function getCentroid(element){
	let bbox = element.getBBox();
	return [bbox.x + bbox.width * .5, bbox.y + bbox.height * .5]
}

function makeBG(elem, scale) {
 
  var svgns = "http://www.w3.org/2000/svg"
  var bounds = elem.getBBox()
  var bg = document.createElementNS(svgns, "rect")
  var style = getComputedStyle(elem)
  var padding_top = parseInt(style["padding-top"]) / scale;
  var padding_left = parseInt(style["padding-left"]) / scale;
  var padding_right = parseInt(style["padding-right"]) / scale;
  var padding_bottom = parseInt(style["padding-bottom"]) / scale;
  bg.setAttribute("x", bounds.x - parseInt(style["padding-left"]) / scale)
  bg.setAttribute("y", bounds.y - parseInt(style["padding-top"]) / scale)
  bg.setAttribute("width", bounds.width + padding_left + padding_right)
  bg.setAttribute("height", bounds.height + padding_top + padding_bottom)
  bg.setAttribute("fill", style["background-color"])
  bg.setAttribute("vector-effect", "non-scaling-stroke")
  bg.setAttribute("rx", parseInt(style["border-radius"]) / scale)
  bg.setAttribute("stroke-width", style["border-top-width"])
  bg.setAttribute("stroke", style["border-top-color"])
  if (elem.hasAttribute("transform")) {
    bg.setAttribute("transform", elem.getAttribute("transform"))
  }
  elem.parentNode.insertBefore(bg, elem)
}
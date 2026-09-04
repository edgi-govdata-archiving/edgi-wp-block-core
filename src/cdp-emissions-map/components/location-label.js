import { formatEmissions, splitInHalf } from "../utilities/format.js"

export function setupLocationLabel(pill, name, emissions, scale, cssLabel, cssSuffix){
	var pillWidth = 150 / scale;
	var pillHeight = 60 / scale;
	var fontSize = 25 / scale;
	var emissionsFontSize = 20 / scale;

	pill.append("rect")
	.attr("rx", 0)
	.attr("ry", 0)
	.attr("x", -pillWidth * .5)
	.attr("y", -pillHeight * 1.5)
	.attr("id", cssLabel + "-bg" + cssSuffix)
	.attr("class", cssLabel + "-bg");

	var textElement = pill.append("text")
	.attr("text-anchor", "middle")
	.attr("font-size", `${fontSize}px`)
	.attr("dy", -fontSize - pillHeight * .5)
	.attr("class", cssLabel + "-text")
	.attr("id", cssLabel + "-text" + cssSuffix);

	if (emissions){
		addTextLine(textElement, formatEmissions(emissions) + " tCO₂e", emissionsFontSize, "normal");
	}

	if (name.length < 20){
		addTextLine(textElement, name, fontSize, "bolder");
	}
	else{
		var splitName = splitInHalf(name);
		addTextLine(textElement, splitName[1], fontSize, "bolder");
		addTextLine(textElement, splitName[0], fontSize, "bolder");
	}

	let textBox = document.querySelector('#' + cssLabel + '-text' + cssSuffix);
	let svg = document.querySelector('svg');
	let rect = document.querySelector('#' + cssLabel + '-bg' + cssSuffix);
	let box = textBox.getBBox();
	let endX = box.width + 5 * 2 | 0;
	let endY = box.height + 5 * 2 | 0;


	rect.setAttribute("width", endX);
	rect.setAttribute("height", endY);
	rect.style = "fill:none;stroke-width:0;stroke:rgb(0,0,0)";

	makeBG(textBox, scale);

	return pill;
}

function addTextLine(element, text, fontSize, fontWeight){
	element.append("tspan")
	.text(text)
	.attr("x", 0)
	.attr("dy", -fontSize)
	.attr("font-size", `${fontSize}px`)
	.attr("font-weight", fontWeight);
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

import * as d3 from "d3";

const directColorsRange = ["#e8eff5", "#19649f", "#0a283f"]
const supplierColorsRange = ["#f9f1e6", "#c97c08", "#503103"] 

//returns scaled color given range of values and colors
//value: number to be mappped
//valueRange: 2 value array containing min, max values
//colorRange: 2 value array containing min, max color values to map to
export function getScaledColor(value, valueRange, colorRange){ //value, valueRange, colorRange
	var middle = (valueRange[1] - valueRange[0]) * .5; //adding middle value because gradient is setup with 3 main colors
	var colorScale = d3.scaleLinear()
		.range(colorRange)
		.domain([valueRange[0], middle, valueRange[1]]);
	return colorScale(value);
}

export function getDirectColor(value, valueRange){
	return getScaledColor(value, valueRange, directColorsRange)
}

export function getSupplierColor(value, valueRange){
	return getScaledColor(value, valueRange, supplierColorsRange)
}
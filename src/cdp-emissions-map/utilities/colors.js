
import * as d3 from "d3";

const directColorsRange = ["#e8eff5", "#0a283f"] //#19649f
const supplierColorsRange = ["#f9f1e6", "#503103"] //#c97c08

//returns scaled color given range of values and colors
//value: number to be mappped
//valueRange: 2 value array containing min, max values
//colorRange: 2 value array containing min, max color values to map to
export function getScaledColor(value, valueRange, colorRange){ //value, valueRange, colorRange
	var colorScale = d3.scaleLinear()
		.range(colorRange)
		.domain(valueRange);
	return colorScale(value);
}

export function getDirectColor(value, valueRange){
	return getScaledColor(value, valueRange, directColorsRange)
}

export function getSupplierColor(value, valueRange){
	return getScaledColor(value, valueRange, supplierColorsRange)
}
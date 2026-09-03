import { formatEmissions } from "../utilities/format.js"

var gradientLegend = `
	<section class="legend gradient-legend">
		<div id="gradient"></div>
		<div class="labels">
			<label id="low-label">low</label>
			<label id="middle-label">middle</label>
			<label id="high-label">high</label>
			<label id="unit-label">tCO₂e</label>
		</div>
    </section>`

var facilityLegend = `
	<section class="legend facility-legend">
		<div id="facility-icon"></div>
		<label id="facility-label">facility</label>
    </section>`

export function loadGradientLegend(container, rangeArray, emissionType){
	container.innerHTML = gradientLegend;

	var middleRange = (rangeArray[1] - rangeArray[0]) * .5;

    container.querySelector("#low-label").innerHTML = formatEmissions(rangeArray[0]);
    container.querySelector("#middle-label").innerHTML = formatEmissions(middleRange);
    container.querySelector("#high-label").innerHTML = formatEmissions(rangeArray[1]);
    container.querySelector("#gradient").className = emissionType;

    return container;
}

export function loadFacilityLegend(container, emissionType){
	container.innerHTML = facilityLegend;
	var label;

	if (emissionType == "total_direct"){
		label = "Direct Emission Facility"
	}
	else{
		label = "Supplier Facility"
	}
    container.querySelector("#facility-label").innerHTML = label;
    container.querySelector("#facility-icon").className = emissionType;

    return container;
}
export function formatEmissions(emissions){
	var billion = 1000000000;
	var million = 1000000;

	if (emissions > billion){
		return round(emissions / billion) + " billion";
	}
	else if (emissions > million){
		return round(emissions / million) + " million";
	}
	else{
		return addCommas(round(emissions));
	}
}

function round(value){
	return Math.round(value * 100) / 100;
}

function addCommas(value){
	return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
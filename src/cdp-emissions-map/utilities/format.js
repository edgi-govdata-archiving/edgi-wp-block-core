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

export function splitInHalf(string){
	var middle = Math.floor(string.length / 2);
	var before = string.lastIndexOf(' ', middle);
	var after = string.indexOf(' ', middle + 1);

	if (middle - before < after - middle) {
	    middle = before;
	} 
	else {
	    middle = after;
	}

	return [string.substr(0, middle), string.substr(middle + 1)]
}

//formats string of facilities seperated by semicolons
export function formatFacilities(string) {
	var facilities = string.split('; ');
	for (var i = 0; i < facilities.length; i++) {
		if (!containsLowercase(facilities[i])){
			facilities[i] = capitalizeFacility(facilities[i]);
		}
	}

	return facilities.join(', '); 
} 

//capitalizes facilities names to sentence case
export function capitalizeFacility(string) {
	//most facility names are all all uppercase by default

	//this checks for cases that contain some lowercase,  usually bc they contain acronyms
	//e.g. "BPX Energy" -- these cases are already formatted properly
	if (containsLowercase(string)){ 
		return string;
	}
	var specialCases = ["bp", "bry", "cps", "fg", "llc", "lp", "nrg", "us", "usa"]; //common acronyms, these will be fully capitalized
	var prepositions = ["of", "as"] //common prepositions, will be fully lowercase
	var words = string.toLowerCase().split(' ');

	for (var i = 0; i < words.length; i++) {
		var word = words[i];

		//checks for special cases to fully capitalize
		if (specialCases.includes(word) || containsSymbols(word)){
			words[i] = word.toUpperCase();
		}
		//checks for hyphenated words so each word can be capitalized
		else if (word.indexOf('-') != -1){
			var parts = word.split("-");
			words[i] = capitalizeAll(parts).join("-");
		}
		else if (!prepositions.includes(word)){
			words[i] = capitalize(word);
		}    
	}

	return words.join(' '); 
} 

function capitalize(word){
	return word.charAt(0).toUpperCase() + word.substring(1);
}

function capitalizeAll(words){
	for (var i = 0; i < words.length; i++) {
		words[i] = capitalize(words[i]);
	}
	return words;
}


function containsLowercase(string) {
    return /[a-z]/.test(string);
}

function containsSymbols(string) {
    return /[0123456789&()]/.test(string);
}


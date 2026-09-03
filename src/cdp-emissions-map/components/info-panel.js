import { formatEmissions } from "../utilities/format.js"

export default `
    <div class="info-panel">
	<h3 id="currentState">Select state... </h3>
	<h3 id="stateEmissions"></h3>
    </div>
`; 

var defaultInfoPanel = `
	<section class="info-panel country-view">
		<h5">loading...</h5>
    </section>`

var countryInfoPanel = `
	<section class="info-panel country-view">
		<h2 id="info-header">United States</h2>
		<h4 id="info-subheader">2000 Supplier Emissions</h4>
		<h3 class="list-header">Top Emitting States</h3>
		<ol id="top-emitters">
		</ol>
    </section>`

var stateInfoPanel = `
	<section class="info-panel state-view">
		<h2 id="info-header">Texas</h2>
		<h4 id="info-subheader">2000 Supplier Emissions</h4>
		<section class="info-emissions">
			<h1 id="emissions-total">12,345</h1>
			<label class=>tCO₂e</label>
		</section>
		<h3 class="list-header">Top Emitting Counties</h3>
		<ol id="top-emitters">
		</ol>
    </section>`

 var countyInfoPanel = `
	<section class="info-panel county-view">
		<h2 id="info-header">Texas</h2>
		<h4 id="info-subheader">2000 Supplier Emissions</h4>
		<section class="info-emissions">
			<h1 id="emissions-total">12,345</h1>
			<label class=>tCO₂e</label>
		</section>
 		<h3 class="list-header">Top Emitting Facilities</h3>
		<ol id="top-emitters">
		</ol>

    </section>`

 var facilityInfoPanel = `
	<section class="info-panel facility-view">
		<button id="close-button">
			<img />
		</button>
		<h2 id="info-header">Facility Name</h2>

		<h4 id="info-subheader">2000 Supplier Emissions</h4>
		<section class="info-emissions">
			<h1 id="emissions-total">12,345</h1>
			<label class=>tCO₂e</label>
		</section>
 		<h3 class="ownership-header">Parent Companies</h3>
 		<h4 id="parent-companies">Current Parent Companies</h4>
 		<h3 class="frsid-header">FRSID</h3>
 		<h4 id="frsid">0000000</h4>

    </section>`

export function loadDefaultInfo(){
	return defaultInfoPanel;
}

export function loadCountryInfo(container, stateData, year, emissionType, setCurrentLocale){
	var subheader = getSubheader(year, emissionType);

	var stateList = [];

	for (var key in stateData) {
        stateList.push( stateData[key] );
	}

	var topStates = getTopEmitters(stateList, year, emissionType, 5);

	container.innerHTML = countryInfoPanel;
	container.querySelector("#info-subheader").innerHTML = subheader;

    makeClickableList(container.querySelector("#top-emitters"), topStates, "name", "abbr", setCurrentLocale)

	return container;
} 

export function loadStateInfo(container, currentState, year, emissionType, setCurrentLocale){
	var header = currentState.name;
	var subheader = getSubheader(year, emissionType);

	var data = currentState.data;
	var emissions = data.emissions[year][emissionType];
	var topCounties = getTopEmitters(data.counties, year, emissionType, 5);

	container.innerHTML = stateInfoPanel;
	container.querySelector("#info-header").innerHTML = header;
	container.querySelector("#info-subheader").innerHTML = subheader;
	container.querySelector("#emissions-total").innerHTML = formatEmissions(emissions);

	makeClickableList(container.querySelector("#top-emitters"), topCounties, "county_name", "county_fips", setCurrentLocale)

	return container;
} 

export function loadCountyInfo(container, currentCounty, year, emissionType, countyFacilities, setCurrentLocale){
	var header = currentCounty.name;
	var subheader = getSubheader(year, emissionType);

	var data = currentCounty.data;

	var emissions = data.emissions[year][emissionType];
	var topFacilities = getTopEmitters(countyFacilities, year, emissionType, 5);

	container.innerHTML = countyInfoPanel;
	container.querySelector("#info-header").innerHTML = header;
	container.querySelector("#info-subheader").innerHTML = subheader;
	container.querySelector("#emissions-total").innerHTML = formatEmissions(emissions);

	if (topFacilities.length == 0){
		container.querySelector("#top-emitters").innerHTML = "<label>- no data available -</label>";
	}
	else{
		makeClickableList(container.querySelector("#top-emitters"), topFacilities, "facility_name", "facility_id", setCurrentLocale);
	}

	return container;
} 

export function loadFacilityInfo(container, currentFacility, year, emissionType, goBack){
	var header = currentFacility.facility_name;
	var subheader = getSubheader(year, emissionType);

	var emissions = currentFacility.emissions[year][emissionType];

	container.innerHTML = facilityInfoPanel;
	container.querySelector("#info-header").innerHTML = header;
	container.querySelector("#info-subheader").innerHTML = subheader;
	container.querySelector("#emissions-total").innerHTML = formatEmissions(emissions);
	container.querySelector("#parent-companies").innerHTML = currentFacility.latest_parent;
	container.querySelector("#frsid").innerHTML = currentFacility.facility_id;

	var closeButton = container.querySelector("#close-button");

	var dashboard = document.querySelector("#cdp-emissions-map");
	const closeIconUrl = dashboard.getAttribute("close-icon-url");
	var icon = closeButton.querySelector("img");
	console.log(closeIconUrl);
	console.log(icon);
	icon.src = closeIconUrl;

	closeButton.addEventListener("click", () => {
	    goBack();
	  });

	return container;
} 



function getSubheader(year, emissionType){
	var subheader = year;

	if (emissionType == "total_direct"){
		subheader += " Direct Emissions";
	}
	else{
		subheader += " Supplier Emissions";
	}

	return subheader;
}

function getTopEmitters(fullList, year, emissionType, listLength){
	//only include emitters with data from current year + emission type
	var filtered = fullList.filter((a) => a.emissions[year] && a.emissions[year][emissionType]); 

	//sort by top emitters
	var sorted = filtered.sort((a, b) => b.emissions[year][emissionType] - a.emissions[year][emissionType]);

	return sorted.slice(0, listLength);
}

function makeOrderedList(list, selector){
	var html = "";
	for (var i in list){
		html += "<li><button>" + list[i][selector] + "</button></li>";
	}
	return html;
}

export function makeClickableList(container, list, nameSelector, idSelector, setCurrentLocale){
	for (var i in list){
		var data = list[i];
		var id = data[idSelector];

		var template = "<li><button data-id='" + id + "'>" + data[nameSelector] + "</button></li>";
		container.insertAdjacentHTML("beforeend", template);
		var listButton = container.lastElementChild.querySelector("button"); 

		listButton.addEventListener("click", () => {
		    setCurrentLocale(event.srcElement.dataset.id);
		});
	}
}

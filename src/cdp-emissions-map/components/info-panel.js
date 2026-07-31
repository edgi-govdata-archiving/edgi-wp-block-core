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
		<h5 id="info-subheader">2000 Supplier Emissions</h5>
		<h2>Top Emitting States</h2>
		<ol id="top-emitters">
			<li>Alabama</li>
			<li>Alaska</li>
			<li>Arizona</li>
			<li>California</li>
			<li>Colorado</li>
		</ol>
    </section>`

var stateInfoPanel = `
	<section class="info-panel state-view">
		<h2 id="info-header">Texas</h2>
		<h5 id="info-subheader">2000 Supplier Emissions</h5>
		<h1 id="emissions-total">12,345</h1>
		<label>tCO₂e</label>
		<h2>Top Emitting Counties</h2>
		<ol id="top-emitters">
			<li>Anderson</li>
			<li>Andrews</li>
			<li>Angelina</li>
			<li>Aransas</li>
			<li>Archer</li>
		</ol>
    </section>`

 var countyInfoPanel = `
	<section class="info-panel county-view">
		<h2 id="info-header">Texas</h2>
		<h5 id="info-subheader">2000 Supplier Emissions</h5>
		<h1 id="emissions-total">12,345</h1>
		<label>tCO₂e</label>

    </section>`

export function loadDefaultInfo(){
	return defaultInfoPanel;
}

export function loadCountryInfo(container, stateData, year, emissionType){
	var subheader = getSubheader(year, emissionType);

	var stateList = [];

	for (var key in stateData) {
        stateList.push( stateData[key] );
	}

	var topStates = getTopEmitters(stateList, year, emissionType, 5);

	container.innerHTML = countryInfoPanel;
	container.querySelector("#info-subheader").innerHTML = subheader;
	container.querySelector("#top-emitters").innerHTML = makeOrderedList(topStates, "name");

	return container;
} 

export function loadStateInfo(container, currentState, year, emissionType){
	var header = currentState.name;
	var subheader = getSubheader(year, emissionType);

	var data = currentState.data;
	var emissions = data.emissions[year][emissionType];
	var topCounties = getTopEmitters(data.counties, year, emissionType, 5);

	container.innerHTML = stateInfoPanel;
	container.querySelector("#info-header").innerHTML = header;
	container.querySelector("#info-subheader").innerHTML = subheader;
	container.querySelector("#emissions-total").innerHTML = emissions;
	container.querySelector("#top-emitters").innerHTML = makeOrderedList(topCounties, "county_name");

	return container;
} 

export function loadCountyInfo(container, currentCounty, year, emissionType){
	var header = currentCounty.name;
	var subheader = getSubheader(year, emissionType);

	var data = currentCounty.data;

	var emissions = data.emissions[year][emissionType];

	container.innerHTML = countyInfoPanel;
	container.querySelector("#info-header").innerHTML = header;
	container.querySelector("#info-subheader").innerHTML = subheader;
	container.querySelector("#emissions-total").innerHTML = emissions;
	// container.querySelector("#top-emitters").innerHTML = makeOrderedList(topCounties);

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
	// console.log(fullList[0].emissions[year])
	// console.log(fullList[1].emissions[year])

	var sorted = fullList.sort((a, b) => {
		if (a.emissions[year] && b.emissions[year]){	
			return b.emissions[year][emissionType] - a.emissions[year][emissionType];
		}
		else{
			return b.name - a.name; //in case of no emissions data, just list alphabetically
		}
	});
	return sorted.slice(0, listLength);
}

function makeOrderedList(list, selector){
	var html = "";
	for (var i in list){
		html += "<li>" + list[i][selector] + "</li>";
	}
	return html;
}
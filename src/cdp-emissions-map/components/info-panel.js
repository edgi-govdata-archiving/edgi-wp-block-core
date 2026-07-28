export default `
    <div class="info-panel">
	<h3 id="currentState">Select state... </h3>
	<h3 id="stateEmissions"></h3>
    </div>
`; 


var countryInfoPanel = `
	<section class="info-panel country-view">
		<h2 id="info-header">United Sates</h2>
		<h5 id="info-status">2000 Supplier Emissions</h5>
		<h2>Top Emitting States</h2>
		<ol>
			<li>Alabama</li>
			<li>Alaska</li>
			<li>Arizona</li>
			<li>California</li>
			<li>Colorado</li>
		</ol>
		<h3 id="stateEmissions"></h3>
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
		<h3 id="stateEmissions"></h3>
    </section>`

export function loadCountryInfo(){
	return countryInfoPanel;
} 

export function loadStateInfo(container, currentState, year, emissionType){
	var header = currentState.name;
	var subheader = getSubheader(year, emissionType);

	var data = currentState.data;
	//console.log(data);

	var emissions = data.emissions[year][emissionType];

	//console.log(data.counties);
	var topCounties = getTopEmitters(data.counties, year, emissionType, 5);
	console.log(topCounties);

	container.innerHTML = stateInfoPanel;
	container.querySelector("#info-header").innerHTML = header;
	container.querySelector("#info-subheader").innerHTML = subheader;
	container.querySelector("#emissions-total").innerHTML = emissions;
	container.querySelector("#top-emitters").innerHTML = makeOrderedList(topCounties);



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
	console.log(fullList[0].emissions[year][emissionType])
	console.log(fullList[1].emissions[year][emissionType])

	var sorted = fullList.sort((a, b) => b.emissions[year][emissionType] - a.emissions[year][emissionType]);
	return sorted.slice(0, listLength);
}

function makeOrderedList(list){
	var html = "";
	for (var i in list){
		html += "<li>" + list[i].county_name + "</li>";
	}
	return html;
}
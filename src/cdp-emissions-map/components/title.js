var defaultTitle = 
	`<div class="map-header">
          <h3 id="map-title" class="map-title">What states have the highest emissions?</h3>
     </div>`

var titleTemplate = 
	`<div class="map-header">
          <h3 id="map-title" class="map-title">What states have the highest emissions?</h3>
     </div>`

export function loadDefaultTitle(){
	return defaultTitle;
}

export function loadCountryTitle(container){
	container.innerHTML = titleTemplate;
	return container;
}

export function loadStateTitle(container, currentState){
	var stateName = currentState.name;

	container.innerHTML = titleTemplate;
	container.querySelector("#map-title").innerHTML = "What " + stateName + " counties have the highest emissions?";

	return container;
} 

export function loadCountyTitle(container, currentCounty){
	var countyName = currentCounty.name;

	container.innerHTML = titleTemplate;
	container.querySelector("#map-title").innerHTML = "What " + countyName + " facilites have the highest emissions?";

	return container;
} 


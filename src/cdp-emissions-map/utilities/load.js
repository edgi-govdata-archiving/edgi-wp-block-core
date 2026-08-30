import * as d3 from "d3";

export function loadBaseFiles(dashboard, promisedFunction){
	const statesJsonUrl = dashboard.getAttribute("data-states-json-url");
	const countiesJsonUrl = dashboard.getAttribute("data-counties-json-url");
	const stateGHGUrl = dashboard.getAttribute("data-states-ghg-json-url"); 
	const countyGHGUrl = dashboard.getAttribute("data-counties-ghg-url");
	//const facilitiesTestUrl = dashboard.getAttribute("data-facilities-test");

	console.log("Load::loadBaseFiles() - statesJsonUrl: " + statesJsonUrl);
	console.log("Load::loadBaseFiles() - countiesJsonUrl: " + countiesJsonUrl);
	console.log("Load::loadBaseFiles() - stateGHGUrl: " + stateGHGUrl);
	console.log("Load::loadBaseFiles() - countyGHGUrl: " + countyGHGUrl);
	//console.log("Load::loadBaseFiles() - facilitiesTestUrl: " + facilitiesTestUrl);

	if (!statesJsonUrl) {
		console.error("CDP Map Dashboard: Missing state map data file");
		return;
	}
	else if (!countiesJsonUrl) {
		console.error("CDP Map Dashboard: Missing counties map data file");
		return;
	}

    else if (!stateGHGUrl) {
		console.error("CDP Map Dashboard: Missing state GHG data file");
		return;
	}
    else if (!countyGHGUrl) {
		console.error("CDP Map Dashboard: Missing county GHG data file");
		return;
	}
    // else if (!facilitiesTestUrl) {
	// 	console.error("CDP Map Dashboard: Missing facilities test data file (2010)");
	// 	return;
	// }

	Promise.all([
		d3.json(statesJsonUrl),
		d3.json(countiesJsonUrl),
		d3.json(stateGHGUrl),
		d3.json(countyGHGUrl)
		//,
		//d3.json(facilitiesTestUrl)
	])
    .then(([statesTopo, countiesTopo, stateGHGUrl, countyGHGUrl]) => { //facilitiesTestUrl
		promisedFunction(statesTopo, countiesTopo, stateGHGUrl, countyGHGUrl); //facilitiesTestUrl
	})
	.catch((err) => {
	console.error(
		  "EDGI Map Dashboard: Error loading base data files:",
		  err,
		);
		// canvasContainer.innerHTML = `
		// 		<div style="padding: 20px; color:#e74c3c;">
		// 			<p>Error loading map resources. Please make sure the plugin files are fully uploaded.</p>
		// 			<small>${err.message}</small>
		// 		</div>
		// 	`;
	});
}

export function loadFacilityFiles(dashboard, promisedFunction){
	const facilityFileName = dashboard.getAttribute("data-facilities-name");
	const facilityFileType = dashboard.getAttribute("data-facilities-file-type");
	const facilityStartYear = dashboard.getAttribute("facilities-start-year");
	const facilityEndYear = dashboard.getAttribute("facilities-end-year");

	var facilityFiles = [];
	var facilityPromises = [];
	var facilityFilesLoaded = [];

	var startYear = parseInt(facilityStartYear);
	var endYear = parseInt(facilityEndYear);

	console.log("Load::loadFacilityFiles() - facilityFileName: " + facilityFileName);
	console.log("Load::loadFacilityFiles() - facilityFileType: " + facilityFileType);
	console.log("Load::loadFacilityFiles() - facilityStartYear: " + facilityStartYear);
	console.log("Load::loadFacilityFiles() - facilityEndYear: " + facilityEndYear);

	console.log("Load::loadFacilityFiles() - startYear (parsed): " + endYear);
	console.log("Load::loadFacilityFiles() - endYear (parsed): " + endYear);


	for (let year = startYear; year < endYear + 1; year++){
		var file = facilityFileName + year + "." + facilityFileType;
		console.log("Load::loadFacilityFiles() - file to load: " + file);
		facilityFiles.push(file);
		facilityPromises.push(d3.json(file));
		facilityFilesLoaded.push("facilities_" + year);
	}

	Promise.all(facilityPromises)
    .then((facilityFilesLoaded) => { 
		promisedFunction(facilityFilesLoaded, startYear, endYear);
	})
	.catch((err) => {
	console.error(
		  "EDGI Map Dashboard: Error loading facility data files:",
		  err,
		);
		// canvasContainer.innerHTML = `
		// 		<div style="padding: 20px; color:#e74c3c;">
		// 			<p>Error loading map resources. Please make sure the plugin files are fully uploaded.</p>
		// 			<small>${err.message}</small>
		// 		</div>
		// 	`;
	});
}
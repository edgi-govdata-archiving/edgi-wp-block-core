import * as d3 from "d3";

export function loadBaseFiles(dashboard, promisedFunction){
	const csvUrl = dashboard.getAttribute("data-csv-url");
	const statesJsonUrl = dashboard.getAttribute("data-states-json-url");
	const countiesJsonUrl = dashboard.getAttribute("data-counties-json-url");
	const stateGHGUrl = dashboard.getAttribute("data-states-ghg-json-url"); 
	const countyGHGUrl = dashboard.getAttribute("data-counties-ghg-url");

	if (!csvUrl || !statesJsonUrl || !countiesJsonUrl || !stateGHGUrl || !countyGHGUrl) {
		console.error("CDP Map Dashboard: Missing required data attributes!");
		return;
	}

	Promise.all([
		d3.csv(csvUrl),
		d3.json(statesJsonUrl),
		d3.json(countiesJsonUrl),
		d3.json(stateGHGUrl),
		d3.json(countyGHGUrl)
	])
    .then(([csvData, statesTopo, countiesTopo, stateGHGUrl, countyGHGUrl]) => { 
		promisedFunction(csvData, statesTopo, countiesTopo, stateGHGUrl, countyGHGUrl);
	})
	.catch((err) => {
	console.error(
		  "EDGI Map Dashboard: Error loading visualization resources:",
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

	for (let year = startYear; year < endYear + 1; year++){
		var file = facilityFileName + year + "." + facilityFileType;
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
		  "EDGI Map Dashboard: Error loading visualization resources:",
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
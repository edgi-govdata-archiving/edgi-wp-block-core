export function processStateData(rawData){
    var output = {};
    const stateDataArray = rawData["objects"]["data"]["geometries"];

    for (var stateKey in stateDataArray) {
        var source = stateDataArray[stateKey]["properties"]

        output[source.state_abbr] = {
            name: source.state_name,
            abbr: source.state_abbr,
            emissions: source.emissions,
            counties: []
        }
    }

    return output;
}

export function processCountyData(rawData){
    var output = {};
    const countyDataArray = rawData["objects"]["data"]["geometries"];

    for (var countyKey in countyDataArray) {
       var source = countyDataArray[countyKey]["properties"]

        output[source.county_fips] = {
            county_name: source.county_name,
            county_fips: source.county_fips,
            state_abbr: source.state,
            emissions: source.emissions
        }
    }
    //console.log(output);
    return output;
}

export function sortCountiesIntoStates(stateData, countyData){
    for (var countyFips in countyData){
        var county = countyData[countyFips];
        if (county.state_abbr && stateData[county.state_abbr]){
            stateData[county.state_abbr].counties.push(county);
        }
    }
    return stateData;
}

export function removeTexasStateData(stateData){
    var output = structuredClone(stateData);
    delete output.TX;
    return output;
}

export function removeTexasCountyData(countyData){
    var output = {};

    for (var key in countyData) {
        var county = countyData[key];
        if (county.state_abbr != "TX"){
            output[key] = county;
        }
    }
    return output;
}


export function processFacilitiesData(countyData, rawFacilityData){
    var output = {};
    const facilitiesArray = rawFacilityData["features"];

    var index = 0;

    for (var key in facilitiesArray) {
       var source = facilitiesArray[key]["properties"]
       var facility = {};

        facility = {
            facility_id : source["Facility Id"],
            facility_name : source["Facility Name"],
            total_direct : source["Total Direct Emissions"],
            total_supplier : source["Total Supplier Emissions"],
            latest_parent : source["Latest Parent Company"],
            county_fips: Math.floor(source["County_FIPS"]) //value is float in dataset
        }

        countyData[facility.county_fips] = facility;


       // if (index < 3){
       //  console.log(facility);
       //  index++;
       // }
   
    }
    //console.log(output);
    return countyData;
}
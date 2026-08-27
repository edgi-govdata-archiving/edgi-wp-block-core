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
            emissions: source.emissions,
            facility_data: [],
            facility_geometry: [],
        }
    }
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

export function removeTexasFacilityData(facilityData, countyData){
    var output = {};
    var mismatchedFipsCount = 0;

    for (var countyFips in facilityData) {
        var countyFacilities = facilityData[countyFips];
        var county = countyData[countyFips];
        // if (!county){
        //     mismatchedFipsCount += 1;
        //     console.log("mismatched county fips: " + countyFips)

        // }
        if (county && county.state_abbr != "TX"){
            output[countyFips] = countyFacilities;
        }
    }

    //console.log("mismatched county fips count: " + mismatchedFipsCount)

    return output;
}


export function processFacilitiesYear(facilityData, rawData, year){
    const facilitiesArray = rawData["features"];

    var index = 0;

    for (var key in facilitiesArray) {

        var entry = facilitiesArray[key];
        var properties = entry["properties"];
        var countyFips = Math.floor(properties["County_FIPS"]).toString(); //value is float in dataset;

        // if (countyFips == "NaN"){
        //  console.log("null fips: " + JSON.stringify(properties));
        // }

        if (countyFips.length < 5){
            countyFips = "0" + countyFips;
        }
        var facilityId = properties["Facility Id"];


        //if main facilityData does not already include county, start new list to track facilities in that county
        if (!facilityData[countyFips]){
            facilityData[countyFips] = {};
        }

        var listedFacility = facilityData[countyFips][facilityId];

        //if specific facility does not exist in that list, start new entry
        if (!listedFacility){

            var facilityEmissions = {};
            facilityEmissions[year] = {
                total_direct : properties["Total Direct Emissions"],
                total_supplier : properties["Total Supplier Emissions"]
            };

            var facility = {
                facility_id : facilityId,
                facility_name : properties["Facility Name"],
                latest_parent : properties["Latest Parent Company"],
                is_direct_emitter : properties["Is_Direct_Emitter"],
                is_supplier : properties["Is_Supplier"],
                county_fips: countyFips,
                geometry : entry.geometry,
                emissions : facilityEmissions
            }

            facilityData[countyFips][facilityId] = facility;
        }

        else{
            //if year does not yet exist for facility
            if (!listedFacility.emissions[year]){
                listedFacility.emissions[year] = {};
            }

            listedFacility.emissions[year].total_direct = properties["Total Direct Emissions"];
            listedFacility.emissions[year].total_supplier = properties["Total Supplier Emissions"];
        }

    //  // output[countyFips].properties.push(facility);
    //  // output[countyFips].geometry.push(facilitiesArray[key]);
    //  output[countyFips].push(facility);

    // if (index < 1){
    //     console.log(facilityData[countyFips]);
    //     index++;
    // }

    }
    //console.log(output);
    return facilityData;
}
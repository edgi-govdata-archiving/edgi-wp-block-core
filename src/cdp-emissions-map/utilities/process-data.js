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

export function processStateData(rawData){
    var output = {};
    const stateDataArray = rawData["objects"]["data"]["geometries"];

    for (var stateKey in stateDataArray) {
        var source = stateDataArray[stateKey]["properties"]

        output[source.state_abbr] = {
            name: source.state_name,
            abbr: source.state_abbr,
            emissions: source.emissions
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
    return output;
}
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

export function getEmissionRange(data, emissionType){
    var range = [1000, 0];

    //console.log(data);

    for (var region in data) {
        var emissionsData = data[region].emissions;

        for (var year in emissionsData) {
            var yearData = emissionsData[year];
            var emissions = yearData[emissionType];

            //check if lower that min range
            if (emissions < range[0]){
                range[0] = emissions;
            }
            
            //check if higher than max range
            if (emissions > range[1]){
                range[1] = emissions;
            }
        }
    }

    console.log(range);
    return range;
}
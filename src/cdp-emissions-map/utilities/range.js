export default class Range{
	directRange;
	supplierRange;
	directRangeNoTexas;
	supplierRangeNoTexas;

	stateRange = {
		total_direct: {
			all: [],
			noTexas : []
		},
		total_supplier: {
			all: [],
			noTexas : []
		}
	};

	countyRange = {
		total_direct: {
			all: [],
			noTexas : []
		},
		total_supplier: {
			all: [],
			noTexas : []
		}
	};


	constructor(){
		
	}

	getStateRange(emissionType, includeTexas){
		if (includeTexas){
			return this.stateRange[emissionType].all;
		}
		else{
			return this.stateRange[emissionType].noTexas;
		}
		
	}

	setStateRange(data, includeTexas){
		if (includeTexas){
	    	this.stateRange.total_direct.all = this.getEmissionRange(data, "total_direct");
	    	this.stateRange.total_supplier.all = this.getEmissionRange(data, "total_supplier");
	    }
	    else{
	    	this.stateRange.total_direct.noTexas = this.getEmissionRange(data, "total_direct");
	    	this.stateRange.total_supplier.noTexas = this.getEmissionRange(data, "total_supplier");
	    }
	}


	getEmissionRange(data, emissionType){
    var range = [1000, 0];

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
    return range;
}
}


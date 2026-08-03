export default class Range{
	range = {
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

	getRange(emissionType, includeTexas){
		if (includeTexas){
			return this.range[emissionType].all;
		}
		else{
			return this.range[emissionType].noTexas;
		}
	}

	setRange(data, includeTexas){
		if (includeTexas){
	    	this.range.total_direct.all = this.getEmissionRange(data, "total_direct");
	    	this.range.total_supplier.all = this.getEmissionRange(data, "total_supplier");
	    }
	    else{
	    	this.range.total_direct.noTexas = this.getEmissionRange(data, "total_direct");
	    	this.range.total_supplier.noTexas = this.getEmissionRange(data, "total_supplier");
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
            if (emissions < range[0] && emissions >= 0){
                range[0] = emissions;
            }
            
            //check if higher than max range
            if (emissions > range[1]){
                range[1] = emissions;
            }

            // if (emissions < 0){
            // 	console.log(data[region]);
            // }
        }
    }
    console.log(range);
    return range;
	}
}


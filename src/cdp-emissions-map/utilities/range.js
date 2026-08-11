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

	setRange(data, includeTexas, facility=false){
		if (facility){
			if (includeTexas){
		    	this.range.total_direct.all = this.getFacilityRange(data, "total_direct");
		    	this.range.total_supplier.all = this.getFacilityRange(data, "total_supplier");
		    }
		    else{
		    	this.range.total_direct.noTexas = this.getFacilityRange(data, "total_direct");
		    	this.range.total_supplier.noTexas = this.getFacilityRange(data, "total_supplier");
		    }
		    
			// console.log("facility range: " + this.range.total_direct.all);
			// console.log("facility range: " + this.range.total_supplier.all);
			// console.log("facility range: " + this.range.total_direct.noTexas);
			// console.log("facility range: " + this.range.total_supplier.noTexas);

		}
		else{
			if (includeTexas){
		    	this.range.total_direct.all = this.getEmissionRange(data, "total_direct");
		    	this.range.total_supplier.all = this.getEmissionRange(data, "total_supplier");
		    }
		    else{
		    	this.range.total_direct.noTexas = this.getEmissionRange(data, "total_direct");
		    	this.range.total_supplier.noTexas = this.getEmissionRange(data, "total_supplier");
		    }
		}


	}

	getEmissionRange(data, emissionType, facility=false){
    var range = [1000, 0];

    var index = 0;
    if (facility){
		//console.log("facility emissions: " + data)
	}

    for (var region in data) {
        var emissionsData = data[region].emissions;

        if (facility){
        	//console.log("facility emissions data: " + emissionsData)
        }
        
        // if (index < 1){
    	// 	console.log(data[region].emissions);
    	// 	index++;
    	// }

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
    return range;
	}

	getFacilityRange(data, emissionType){
		//console.log("finding facility range for: " + emissionType);

	    var range = [1000, 0];

	    for (var county in data) {
	        var facilities = data[county];
	        var facilityRange = this.getEmissionRange(facilities, emissionType, true);
	        //console.log("facility range: " + facilityRange);

            //check if lower that min range
            if (facilityRange[0] < range[0] && facilityRange[0] >= 0){
                range[0] = facilityRange[0];
            }
            
            //check if higher than max range
            if (facilityRange[1] > range[1]){
                range[1] = facilityRange[1];
            }

            // if (emissions < 0){
            // 	console.log(data[region]);
            // }
	       
	    }
	    return range;
	}
}


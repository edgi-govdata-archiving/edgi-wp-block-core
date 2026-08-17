export function loadFacilityPaths(facilityGroup, facilityData, path, projection, year, range, emissionType, includeTexas, setCurrentFacility){
	let facilityPaths = facilityGroup
		.append("g")
		.selectAll("facility-path")
		.data(facilityData)
		.enter()
		.append("circle")
		.attr("cx", function(d) {
			return projection(d.geometry.coordinates)[0];

		})
		.attr("cy", function(d) {
			return projection(d.geometry.coordinates)[1];
		})
		.attr("r", function(d) {
			if (d.emissions[year] && d.emissions[year][emissionType]){
				return .5 + getScaledRadius(d.emissions[year][emissionType], range, emissionType, includeTexas) * 3;
			}
			return 0; //no data for this year / emission type
		})
		.attr("class", function(d) {
			if (emissionType == "total_direct" && d.is_direct_emitter){
				return "direct-facility";
			}
			else if (emissionType == "total_supplier" && d.is_supplier){
				return "supplier-facility";
			}
			else{
				return "hide-facility";
			}
		})
		.on("click", (event, d) => {
			event.stopPropagation();
			setCurrentFacility(d);
		})

	return facilityPaths;
}


export function resetFacilityPaths(facilityGroup){
	//countiesGroup.innerHTML = "";
	facilityGroup.selectAll(".direct-facility").remove();
	facilityGroup.selectAll(".supplier-facility").remove();
	// facilityGroup.transition()
	// .duration(200)
	// .style("opacity", 0);
}

function getScaledRadius(emissions, rangeObj, type, includeTexas){
	//console.log("range obj: " + JSON.stringify(rangeObj));
	if (includeTexas){
		return scale(emissions, rangeObj["range"][type].all);
	}
	else{
		return scale(emissions, rangeObj["range"][type].noTexas);
	}
}

//returns value between 0 and 1 mapped to scale
function scale(value, range){
	//console.log(range);
	//console.log("value: " + value);
	var result = (value - range[0]) / (range[1] - range[0]);
	//console.log("result: " + result);
	return (value - range[0]) / (range[1] - range[0])
}

export function selectFacility(facilityPaths, currentFacility, emissionType){
	facilityPaths
	.attr("class", (d) =>{
		var status = "";
		if (d.facility_id == currentFacility.facility_id){
			status = "-selected";
		}
		else{
			status = "-faded";
		}
		if (emissionType == "total_direct" && d.is_direct_emitter){
			return "direct-facility" + status;
		}
		else if (emissionType == "total_supplier" && d.is_supplier){
			return "supplier-facility" + status;
		}
		else{
			return "hide-facility";
		}

	});

}

export function deselectFacility(facilityPaths, emissionType){
	facilityPaths
	.attr("class", (d) =>{
		if (emissionType == "total_direct" && d.is_direct_emitter){
			return "direct-facility";
		}
		else if (emissionType == "total_supplier" && d.is_supplier){
			return "supplier-facility";
		}
		else{
			return "hide-facility";
		}
	});
}
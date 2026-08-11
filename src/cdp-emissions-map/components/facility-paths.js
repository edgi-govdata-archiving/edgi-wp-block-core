export function loadFacilityPaths(facilityGroup, facilityData, path, projection, year, range, emissionType, includeTexas){

	let facilityPaths = facilityGroup
		.append("g")
		.selectAll("facility-path")
		.data(facilityData)
		.enter()
		.append("circle")
		.attr("cx", function(d) {
			//console.log(d);
			// var point = projection(d.geometry.coordinates);
			// console.log(point)
			return projection(d.geometry.coordinates)[0];

		})
		.attr("cy", function(d) {
			return projection(d.geometry.coordinates)[1];
		})
		.attr("r", function(d) {
			return .25 + getScaledRadius(d.emissions[year][emissionType], range, emissionType, includeTexas) * 5;
			//return Math.min(1, Math.max(10, d.properties["Total Direct Emissions"] * .0001));
		})
		.attr("class", function(d) {
			//console.log(JSON.stringify(d))
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
			//emissionType == "total_direct" ? "direct-facility" : "supplier-facility")
		//attr("fill", "transparent" );

		// .append("g")
        // .attr("class", "facility-path")
        // .selectAll("path")
        // .data(facilityData)
        // .enter()
        // .append("path")
        // .attr("d", path)
		// .join("circle")
		// .attr("fill", "none")
		// .attr("stroke", "black");

        //.style("opacity", 1)
        // .attr("marker-end", "url(#triangle)")
        // .attr("class", emissionType == "total_direct" ? "direct-facility" : "supplier-facility")


          //    svg.append("svg:defs").append("svg:marker")
          // .attr("id", "triangle")
          // .attr("class", "facility-marker")
          // .attr("refX", .5)
          // .attr("refY", 4.5)
          // .attr("markerWidth", 1)
          // .attr("markerHeight", 1)
          // .attr("markerUnits","userSpaceOnUse")
          // .append("path")
          // .attr("d", "M 0 .5 .5 0 1 .5")
          // .style("fill", "#00000088");

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
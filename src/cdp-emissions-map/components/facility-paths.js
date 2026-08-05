export function setupFacilityPaths(facilityGroup, facilityData, path, projection, emissionType){

	let facilityPaths = facilityGroup
		.append("g")
		.selectAll("facility-path")
		.data(facilityData)
		.enter()
		.append("circle")
		.attr("cx", function(d) {
			// console.log(d.geometry.coordinates);
			// var point = projection(d.geometry.coordinates);
			// console.log(point)
			return projection(d.geometry.coordinates)[0];

		})
		.attr("cy", function(d) {
			return projection(d.geometry.coordinates)[1];
		})
		.attr("r", function(d) {
			//return Math.min(1, Math.max(10, d.properties["Total Direct Emissions"] * .0001));
			return 1;
		})
		.attr("class", emissionType == "total_direct" ? "direct-facility" : "supplier-facility")
		.attr("fill", "#00660088");

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
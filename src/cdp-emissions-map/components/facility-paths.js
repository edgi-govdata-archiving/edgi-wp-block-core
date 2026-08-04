export function setupFacilityPaths(facilityGroup, facilityData, path){
	let facilityPaths = facilityGroup
		.append("g")
        .attr("class", "facility-path")
        .selectAll("path")
        .data(facilityData)
        .enter()
        .append("path")
        .attr("marker-end", "url(#triangle)")
        .attr("class", "facility-path")
        .attr("d", path)
        .style("opacity", 1)

	return facilityPaths;
}


export function resetFacilityPaths(facilityGroup){
	//countiesGroup.innerHTML = "";
	facilityGroup.selectAll(".facility-path").remove();
	// facilityGroup.transition()
	// .duration(200)
	// .style("opacity", 0);
}
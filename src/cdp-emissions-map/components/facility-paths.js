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
        .attr("d", path);



		// .selectAll(".facility-path")
		// .data(facilityData)
		// .enter()
		// .append("circle")
		// .attr("class", "facility-path")
		// .attr("d", path)
		// .style("fill", "green");

		// .style("fill", (d) => {
		// 	// const abbr = getNameToAbbr(d.properties.name);
		// 	// return getStateColor(d.properties.name)
		// })
		// .on("click", (event, d) => {
		// 	event.stopPropagation();
		// 	const abbr = getNameToAbbr(d.properties.name);
		// 	if (abbr) setCurrentState(d, abbr);
		// })

	return facilityPaths;
}
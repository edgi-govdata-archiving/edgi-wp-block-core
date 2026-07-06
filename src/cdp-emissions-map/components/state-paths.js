export function setupStatePaths(statesGroup, stateData, path){
	let statePaths = statesGroup
		.selectAll(".state-boundary")
		.data(stateData)
		.enter()
		.append("path")
		.attr("class", "state-boundary")
		.attr("d", path)

	return statePaths;
}

export function zoomToFeature(mapGroup, path, width, height, feature){
	// Calculate zoom bounds
	const bounds = path.bounds(feature);
	const dx = bounds[1][0] - bounds[0][0];
	const dy = bounds[1][1] - bounds[0][1];
	const x = (bounds[0][0] + bounds[1][0]) / 2;
	const y = (bounds[0][1] + bounds[1][1]) / 2;

	// Standard padding scale
	const scale = Math.max(1, Math.min(50, 0.85 / Math.max(dx / width, dy / height)));
	const translate = [width / 2 - scale * x, height / 2 - scale * y];

	// 1. Zoom Transition
	mapGroup
	.transition()
	.duration(800)
	.attr("transform", `translate(${translate})scale(${scale})`);

	return scale;
}

export function resetZoom(mapGroup){
	// Reset zoom transformation
	mapGroup
		.transition()
		.duration(800)
		.attr("transform", "translate(0,0)scale(1)");
}
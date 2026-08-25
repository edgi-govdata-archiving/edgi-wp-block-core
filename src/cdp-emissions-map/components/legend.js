
var gradientLegend = `
	<section class="legend gradient-legend">
		<div class="gradient"></div>
		<div class="labels">
			<label id="low-label">low</label>
			<label id="middle-label">middle</label>
			<label id="high-label">high</label>
			<label id="unit-label">tCO₂e</label>
		</div>
    </section>`

export function setupLegend(container, range){
	return container.innerHTML = gradientLegend;
}
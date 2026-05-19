console.log('EDGI Map Block: Frontend script loaded!');

document.addEventListener('DOMContentLoaded', () => {
	const blocks = document.querySelectorAll('.edgi-visualization-dashboard');
	
	blocks.forEach(block => {
		const csvUrl = block.getAttribute('data-csv-url');
		const fipsCol = block.getAttribute('data-fips-col');
		const valueCol = block.getAttribute('data-value-col');
		const labelCol = block.getAttribute('data-label-col');
		
		if (!csvUrl) return;

		// Initialize D3 canvas container with placeholder content
		const mapCanvas = block.querySelector('.edgi-map-canvas');
		mapCanvas.innerHTML = `<p style="padding: 10px; border: 1px solid rgba(255,255,255,0.2); border-radius: 4px;">Loading data from <code>${csvUrl}</code>...</p>`;

		// D3.js & TopoJSON interactive map logic will run here on the frontend
	});
});

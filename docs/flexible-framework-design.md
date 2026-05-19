# Future-Proof Scaffolding for the EDGI Block Core Library (Archived Design)

*This document archives the flexible, multi-block parent-child dashboard architecture originally proposed by Ashok Sankaran. It is preserved here for future reference and improvement.*

---

## 1. Directory Structure: Parent-Child Blocks

To support a decoupled multi-block dashboard, three blocks would be scaffolded within the `src/` directory:
1. `edgi/map-dashboard` (The parent container that manages shared data, selected columns, and states)
2. `edgi/map` (The D3 map block)
3. `edgi/top-list` (The Top N list navigation block)

### Project Layout

```
edgi-wp-block-core/
├── package.json                   # Centralized wp-scripts and dev dependencies
├── edgi-wp-block-core.php         # Dynamically registers blocks in build/
├── assets/
│   └── maps/                      # Static TopoJSON maps
├── src/
│   ├── utils/
│   │   └── fips.js                # Shared FIPS string formatting utilities
│   ├── map-dashboard/             # PARENT CONTAINER BLOCK
│   ├── map/                       # CHILD BLOCK (D3 Map Engine)
│   └── top-list/                  # CHILD BLOCK (Sidebar List Component)
└── build/                         # Compiled assets folder (auto-generated)
```

---

## 2. Technical Linking Architecture (How Container Options Communicate)

### A. In the Gutenberg Editor (React)
The parent container (`edgi/map-dashboard`) holds the master attributes (CSV URL, column mappings, active selected FIPS string, visual color palette).
* It uses a **React Context Provider** in its `edit.js` file.
* The child blocks (`edgi/map` and `edgi/top-list`) wrap their editor components in Context Consumers to receive the parsed CSV data and FIPS selections.

### B. On the Public Frontend (DOM & JavaScript)
* The parent container renders a wrapper element with a unique ID: `<div class="edgi-dashboard-wrapper" id="edgi-dash-XYZ">`.
* The child blocks render inside this wrapper.
* The frontend runtime script (`view.js`) registers a state coordinator on the parent wrapper. Clicking an item in the List block dispatches a custom JavaScript event containing the selected FIPS string, which triggers the Map component to zoom in and load the sub-boundary map files.

---

## 3. FIPS Code Hierarchy & String Preservation Specification

To support visual mapping across all geographical granularities, the library will strictly treat FIPS codes as **Strings**. Because spreadsheets (Excel, Google Sheets) often strip leading zeroes (turning California's `"06"` into `6`), our parser will use a target-length padding utility based on the selected geography layer.

### FIPS Length Standards

| Geographic Level | FIPS String Length | Components & Formatting | Example FIPS Code |
| :--- | :---: | :--- | :---: |
| **State** | 2 | 2-digit State code (left-padded) | `"06"` (CA) |
| **Congressional District** | 4 | 2 (State) + 2 (District code) | `"0633"` (CA-33) |
| **County** | 5 | 2 (State) + 3 (County code) | `"06037"` (Los Angeles Co.) |
| **Census Tract** | 11 | 2 (State) + 3 (County) + 6 (Tract code) | `"06037137000"` |
| **Census Block Group** | 12 | 2 (State) + 3 (County) + 6 (Tract) + 1 (Block Group ID) | `"060371370001"` (Block Group 1) |
| **Census Block** | 15 | 2 (State) + 3 (County) + 6 (Tract) + 1 (Block Group ID) + 3 (Block ID)* | `"060371370001001"` (Block 1001) |

### Robust Zero-Padding Utility
```javascript
export function formatFIPS(rawVal, expectedLength) {
	if (rawVal === null || rawVal === undefined) {
		return '';
	}
	let fipsStr = String(rawVal).trim().split('.')[0];
	return fipsStr.padStart(expectedLength, '0');
}
```

---

## 4. Concrete Example: Mock State Name Length Dashboard

To illustrate how this flexible framework connects decoupled block components, let's look at a concrete implementation.

### The Objective
1. Display a **US Map** block and a **Top 10 List** block next to each other inside the **Dashboard Container**.
2. Map each state's FIPS code to a mock value representing the **length of the state's name** (e.g. California `"06"` ➔ `10`).
3. Clicking a state row in the Top 10 list triggers a D3 zoom transition in the map block to focus on that specific state.

### A. Mock Dataset
```json
[
  { "fips": "37", "name": "North Carolina", "value": 14 },
  { "fips": "42", "name": "Pennsylvania", "value": 12 },
  { "fips": "06", "name": "California", "value": 10 },
  { "fips": "36", "name": "New York", "value": 8 },
  { "fips": "17", "name": "Illinois", "value": 8 },
  { "fips": "26", "name": "Michigan", "value": 8 },
  { "fips": "12", "name": "Florida", "value": 7 },
  { "fips": "13", "name": "Georgia", "value": 7 },
  { "fips": "48", "name": "Texas", "value": 5 },
  { "fips": "39", "name": "Ohio", "value": 4 }
]
```

### B. Parent Container Block: Event Broker (`src/map-dashboard/view.js`)
On the frontend page, the parent container listens for events bubbling up from the Sidebar List block, coordinates the action, and directs the D3 Map block to zoom in.

```javascript
document.addEventListener('DOMContentLoaded', () => {
	// Find all dashboard wrappers on the page
	const dashboards = document.querySelectorAll('.wp-block-edgi-map-dashboard');
	
	dashboards.forEach(dashboard => {
		const dashboardId = dashboard.getAttribute('data-dashboard-id');
		
		// Listen for the select-state event bubbled up from the Top 10 List
		dashboard.addEventListener('edgi:select-state', (e) => {
			const { fips } = e.detail;
			console.log(`Dashboard ${dashboardId}: Selecting FIPS ${fips}`);
			
			// Find the Map component nested inside this specific dashboard
			const mapEl = dashboard.querySelector('.wp-block-edgi-map');
			if (mapEl) {
				// Dispatch custom zoom instruction to the D3 script
				mapEl.dispatchEvent(new CustomEvent('edgi:trigger-zoom', {
					detail: { fips }
				}));
			}
		});
	});
});
```

### C. Child Block 1: The Top 10 List (`src/top-list/view.js`)
Renders the mock ranking list on the page and dispatches selection events when items are clicked.

```javascript
document.querySelectorAll('.wp-block-edgi-top-list').forEach(listEl => {
	// Simple UI rendering using the Mock dataset
	const ul = document.createElement('ul');
	ul.className = 'edgi-sidebar-ranking-list';
	
	mockData.forEach((item, index) => {
		const li = document.createElement('li');
		li.className = 'rank-item';
		li.innerHTML = `<strong>#${index + 1} ${item.name}</strong> (Length: ${item.value})`;
		li.style.cursor = 'pointer';
		
		// Add click handler to select and trigger bubble event
		li.addEventListener('click', () => {
			// Find the parent dashboard wrapper in the DOM tree
			const dashboard = listEl.closest('.wp-block-edgi-map-dashboard');
			if (dashboard) {
				dashboard.dispatchEvent(new CustomEvent('edgi:select-state', {
					bubbles: true, // Allow event to bubble to the container
					detail: { fips: item.fips }
				}));
			}
		});
		
		ul.appendChild(li);
	});
	
	listEl.appendChild(ul);
});
```

### D. Child Block 2: The D3 Map Viewport (`src/map/view.js`)
Draws the D3 SVG state outline map on load, listens for zoom events forwarded by the container, and initiates a smooth SVG transition to zoom in on the state boundaries.

```javascript
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

document.querySelectorAll('.wp-block-edgi-map').forEach(mapEl => {
	const assetsUrl = mapEl.getAttribute('data-assets-url');
	
	// Fetch the static states map outline
	d3.json(`${assetsUrl}maps/us-states.json`).then(us => {
		const width = 600;
		const height = 400;
		
		const svg = d3.select(mapEl)
			.append('svg')
			.attr('viewBox', `0 0 ${width} ${height}`)
			.attr('width', '100%');
			
		const projection = d3.geoAlbersUsa()
			.translate([width / 2, height / 2])
			.scale(800);
			
		const path = d3.geoPath().projection(projection);
		const g = svg.append('g');
		
		// Draw US States base shapes
		g.selectAll('path')
			.data(topojson.feature(us, us.objects.states).features)
			.enter().append('path')
			.attr('d', path)
			.attr('class', 'state-shape')
			.attr('fill', '#f5f5f7')
			.attr('stroke', '#ffffff')
			.attr('stroke-width', 1.5);
			
		// Listen for the custom zoom trigger forwarded by the parent container
		mapEl.addEventListener('edgi:trigger-zoom', (e) => {
			const { fips } = e.detail;
			
			// Find the state outline matching the FIPS string
			const stateFeature = topojson.feature(us, us.objects.states)
				.features.find(d => String(d.id).padStart(2, '0') === fips);
				
			if (!stateFeature) return;
			
			// Calculate D3 bounding box and zoom matrix coefficients
			const bounds = path.bounds(stateFeature);
			const dx = bounds[1][0] - bounds[0][0];
			const dy = bounds[1][1] - bounds[0][1];
			const x = (bounds[0][0] + bounds[1][0]) / 2;
			const y = (bounds[0][1] + bounds[1][1]) / 2;
			
			const scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height)));
			const translate = [width / 2 - scale * x, height / 2 - scale * y];
			
			// Execute smooth D3 transform transition
			g.transition()
				.duration(750)
				.attr('transform', `translate(${translate})scale(${scale})`);
		});
	});
});
```


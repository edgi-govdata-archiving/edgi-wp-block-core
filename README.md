# EDGI Block Core Plugin

This WordPress plugin houses custom, interactive Gutenberg blocks designed to help environmental researchers visualize geospatial datasets (like toxicity scores, facility emissions, and water violations) directly in WordPress posts.

---

## 1. Local Development Setup

To begin developing or extending blocks in this library:

1. **Prerequisites:** Ensure you have [Node.js](https://nodejs.org/) (LTS version recommended) and a local WordPress development environment (e.g., LocalWP, DevKinsta, or Docker) installed.
2. **Install Dependencies:** Open your terminal in the plugin directory (`wp-content/plugins/edgi-wp-block-core/`) and run:
   ```bash
   npm install
   ```
3. **Start Development Watcher:** To automatically compile your files as you edit them, run:
   ```bash
   npm run start
   ```
4. **Compile Production Build:** To build minimized, optimized production assets, run:
   ```bash
   npm run build
   ```

---

## 2. How Block Registration Works (Dynamic Auto-Discovery)

This plugin uses a **PHP Glob-based Auto-Loader** inside `edgi-wp-block-core.php`. 
* The compiler (`@wordpress/scripts`) searches the `src/` folder for blocks, compiles their assets, and saves them to `build/[block-slug]/`.
* The PHP loader automatically scans the `build/` directory for subfolders containing `block.json` and registers them with WordPress.
* **Result:** Developers only write code inside `src/`. There is no need to write, edit, or configure any PHP code when registering new Gutenberg blocks.

---

## 3. Step-by-Step Guide to Scaffolding a New Gutenberg Block

Follow these steps to create a new Gutenberg block in the library:

### Step 1: Create a block folder
Under the `src/` directory, create a new folder named after your block's slug (use lowercase and hyphens only):
```bash
mkdir src/your-block-name
```

### Step 2: Define your metadata (`block.json`)
Create a `block.json` file inside `src/your-block-name/`. This is the single source of truth for the block.

```json
{
  "$schema": "https://schemas.wp.org/trunk/block.json",
  "apiVersion": 3,
  "name": "edgi/your-block-name",
  "title": "Your Block Display Title",
  "category": "widgets",
  "icon": "location-alt",
  "description": "Short description of what the block does.",
  "attributes": {
    "csvUrl": {
      "type": "string",
      "default": ""
    },
    "fipsCol": {
      "type": "string",
      "default": ""
    }
  },
  "editorScript": "file:./index.js",
  "viewScript": "file:./view.js",
  "style": "file:./style.scss"
}
```

> [!IMPORTANT]
> **Key Configuration Details:**
> * **`name`:** Must be in the format `namespace/slug` in all lowercase (e.g. `edgi/your-block-name`).
> * **`attributes`:** Declare all settings variables here so WordPress knows to save them to the database.
> * **`editorScript`:** The entry script for the Gutenberg edit screen (React).
> * **`viewScript`:** The script that runs **only on the public frontend page**. This is where your interactive D3 code goes. WordPress only loads this file when the block is active on the page, keeping load times fast.
> * **The `"file:"` Prefix:** You **must** prefix relative paths in script and style keys with `file:` (e.g. `file:./index.js`) or the build script will fail.

### Step 3: Create the block entrypoint (`index.js`)
Create `index.js` in `src/your-block-name/`. This file imports the metadata, registers the block within Gutenberg, and imports the SCSS style so webpack compiles and bundles it automatically.

```javascript
import { registerBlockType } from '@wordpress/blocks';
import edit from './edit';
import save from './save';
import metadata from './block.json';
import './style.scss'; // Critical: imports stylesheet so webpack bundles it as CSS

registerBlockType(metadata.name, {
	edit,
	save,
});
```

### Step 4: Create the Gutenberg editor layout (`edit.js`)
Create `edit.js` in `src/your-block-name/`. This script displays the editing panel in the WordPress admin dashboard. It uses React and WordPress's Inspector Controls components.

```javascript
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { TextControl, PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function Edit({ attributes, setAttributes }) {
	const { csvUrl, fipsCol } = attributes;

	return (
		<div {...useBlockProps()}>
			<InspectorControls>
				<PanelBody title={__('Data Source Settings', 'edgi')} initialOpen={true}>
					<TextControl
						label={__('Google Drive CSV Link', 'edgi')}
						value={csvUrl}
						onChange={(val) => setAttributes({ csvUrl: val })}
					/>
					<TextControl
						label={__('FIPS Column Header', 'edgi')}
						value={fipsCol}
						onChange={(val) => setAttributes({ fipsCol: val })}
					/>
				</PanelBody>
			</InspectorControls>
			<div className="edgi-block-placeholder">
				<p><strong>EDGI Map Visualization</strong></p>
				{csvUrl ? (
					<p>Source configured: <code>{csvUrl}</code></p>
				) : (
					<p>Please paste a Google Drive CSV Link in the block settings sidebar.</p>
				)}
			</div>
		</div>
	);
}
```

### Step 5: Create the database save layout (`save.js`)
Create `save.js` in `src/your-block-name/`. This defines the static HTML structure saved to the WordPress database. Since the actual map renders dynamically via D3 on the client-side, the save component simply outputs a wrapper element with the block attributes stored as HTML data-attributes.

```javascript
import { useBlockProps } from '@wordpress/block-editor';

export default function Save({ attributes }) {
	const { csvUrl, fipsCol } = attributes;
	
	return (
		<div 
			{...useBlockProps.save({ className: 'edgi-visualization-dashboard' })}
			data-csv-url={csvUrl}
			data-fips-col={fipsCol}
		>
			<div className="edgi-map-canvas"></div>
			<div className="edgi-top-ranking-sidebar"></div>
		</div>
	);
}
```

### Step 6: Create the D3 frontend runtime (`view.js`)
Create `view.js` in `src/your-block-name/`. This script executes **only on the public post page**. It reads the data attributes left by `save.js` and runs D3 to render the maps and bind click-to-zoom transitions.

```javascript
console.log('EDGI Map Block: Frontend script loaded!');

document.addEventListener('DOMContentLoaded', () => {
	const blocks = document.querySelectorAll('.edgi-visualization-dashboard');
	
	blocks.forEach(block => {
		const csvUrl = block.getAttribute('data-csv-url');
		const fipsCol = block.getAttribute('data-fips-col');
		
		if (!csvUrl) return;

		// Initialize D3 canvas container
		const mapCanvas = block.querySelector('.edgi-map-canvas');
		mapCanvas.innerHTML = `<p>Loading data from <code>${csvUrl}</code>...</p>`;

		// Your D3.js and TopoJSON logic goes here
	});
});
```

### Step 7: Create block styling (`style.scss`)
Create `style.scss` in `src/your-block-name/`. Use this file to define SCSS styles (which compile automatically to CSS). These styles are loaded in both the editor and the public site.

```scss
.edgi-visualization-dashboard {
	display: flex;
	gap: 20px;
	background: #121214;
	color: #ffffff;
	border-radius: 8px;
	padding: 20px;
	border: 1px solid rgba(255, 255, 255, 0.1);

	.edgi-map-canvas {
		flex: 2;
		min-height: 400px;
	}

	.edgi-top-ranking-sidebar {
		flex: 1;
		background: rgba(255, 255, 255, 0.05);
		border-radius: 6px;
		padding: 15px;
	}
}
```

### Step 8: Compile and test
In your terminal, compile the block:
```bash
npm run build
```
Once compilation completes successfully, log into your local WordPress site, edit a post, and you will see your block available for insertion.

---

## 4. Key Utilities for Geospatial Mapping (Shared Utility File)

To prevent code duplication, common helper functions are centralized in `src/utils.js` at the root of the source directory.

### 📦 How to Import Shared Utilities
Inside any block folder (e.g. `src/your-block-name/edit.js` or `view.js`), you can import shared utilities like this:
```javascript
import { getDirectDownloadURL, formatFIPS } from '../utils';
```

> [!NOTE]
> **Build Behavior:** 
> Webpack automatically bundles only the imported utilities directly into the block's `build/[block-slug]/[script].js` bundle. Because the `src/utils.js` file is outside any block folder and does not contain a `block.json`, the compiler will **not** register it as a standalone WordPress block.

### 🛠️ How to Code Utilities in `src/utils.js`
Always write utilities as **named exports** so developers can selectively import only what they need:

#### A. Google Drive URL Extractor
Google Drive share links do not output raw CSV file streams. Import and use this regex function to parse the URL and convert it to a direct download endpoint:
```javascript
export function getDirectDownloadURL(url) {
	if (!url) return '';
	
	// Format A: Google Sheets Link
	const sheetsMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
	if (sheetsMatch) {
		return `https://docs.google.com/spreadsheets/d/${sheetsMatch[1]}/export?format=csv`;
	}
	
	// Format B: Uploaded CSV File Link
	const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
	if (driveMatch) {
		return `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
	}
	
	return url;
}
```

#### B. Padded FIPS String Matching
US Census FIPS codes are strings where leading zeros are meaningful. To prevent spreadsheet programs from stripping leading zeros (e.g., converting `"06"` to `6`), always run FIPS data columns through this formatting utility:
```javascript
export function formatFIPS(rawVal, expectedLength) {
	if (rawVal === null || rawVal === undefined) return '';
	
	// Convert to string and strip decimal formatting (e.g. 6037.0)
	let fipsStr = String(rawVal).trim().split('.')[0];
	
	// Left-pad with zeros
	return fipsStr.padStart(expectedLength, '0');
}
```

---

## 5. Future Dashboard Decoupling Design
If the organization decides to upgrade this single block into a decoupled multi-block dashboard system in the future (where map controls, lists, and charts are separate drag-and-drop blocks communicating via React Context and Custom Events), refer to [docs/flexible-framework-design.md](file:///c:/Users/Ashok/Local%20Sites/7mjw2rpe2i0sr6c0p1ko-sbj-edgimain-live-prod-dl1903/app/public/wp-content/plugins/edgi-wp-block-core/docs/flexible-framework-design.md) for full architecture specifications.

---

## License & Copyright

Copyright (C) 2026 Environmental Data and Governance Initiative (EDGI)
This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, version 3.0.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

See the [`LICENSE`](/LICENSE) file for details.
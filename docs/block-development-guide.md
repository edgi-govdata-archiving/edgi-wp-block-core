# Gutenberg Block Development Guide

This guide details how to extend and develop new interactive visualization blocks inside this library.

---

## 1. Directory Structure of a Block

All custom blocks are placed in the `src/` directory. Each block is self-contained in its own folder:

```
src/your-block-slug/
├── block.json      # Metadata, settings attributes, and asset configurations
├── index.js        # Gutenberg block registration entrypoint
├── edit.js         # React admin editor interface settings
├── save.js         # Static HTML wrapper saved to the database (if dynamic, returns null)
└── style.scss      # Sass stylesheet loaded in the editor and frontend page
```

---

## 2. Step-by-Step Block Scaffolding

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
    }
  },
  "editorScript": "file:./index.js",
  "viewScript": "file:./view.js",
  "style": "file:./style.scss"
}
```

> [!IMPORTANT]
> **Key Configuration Rules:**
> * **`name`:** Must be in the format `namespace/slug` in all lowercase (e.g., `edgi/your-block-name`).
> * **`attributes`:** Declare all configuration settings here so WordPress serializes them.
> * **`viewScript`:** The script containing your D3 code that runs **only on the public frontend page**. WordPress only loads this script when the block is active on the page.
> * **The `"file:"` Prefix:** Relative paths in script and style keys must be prefixed with `file:`.

### Step 3: Create the block entrypoint (`index.js`)
Create `index.js` in `src/your-block-name/`. This file registers the block within Gutenberg and imports the SCSS style so Webpack processes it.

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
Create `edit.js` in `src/your-block-name/`. This displays the settings panel in the WordPress admin dashboard using React.

```javascript
import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { TextControl, PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function Edit({ attributes, setAttributes }) {
	const { csvUrl } = attributes;

	return (
		<div {...useBlockProps()}>
			<InspectorControls>
				<PanelBody title={__('Data Source Settings', 'edgi')} initialOpen={true}>
					<TextControl
						label={__('Google Drive CSV Link', 'edgi')}
						value={csvUrl}
						onChange={(val) => setAttributes({ csvUrl: val })}
					/>
				</PanelBody>
			</InspectorControls>
			<div className="edgi-block-placeholder" style={{ padding: '20px', border: '2px dashed #ccc', textAlign: 'center' }}>
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
For static blocks, return the React markup. For dynamic blocks that render via D3 client-side or a PHP render callback (like our map block), return `null` so WordPress delegates output to PHP:

```javascript
export default function Save() {
	return null;
}
```

---

## 3. Shared Mapping Utilities (`src/utils.js`)

To prevent code duplication, common helper functions are centralized in `src/utils.js` at the root of the source directory.

### 📦 How to Import Shared Utilities
Inside any block folder (e.g. `src/your-block-name/edit.js` or `view.js`), you can import shared utilities like this:
```javascript
import { getDirectDownloadURL, formatFIPS } from '../utils';
```

### 🛠️ Common Utilities Summary

#### A. Google Drive URL Extractor
Converts Google Sheet links or Google Drive file share links into raw CSV direct download streams:
```javascript
export function getDirectDownloadURL(url) {
	if (!url) return '';
	
	const sheetsMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
	if (sheetsMatch) {
		return `https://docs.google.com/spreadsheets/d/${sheetsMatch[1]}/export?format=csv`;
	}
	
	const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
	if (driveMatch) {
		return `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
	}
	
	return url;
}
```

#### B. Padded FIPS String Matching
Pads geographical identifier strings with leading zeros to maintain standard formatting:
```javascript
export function formatFIPS(rawVal, expectedLength) {
	if (rawVal === null || rawVal === undefined) return '';
	let fipsStr = String(rawVal).trim().split('.')[0];
	return fipsStr.padStart(expectedLength, '0');
}
```

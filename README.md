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

---

## 2. Developer Script Commands

We compile block assets using the `@wordpress/scripts` toolkit. The following scripts are configured:

* **Start Dev Watcher:** Automatically compiles code on save. Keep this running in a terminal during development:
  ```bash
  npm run start
  ```
* **Compile Production Build:** Builds minimized, optimized production-ready assets:
  ```bash
  npm run build
  ```
* **Run Local Testing Server:** Spins up a zero-dependency local static server on port `8080` to test blocks in the sandbox:
  ```bash
  npm run serve
  ```

---

## 3. How Block Registration Works

This plugin uses a **PHP Glob-based Auto-Loader** inside `edgi-wp-block-core.php`. 
* The compiler searches the `src/` folder for blocks, compiles their assets, and saves them to `build/[block-slug]/`.
* The PHP loader automatically scans the `build/` directory for subfolders containing `block.json` and registers them with WordPress.
* **Result:** Developers only write code inside `src/`. There is no need to manually register blocks in PHP files.

---

## 4. Documentation Index

Detailed guides are split into dedicated files inside the `docs/` folder for readability:

* [**Gutenberg Block Development Guide**](docs/block-development-guide.md): Step-by-step instructions on block scaffolding, folder structures, metadata rules, and importing shared utilities from `src/utils.js`.
* [**Local Sandbox Testing Guide**](docs/local-testing-guide.md): Details the high-speed local dev sandbox, CORS policies, dev-server configuration, and a testing checklist.
* [**Future Dashboard Decoupling Design**](docs/flexible-framework-design.md): Architectural specifications for splitting single blocks into a decoupled multi-block dashboard system in the future.

---

## 5. Active Blocks Summary

### Interactive Congressional Reports Map
* **Block Slug:** `congressional-report-cards`
* **Features:** Responsive light-themed US Map outlines. Zoom transitions on click, lazy-loading congressional district boundaries, interactive small-district helper buttons, Senator detail cards (2-column layout), and interactive offset hover tooltips with connecting dotted lines linking directly to PDF download sheets.
* **Metadata spreadsheet format:** See [docs/block-development-guide.md](docs/block-development-guide.md) for headers.
* **Assets:**
  * Outlines: `assets/maps/us-states.json` & `assets/maps/cb_2025_us_cd119_5m.json`
  * Default database metadata sheet: `assets/report-metadata.csv`

---

## License & Copyright

Copyright (C) 2026 Environmental Data and Governance Initiative (EDGI)
This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, version 3.0.

See the [`LICENSE`](/LICENSE) file for details.

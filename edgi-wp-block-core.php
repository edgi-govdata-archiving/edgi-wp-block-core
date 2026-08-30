<?php
/**
 * Plugin Name: EDGI Block Core
 * Description: Custom blocks for environmental data visualization.
 * Version: 1.0.0
 * Author: Environmental Data and Governance Initiative (EDGI)
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Automatically register all blocks found in the build directory
add_action( 'init', function() {
	$build_dir = __DIR__ . '/build';
	
	if ( ! is_dir( $build_dir ) ) {
		return;
	}

	$blocks = glob( $build_dir . '/*' );
	foreach ( $blocks as $block_path ) {
		if ( is_dir( $block_path ) && file_exists( $block_path . '/block.json' ) ) {
			$args = array();
			if ( basename( $block_path ) === 'congressional-report-cards' ) {
				$args['render_callback'] = 'edgi_render_us_state_map_block';
			}
			if ( basename( $block_path ) === 'cdp-emissions-map' ) {
				$args['render_callback'] = 'edgi_render_cdp_emissions_map_block';
			}
			register_block_type( $block_path, $args );
		}
	}
});

/**
 * Render callback for the US State Map block.
 */
function edgi_render_us_state_map_block( $attributes ) {
	$csv_url = ! empty( $attributes['csvUrl'] ) ? $attributes['csvUrl'] : plugins_url( 'assets/report-metadata.csv', __FILE__ );
	$states_json_url = plugins_url( 'assets/maps/us-states.json', __FILE__ );
	$districts_json_url = plugins_url( 'assets/maps/cb_2025_us_cd119_5m.json', __FILE__ );

	ob_start();
	?>
	<div 
		class="edgi-visualization-dashboard" 
		data-csv-url="<?php echo esc_url( $csv_url ); ?>"
		data-states-json-url="<?php echo esc_url( $states_json_url ); ?>"
		data-districts-json-url="<?php echo esc_url( $districts_json_url ); ?>"
	>
		<div class="edgi-map-container">
			<div class="edgi-map-header">
				<h3 class="edgi-map-title">Congressional Environmental Enforcement Report Cards</h3>
				<p class="edgi-map-subtitle">Click on any state to view its Senators, Congressional Districts, and local Representatives.</p>
			</div>
			
			<div class="edgi-map-layout">
				<div class="edgi-map-canvas-wrapper">
					<div class="edgi-map-controls">
						<button class="edgi-btn edgi-btn-reset" style="display: none;">&larr; Back to US Map</button>
					</div>
					<div class="edgi-map-canvas"></div>
				</div>
			</div>
			
			<div class="edgi-details-panel">
				<div class="edgi-details-placeholder">
					Select a state or district to view congressional representatives and reports.
				</div>
			</div>
		</div>
	</div>
	<?php
	return ob_get_clean();
}

/**
 * Render callback for the CDP Emissions 
 */
function edgi_render_cdp_emissions_map_block( $attributes ) {
	$states_json_url = plugins_url( 'assets/maps/us-states.json', __FILE__ );
	$counties_json_url = plugins_url( 'assets/maps/us-counties.json', __FILE__ );
	$states_ghg_json_url = plugins_url( 'assets/data/ghg_state.topojson', __FILE__ );
	$counties_ghg_url = plugins_url( 'assets/data/ghg_county.topojson', __FILE__ );

	$test_facility_url = plugins_url( 'assets/data/facilities/ghg_facilities_2010.geojson', __FILE__ );
	$facilities_ghg_url = plugins_url( 'assets/data/facilities/ghg_facilities_', __FILE__);

	$back_icon_url = plugins_url( 'assets/icons/back-icon.svg', __FILE__);
	$close_icon_url = plugins_url( 'assets/icons/close-icon.svg', __FILE__);
	
	ob_start();
	?>
    <div id="cdp-emissions-map"
         data-states-json-url="<?php echo esc_url( $states_json_url ); ?>"
         data-counties-json-url="<?php echo esc_url( $counties_json_url ); ?>"
         data-states-ghg-json-url="<?php echo esc_url( $states_ghg_json_url ); ?>"
         data-counties-ghg-url="<?php echo esc_url( $counties_ghg_url ); ?>"
         data-facilities-test="<?php echo esc_url( $test_facility_url ); ?>"
         data-facilities-name="<?php echo esc_url( $facilities_ghg_url ); ?>"
         data-facilities-file-type="geojson"
         facilities-start-year="2016"
         facilities-end-year="2023"
         back-icon-url="<?php echo esc_url( $back_icon_url ); ?>"
         close-icon-url="<?php echo esc_url( $close_icon_url ); ?>"
         >

        <div class="dashboard">
            <div class="map-wrapper">
                <div class="back-button-wrapper"></div>
                <div class="legend-wrapper"></div>
                <div class="map"></div>
            </div>
            <div class="message-wrapper"></div>
        </div>
    </div>
	<?php
	return ob_get_clean();
}
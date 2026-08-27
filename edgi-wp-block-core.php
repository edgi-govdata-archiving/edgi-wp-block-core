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
			register_block_type( $block_path, $args );
		}
	}
});

/**
 * Render callback for the US State Map block.
 */
function edgi_render_us_state_map_block( $attributes ) {
	$states_json_url = plugins_url( 'assets/maps/us-states.json', __FILE__ );
	$counties_json_url = plugins_url( 'assets/data/ghg_state.topojson', __FILE__ );
	$states_ghg_json_url = plugins_url( 'assets/data/ghg_county.topojson', __FILE__ );
	$counties_ghg_url = plugins_url( 'assets/data/ghg_county.topojson', __FILE__ );
	
	ob_start();
	?>
	<div class="sandbox-container">
        <div id="cdp-emissions-map"
             data-states-json-url="<?php echo esc_url( $states_json_url ); ?>"
             data-counties-json-url="<?php echo esc_url( $states_json_url ); ?>"
             data-states-ghg-json-url="<?php echo esc_url( $states_ghg_json_url ); ?>"
             data-counties-ghg-url="<?php echo esc_url( $counties_ghg_url ); ?>"
             data-facilities-name="./data/facilities/ghg_facilities_"
             data-facilities-file-type="geojson"
             facilities-start-year="2016"
             facilities-end-year="2023">

            <div class="dashboard">
                <div class="map-wrapper">
                    <div class="back-button-wrapper"></div>
                    <div class="legend-wrapper"></div>
                    <div class="map"></div>
                </div>
                <div class="message-wrapper"></div>
            </div>
        </div>
    </div>
	<?php
	return ob_get_clean();
}

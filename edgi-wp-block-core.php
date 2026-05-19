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
			register_block_type( $block_path );
		}
	}
});
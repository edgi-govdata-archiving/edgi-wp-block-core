import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { TextControl, PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function Edit({ attributes, setAttributes }) {
	const { csvUrl } = attributes;

	return (
		<div {...useBlockProps()}>
			<InspectorControls>
				<PanelBody title={__('Data Source Settings', 'edgi')} initialOpen={true}>
				</PanelBody>
			</InspectorControls>
			<div className="edgi-block-placeholder" style={{ padding: '20px', border: '2px dashed #afe0d7', background: '#f5fbf9', color: '#1f2d3d', textAlign: 'center', borderRadius: '4px' }}>
				<p style={{ margin: '0 0 10px 0', fontSize: '16px' }}><strong>EDGI CDP Emissions Map</strong></p>
			</div>
		</div>
	);
}

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
						label={__('Google Drive CSV Link (Optional override)', 'edgi')}
						value={csvUrl}
						onChange={(val) => setAttributes({ csvUrl: val })}
						help={__('Leave blank to use the default report-metadata.csv file in the plugin assets.', 'edgi')}
					/>
				</PanelBody>
			</InspectorControls>
			<div className="edgi-block-placeholder" style={{ padding: '20px', border: '2px dashed #afe0d7', background: '#f5fbf9', color: '#1f2d3d', textAlign: 'center', borderRadius: '4px' }}>
				<p style={{ margin: '0 0 10px 0', fontSize: '16px' }}><strong>EDGI Congressional Reports Map</strong></p>
				{csvUrl ? (
					<p style={{ margin: '0', fontSize: '13px' }}>Custom Source: <code>{csvUrl}</code></p>
				) : (
					<p style={{ margin: '0', fontSize: '13px', color: '#68829e' }}>Using Default: <code>assets/report-metadata.csv</code></p>
				)}
			</div>
		</div>
	);
}
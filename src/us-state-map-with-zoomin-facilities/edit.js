import { useBlockProps, InspectorControls } from '@wordpress/block-editor';
import { TextControl, PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default function Edit({ attributes, setAttributes }) {
	const { csvUrl, fipsCol, valueCol, labelCol } = attributes;

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
						label={__('FIPS/State Column Header', 'edgi')}
						value={fipsCol}
						onChange={(val) => setAttributes({ fipsCol: val })}
					/>
					<TextControl
						label={__('Value Column Header', 'edgi')}
						value={valueCol}
						onChange={(val) => setAttributes({ valueCol: val })}
					/>
					<TextControl
						label={__('Label/Name Column Header', 'edgi')}
						value={labelCol}
						onChange={(val) => setAttributes({ labelCol: val })}
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

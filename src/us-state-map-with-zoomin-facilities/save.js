import { useBlockProps } from '@wordpress/block-editor';

export default function Save({ attributes }) {
	const { csvUrl, fipsCol, valueCol, labelCol } = attributes;
	
	return (
		<div 
			{...useBlockProps.save({ className: 'edgi-visualization-dashboard' })}
			data-csv-url={csvUrl}
			data-fips-col={fipsCol}
			data-value-col={valueCol}
			data-label-col={labelCol}
		>
			<div className="edgi-map-canvas"></div>
			<div className="edgi-top-ranking-sidebar"></div>
		</div>
	);
}

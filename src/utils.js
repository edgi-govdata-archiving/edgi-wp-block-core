/**
 * Google Drive URL Extractor
 * Converts shareable Google Drive/Sheet links into raw CSV file streams.
 */
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

/**
 * Padded FIPS String Matching
 * Pads input geography identifier strings with leading zeros to maintain formatting standard.
 */
export function formatFIPS(rawVal, expectedLength) {
	if (rawVal === null || rawVal === undefined) return '';
	
	// Convert to string and strip decimal formatting (e.g. 6037.0)
	let fipsStr = String(rawVal).trim().split('.')[0];
	
	// Left-pad with zeros
	return fipsStr.padStart(expectedLength, '0');
}

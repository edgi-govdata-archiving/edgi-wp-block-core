export default `
    <div class="info-panel">
	<h3 id="currentState">Select state... </h3>
	<h3 id="stateEmissions"></h3>


    </div>
`; 

var countryInfoPanel = `
	<section class="info-panel country-view">
		<h2 id="info-header">United Sates</h2>
		<h5 id="info-status">2000 Supplier Emissions</h5>
		<h2>Top Emitting States</h2>
		<ol>
			<li>Alabama</li>
			<li>Alaska</li>
			<li>Arizona</li>
			<li>California</li>
			<li>Colorado</li>
		</ol>
		<h3 id="stateEmissions"></h3>
    </section>`

var stateInfoPanel = `
	<section class="info-panel state-view">
		<h2 id="info-header">Texas</h2>
		<h5 id="info-status">2000 Supplier Emissions</h5>
		<h1 id="emissions-total">12,345</h1>
		<label>tCO₂e<label>
		<h2>Top Emitting Counties</h2>
		<ol>
			<li>Anderson</li>
			<li>Andrews</li>
			<li>Angelina</li>
			<li>Aransas</li>
			<li>Archer</li>
		</ol>
		<h3 id="stateEmissions"></h3>
    </section>`

export function setupCountryInfo(){
	return countryInfoPanel;
} 

export function setupStateInfo(){
	return stateInfoPanel;
} 
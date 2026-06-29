var nameTest = "default value"

export default `
    <div class="info-panel">
	<h3 id="currentState">Select state... </h3>
	<h3 id="stateEmissions"></h3>


    </div>


`;  

export function test(value){
	console.log("running test...")
	nameTest = value;
}
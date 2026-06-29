var nameTest = "default value"

export default `
    <div class="info-panel">
	<h3 id="currentState">DEFAULT VALUE </h3>


    </div>


`;  

export function test(value){
	console.log("running test...")
	nameTest = value;
}
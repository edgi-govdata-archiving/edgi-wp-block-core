const years = [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
var yearRange = [];

var timelineTemplate = `
    <div id="timelineSlider" class="timeline">

	<input id="yearslider" class="range blue" type="range" min="2016" value="2016" max="2025" step="1" list="years">
		<datalist id="ticks">
		    <option>2016</option>
		    <option>2017</option>
		    <option>2018</option>
		    <option>2019</option>
		    <option>2020</option>
		    <option>2021</option>
		    <option>2022</option>
		    <option>2023</option>
			<option>2024</option>
			<option>2025</option>
		</datalist>
    </div>
`

export function setupTimeline(container, updateYear){
	resetTimelineRange();

	container.insertAdjacentHTML("afterbegin", timelineTemplate);
	
	var yearSlider = document.querySelector("#yearslider");
	yearSlider.addEventListener("input", function() {
		var closest = getClosest(years, this.value);

		if (closest < yearRange[0]){
			closest = yearRange[0]; 
		}
		else if (closest > yearRange[1]){
			closest = yearRange[1]; 
		}
		this.value = closest;
		updateYear(this.value)
	});

}

//sets year range given 2 element array rangeArray: [minRange, maxRange]
export function setTimelineRange(rangeArray){ 
	yearRange = rangeArray;

	var options = document.querySelectorAll("option");

	//fades out labels of options out of range
	for (var i = 0; i < options.length; i++) {
		var option = options[i];
		var className = "";
	    if (option.innerHTML < yearRange[0] || option.innerHTML > yearRange[1]){
			className =  "disabled";
		}
	    option.className = className;
	}
}  

//resets timeline range to default
export function resetTimelineRange(){
	yearRange[0] = years[0];
	yearRange[1] = years[years.length - 1];

	var options = document.querySelectorAll("option");

	//resets labels
	for (var i = 0; i < options.length; i++) {
		options[i].className = "";
	}
}

function getClosest(arr, val) {
	return arr.reduce(function (prev, curr) {
    return (Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev);
  });
}

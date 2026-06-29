export default `
    <div id="timelineSlider" class="timeline">

	<input id="yearslider" class="range blue" type="range" min="2000" value="2000" max="2002" step="1" list="years">
		<datalist id="ticks">
	    <option>2010</option>
	    <option>2011</option>
	    <option>2012</option>
	</datalist>
	<!-- <output id="rangevalue">2000</output> -->
    </div>

    <script>
		let years = [2010,2011,2012];

		function getClosest(arr, val) {
			return arr.reduce(function (prev, curr) {
		    return (Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev);
		  });
		}

		document.querySelector("#yearslider").addEventListener("change", function() {
			let closest = getClosest(years, this.value);
		  this.value = document.querySelector("#rangevalue").value = closest;
		});

    </script>
`;  
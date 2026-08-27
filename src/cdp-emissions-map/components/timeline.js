export default `
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
	<!-- <output id="rangevalue">2000</output> -->
    </div>

    <script>
		let years = [2016,2017,2018,2019,2020,2021,2022,2023,2024,2025];

		function getClosest(arr, val) {
			return arr.reduce(function (prev, curr) {
		    return (Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev);
		  });
		}

		document.querySelector("#yearslider").addEventListener("input", function() {
			let closest = getClosest(years, this.value);
		  this.value = document.querySelector("#rangevalue").value = closest;
		});

    </script>
`;  


export default `
    <div id="timelineSlider" class="timeline">

	<input id="yearslider" class="range blue" type="range" min="2010" value="2000" max="2023" step="1" list="years">
		<datalist id="ticks">
	    <option>2010</option>
	    <option>2011</option>
	    <option>2012</option>
	    <option>2013</option>
	    <option>2014</option>
	    <option>2015</option>
	    <option>2016</option>
	    <option>2017</option>
	    <option>2018</option>
	    <option>2019</option>
	    <option>2020</option>
	    <option>2021</option>
	    <option>2022</option>
	    <option>2023</option>
	</datalist>
	<!-- <output id="rangevalue">2000</output> -->
    </div>

    <script>
		let years = [2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023];

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
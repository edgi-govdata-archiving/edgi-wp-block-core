var toggleTemplate = `
	<div id="toggles">
		<div id="emission-toggle-group" class="toggle-group">
			<div class="toggle">
			    <input id="emission-toggle" type="checkbox" class="checkbox">
			    <label for="checkbox" class="hidden-label">
			        <span class="switch"></span>
			    </label>
			</div>
			<div class="label-group">
				<label>Direct Emitters</label>
				<label>Suppliers</label>
			</div>
		</div>
		<div id="texas-toggle-group" class="toggle-group">
			<div class="toggle">
			    <input id="texas-toggle" type="checkbox" class="checkbox">
			    <label for="checkbox" class="hidden-label">
			        <span class="switch"></span>
			    </label>
			</div>
			<div class="label-group">
				<label>Include Texas</label>
			</div>
		</div>
	</div>
`;  

export function loadToggles(controlContainer, toggleEmissionsType, toggleTexas){
	controlContainer.insertAdjacentHTML("beforeend", toggleTemplate);

	controlContainer.querySelector("#emission-toggle").addEventListener("change", function() {
  		toggleEmissionsType();
  	});

  	controlContainer.querySelector("#texas-toggle").addEventListener("change", function() {
	  	toggleTexas();
	  });

  	return controlContainer.querySelector("#toggles");
}

export function lockToggles(toggles){
	toggles.style.opacity = .3;
	toggles.style.pointerEvents = "none";
}

export function unlockToggles(toggles){
	toggles.style.opacity = 1;
	toggles.style.pointerEvents = "auto";
}


export function lockTexasToggle(toggles){
	var texasToggle = toggles.querySelector("#texas-toggle-group");
	texasToggle.style.opacity = .3;
	texasToggle.style.pointerEvents = "none";
}

export function unlockTexasToggle(toggles){
	var texasToggle = toggles.querySelector("#texas-toggle-group");
	texasToggle.style.opacity = 1;
	texasToggle.style.pointerEvents = "auto";
}

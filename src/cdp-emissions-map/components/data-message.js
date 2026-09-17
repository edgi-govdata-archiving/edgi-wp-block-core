var dataMessageTemplate = 
	`<section id="data-message">
		<div>
			<h1>Data not found.</h1>
			<h3>The EPA has not released GHGRP data past 2023 and currently plans to end the program. </h3>
		</div>
	</section>`


export function loadDataMessage(container){
	container.innerHTML = dataMessageTemplate;
	var dataMessage = container.querySelector("#data-message");
	return dataMessage;
}

export function showDataMessage(dataMessage, mapWrapper){
	dataMessage.style.opacity = 1;
	mapWrapper.style.opacity = .3;
	mapWrapper.style.pointerEvents = "none";
}

export function hideDataMessage(dataMessage, mapWrapper){
	dataMessage.style.opacity = 0;
	mapWrapper.style.opacity = 1;
	mapWrapper.style.pointerEvents = "auto";
}



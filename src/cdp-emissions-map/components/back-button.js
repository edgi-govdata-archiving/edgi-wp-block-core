var backButton = 
	`<button id="back-button">
		<img src="../assets/icons/back-icon.svg" />
	</button>`


export function setupBackButton(container, goBack){
	container.innerHTML = backButton;
	var button = container.querySelector("#back-button");

	button.addEventListener("click", () => {
	    	goBack();
	  	});

	return button;
}

export function hideBackButton(button){
	button.style.opacity = 0;
}

export function showBackButton(button){
	button.style.opacity = 1;
}


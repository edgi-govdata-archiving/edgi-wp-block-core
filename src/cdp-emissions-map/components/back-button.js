var backButton = 
	`<button id="back-button">
		<img/>
	</button>`


export function setupBackButton(dashboard, container, goBack){
	container.innerHTML = backButton;
	var button = container.querySelector("#back-button");

	const backIconUrl = dashboard.getAttribute("back-icon-url");
	var icon = button.querySelector("img");
	icon.src = backIconUrl;

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


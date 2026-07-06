import * as d3 from "d3";
import * as topojson from "topojson-client";


import { getNameToAbbr } from "./utilities/convert.js"
import { getScaledColor, getDirectColor, getSupplierColor } from "./utilities/colors.js"
import SMALL_STATES from "./utilities/special-states.js"
const smallStates = SMALL_STATES["SMALL_STATES"];

import IRREGULAR_STATES from "./utilities/special-states.js"
const irregularStates = IRREGULAR_STATES["IRREGULAR_STATES"];

import timeline from './components/timeline.js';
import infoPanel from './components/info-panel.js';
import toggle from './components/toggle.js';
import callout from './components/callout.js';
import { initializeCallout } from './components/callout.js';
import { setupStateLabels } from './components/state-labels.js';

var infoPanelContainer;
var statePaths;
var currentStateLabel;
var currentEmissionsLabel;
var currentYear = 2010;
var currentStateAbbr = "";
var emissionType = "total_direct" //or "total_supplier"
var stateData = {};

var testColor = getDirectColor(5, [0, 10]);
console.log("testColor: " + testColor);

function getStateColor(name){
  var abbr = getNameToAbbr(name);
  const currentStateData = stateData[abbr];
  var yearString = currentYear.toString()
  var emissionsData = currentStateData["emissions"][yearString];

  if (emissionsData){
    var emissions = emissionsData[emissionType];

    if (emissionType == "total_direct"){
      return getDirectColor(emissions, [0, 500000000])
    }
    else{
      return getSupplierColor(emissions, [0, 500000000])
    }
  }
  else{
    return "#ffffff"
  }

  //const emissions = currentStateData["emissions"]["2010"][emissionType];


  
}

function updateYear(year){
  currentYear = year;

  if (currentStateAbbr != ""){
    updateDetailsPanel(currentStateAbbr, currentYear)
  }

  updateChoropleth();
}

function updateDetailsPanel(stateAbbr, year) {
  //console.log(stateData)
  console.log("updating: " + stateAbbr)

  currentStateAbbr = stateAbbr;
  const currentState = stateData[stateAbbr];

  if (!currentState) {
    return;
  }
  else {
    console.log(currentState)
  }

  const emissions = currentState["emissions"][year][emissionType];
  const stateName = currentState.name;

  //infoPanel.test = stateName;
  currentStateLabel.innerHTML = stateName

  if (emissionType == "total_direct"){
    currentEmissionsLabel.innerHTML = "Direct emissions: " + emissions;
  }
  else{
    currentEmissionsLabel.innerHTML = "Supplier emissions: " + emissions;
  }
}

function updateChoropleth(){
   statePaths.style("fill", (d) => {
              const abbr = getNameToAbbr(d.properties.name);
              return getStateColor(d.properties.name)
          });
}

function resetState() {
  currentStateAbbr = "";
  currentStateLabel.innerHTML = "Select state..."
  currentEmissionsLabel.innerHTML = ""
}

function toggleEmissionsType(){
  if (emissionType == "total_direct"){
    emissionType = "total_supplier";
  }
  else{
    emissionType = "total_direct";
  }

  updateDetailsPanel(currentStateAbbr, currentYear);
  updateChoropleth();
}


document.addEventListener("DOMContentLoaded", () => {
  const dashboards = document.querySelectorAll(".edgi-visualization-dashboard");

  dashboards.forEach((dashboard) => {
    const csvUrl = dashboard.getAttribute("data-csv-url");
      const statesJsonUrl = dashboard.getAttribute("data-states-json-url");
      const stateGHGUrl = dashboard.getAttribute("data-states-ghg-json-url"); 
      const stateEmissionsUrl = dashboard.getAttribute("data-states-emissions-url");

      if (!csvUrl || !statesJsonUrl || !stateGHGUrl) { // || !stateEmissionsUrl
      console.error("CDP Map Dashboard: Missing required data attributes!");
      return;
    }

    // Initialize tooltips
    let tooltip = document.querySelector(".edgi-map-tooltip");
    if (!tooltip) {
      tooltip = document.createElement("div");
      tooltip.className = "edgi-map-tooltip";
      document.body.appendChild(tooltip);
    }

    // Containers
    const mapContainer = dashboard.querySelector(".edgi-map-layout");

    const canvasContainer = dashboard.querySelector(".edgi-map-canvas");
    const detailsPanel = dashboard.querySelector(".details-panel");
    const resetBtn = dashboard.querySelector(".edgi-btn-reset");
    const wrapper = dashboard.querySelector(".edgi-map-canvas-wrapper");

    infoPanelContainer = document.createElement("div");
    infoPanelContainer.innerHTML = infoPanel;
    wrapper.appendChild(infoPanelContainer);
    currentStateLabel = infoPanelContainer.querySelector("#currentState")
    currentEmissionsLabel = infoPanelContainer.querySelector("#stateEmissions")
    //currentStateLabel.value = 'Hello there!';

      
    
    let timelineContainer = document.createElement("div");
    timelineContainer.innerHTML = timeline;
    dashboard.appendChild(timelineContainer);

    document.querySelector("#yearslider").addEventListener("change", function() {
      console.log(this.value)
      updateYear(this.value)
    });


    let toggleContainer = document.createElement("div");
    toggleContainer.innerHTML = toggle;
    dashboard.appendChild(toggleContainer);

    document.querySelector("#toggle").addEventListener("change", function() {
      console.log("toggled!")
      toggleEmissionsType();
    });


    let helperContainer = dashboard.querySelector(
      ".edgi-small-districts-helper",
    );
    if (!helperContainer && wrapper) {
      helperContainer = document.createElement("div");
      helperContainer.className = "edgi-small-districts-helper";
      wrapper.appendChild(helperContainer);
    }

    canvasContainer.innerHTML =
      '<div style="padding: 20px; font-weight:300; color:#afe0d7;">Loading environmental data and maps...</div>';

      //timeline.innerHTML = timelineHTML;
    // Load resources
    Promise.all([
      d3.csv(csvUrl),
      d3.json(statesJsonUrl),
      d3.json(stateGHGUrl),
              //d3.json(stateEmissionsUrl),
    ])
        .then(([csvData, statesTopo, stateGHGUrl]) => {
        canvasContainer.innerHTML = "";

        // 1. Process data for fast lookup
            const stateDataArray = stateGHGUrl["objects"]["data"]["geometries"];
            //console.log(stateDataArray)

            for (var stateKey in stateDataArray) {
                var source = stateDataArray[stateKey]["properties"]
               //console.log(source)

                stateData[source.state_abbr] = {

                    name: source.state_name,
                    abbr: source.state_abbr,
                    emissions: source.emissions
                }
                
            }

        // 2. Setup D3 canvas dimensions
        const width = 960;
        const height = 600;

        const svg = d3
          .create("svg")
          .attr("viewBox", `0 0 ${width} ${height}`)
          .attr("width", "100%")
          .attr("height", "100%");

        canvasContainer.appendChild(svg.node());

        // Draw projection
        const projection = d3
          .geoAlbersUsa()
          .translate([width / 2, height / 2])
          .scale(1150);

        const path = d3.geoPath().projection(projection);

        // Extract GeoJSON features
        const statesFeatures = topojson.feature(
          statesTopo,
          statesTopo.objects.states,
        ).features;


        // Base map group
        const mapGroup = svg.append("g").attr("class", "map-group");
         const statesGroup = mapGroup.append("g").attr("class", "states-group");
         const labelsGroup = mapGroup.append("g").attr("class", "labels-group");

        // Callouts group (rendered outside mapGroup so it doesn't scale/zoom)
        const calloutsGroup = svg.append("g").attr("class", "callouts-group");

        let activeState = null;

        // 3. Render States
        statePaths = statesGroup
          .selectAll(".state-boundary")
          .data(statesFeatures)
          .enter()
          .append("path")
          .attr("class", "state-boundary")
          .attr("d", path)
          .style("fill", (d) => {
              const abbr = getNameToAbbr(d.properties.name);
              //console.log(d.properties.name)

              return getStateColor(d.properties.name)
          })
          .on("click", (event, d) => {
            event.stopPropagation();
            const abbr = getNameToAbbr(d.properties.name);
            if (abbr) zoomToState(d, abbr);
          });

        //console.log(statePaths)
        const stateLabels = setupStateLabels(labelsGroup, statesFeatures, path)

        for (const [smallAbbr, smallData] of Object.entries(smallStates)){ 
          const feature = statesFeatures.find(
              (f) => getNameToAbbr(f.properties.name) === smallAbbr,
          );
          if (!feature) return;

          const centroid = path.centroid(feature);
          if (!centroid) return;


          let pill = initializeCallout(calloutsGroup, smallData, smallAbbr, centroid);

          pill.on("click", (event) => {
              event.stopPropagation();
              zoomToState(feature, smallAbbr);
            })
            .on("mouseover", () => {
              statesGroup
                .selectAll(".state-boundary")
                  .filter((f) => getNameToAbbr(f.properties.name) === smallAbbr)
                .classed("hover", true);
            })
            .on("mouseout", () => {
              statesGroup.selectAll(".state-boundary").classed("hover", false);
            });
        };

        // Reset Zoom action
        resetBtn.addEventListener("click", () => {
          resetMap();
        });

        svg.on("click", () => {
          resetMap();
        });

        // Zoom to State implementation
        function zoomToState(feature, stateAbbr) {
          activeState = stateAbbr;

          // Highlight callout pill if active
          calloutsGroup
            .selectAll(".state-callout-pill")
            .classed("active", (d) => d.abbr === stateAbbr);

          // Calculate zoom bounds
          const bounds = path.bounds(feature);
          const dx = bounds[1][0] - bounds[0][0];
          const dy = bounds[1][1] - bounds[0][1];
          const x = (bounds[0][0] + bounds[1][0]) / 2;
          const y = (bounds[0][1] + bounds[1][1]) / 2;

          // Standard padding scale
          const scale = Math.max(
            1,
            Math.min(8, 0.85 / Math.max(dx / width, dy / height)),
          );
          const translate = [width / 2 - scale * x, height / 2 - scale * y];

          // 1. Zoom Transition
          mapGroup
            .transition()
            .duration(800)
            .attr("transform", `translate(${translate})scale(${scale})`);

          // Thin outline stroke when zoomed in
          statePaths
            .transition()
            .duration(800)
            .style("stroke-width", `${1.5 / scale}px`);

          // Fade out other states
          statePaths
            .transition()
            .duration(400)
            .style("opacity", (d) =>
                getNameToAbbr(d.properties.name) === stateAbbr ? 1 : 0.4,
            )
            .attr(
              "class",
              (d) =>
                `state-boundary${
                  getNameToAbbr(d.properties.name) === stateAbbr ? " active" : ""
                }`,
            );

          // Hide state labels
          stateLabels.transition().duration(200).style("opacity", 0);

          // Hide callouts group
          calloutsGroup
            .transition()
            .duration(200)
            .style("opacity", 0)
            .style("pointer-events", "none");

          // Show Reset Button
          resetBtn.style.display = "flex";


          // 3. Update Details Panel header & senators
          updateDetailsPanel(stateAbbr, currentYear);
        }

        // Reset Map function
        function resetMap() {
          resetState();
          activeState = null;

          // Clear active state callout highlights
          calloutsGroup
            .selectAll(".state-callout-pill")
            .classed("active", false);

          // Reset zoom transformation
          mapGroup
            .transition()
            .duration(800)
            .attr("transform", "translate(0,0)scale(1)");

          // Restore state outline stroke width and opacity
          statePaths
            .transition()
            .duration(800)
            .style("stroke-width", "1px")
            .style("opacity", 1)
            .attr("class", "state-boundary");

          // Restore callouts group visibility
          calloutsGroup
            .transition()
            .duration(400)
            .style("opacity", 1)
            .style("pointer-events", "auto");

          // Restore state labels
          stateLabels.transition().delay(400).duration(400).style("opacity", 1);


          // Hide helper buttons container
          if (helperContainer) {
            helperContainer.innerHTML = "";
            helperContainer.style.display = "none";
          }

          // Hide Reset Button
          resetBtn.style.display = "none";
          tooltip.style.display = "none";

        }
      })
      .catch((err) => {
        console.error(
          "EDGI Map Dashboard: Error loading visualization resources:",
          err,
        );
        canvasContainer.innerHTML = `
				<div style="padding: 20px; color:#e74c3c;">
					<p>Error loading map resources. Please make sure the plugin files are fully uploaded.</p>
					<small>${err.message}</small>
				</div>
			`;
      });
  });
});

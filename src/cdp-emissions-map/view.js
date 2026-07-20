import * as d3 from "d3";
import * as topojson from "topojson-client";

import { processStateData, processCountyData } from "./utilities/process-data.js"
import { getNameToAbbr, getStateToFips } from "./utilities/convert.js"
import { getScaledColor, getDirectColor, getSupplierColor } from "./utilities/colors.js"
import SMALL_STATES from "./utilities/special-states.js"
const smallStates = SMALL_STATES["SMALL_STATES"];

import IRREGULAR_STATES from "./utilities/special-states.js"
const irregularStates = IRREGULAR_STATES["IRREGULAR_STATES"];

import timeline from './components/timeline.js';
import { setupCountryInfo, setupStateInfo } from './components/info-panel.js';
import toggle from './components/toggle.js';
import callout from './components/callout-group.js';
import { setupStatePaths, stateHover, exitStateHover, zoomInStates, zoomOutStates} from './components/state-paths.js';

import { setupStateLabels } from './components/state-labels.js';
import { setupCallouts, setupPillInteraction, showCallouts, hideCallouts, resetCallouts } from './components/callout-group.js';

var infoPanelContainer;
var statePaths;
var currentStateLabel;
var currentEmissionsLabel;
var currentYear = 2016;
var currentStateAbbr = "";
var emissionType = "total_direct" //or "total_supplier"
var stateData = {};
var countyData = {};

var countiesFeatures = {}
var countiesGroup;
var countyPaths;

var path;

var zoomed = false;


function renderCountiesForState(stateAbbr, scale) {
  const stateFips = getStateToFips(stateAbbr);

  // Clear previous counties
  countiesGroup.selectAll(".county-boundary").remove();
  countiesGroup.selectAll(".county-tooltip-line").remove();
  countiesGroup.transition()
            .duration(200)
            .style("opacity", 0)

  if (!stateFips) return;

  const stateCounties = countiesFeatures.filter(
    (d) => {
      if (d.id){ 
        return d.id.substring(0,2) == stateFips
      }
      return false;
      }
    )

  // Draw county boundaries
  countyPaths = countiesGroup
    .selectAll(".county-boundary")
    .data(stateCounties)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("class", "county-boundary")
    .style("stroke-width", `${0.6 / scale}px`)

  countiesGroup.transition()
            .duration(200)
            .style("opacity", 1)


  updateCountyChoropleth();
  }

//returns color fill of state based on currrent type of emissions + year
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
}

//returns color fill of county based on currrent type of emissions + year
function getCountyColor(countyFips){
  const currentCountyData = countyData[countyFips];
  var yearString = currentYear.toString()
  var emissionsData = currentCountyData["emissions"][yearString];

  if (emissionsData){
    var emissions = emissionsData[emissionType];

    if (emissionType == "total_direct"){
      return getDirectColor(emissions, [0, 10000000])
    }
    else{
      return getSupplierColor(emissions, [0, 10000000])
    }
  }
  else{
    return "#ffffff"
  }
}

//updates current year of data
function updateYear(year){
  currentYear = year;

  if (currentStateAbbr != ""){
    updateInfoPanel(currentStateAbbr, currentYear)
  }

  if (zoomed){
     updateCountyChoropleth();
  }
  else{
     updateChoropleth();
  }
}

function updateInfoPanel(stateAbbr, year) {
  currentStateAbbr = stateAbbr;
  const currentState = stateData[stateAbbr];

  if (!currentState) {
    return;
  }

  const emissions = currentState["emissions"][year][emissionType];
  const stateName = currentState.name;

  infoPanelContainer.innerHTML = setupStateInfo();
  //currentStateLabel.innerHTML = stateName

  // if (emissionType == "total_direct"){
  //   currentEmissionsLabel.innerHTML = "Direct emissions: " + emissions;
  // }
  // else{
  //   currentEmissionsLabel.innerHTML = "Supplier emissions: " + emissions;
  // }
}

function updateChoropleth(){
   statePaths.style("fill", (d) => {
          const abbr = getNameToAbbr(d.properties.name);
          return getStateColor(d.properties.name)
      });
}

function updateCountyChoropleth(){
   countyPaths.style("fill", (d) => {
          return getCountyColor(d.id)   
      });
}

function resetState() {
  currentStateAbbr = "";
  
  infoPanelContainer.innerHTML = setupCountryInfo();
  // currentStateLabel.innerHTML = "Select state..."
  // currentEmissionsLabel.innerHTML = ""
}

function toggleEmissionsType(){
  if (emissionType == "total_direct"){
    emissionType = "total_supplier";
  }
  else{
    emissionType = "total_direct";
  }

  updateInfoPanel(currentStateAbbr, currentYear);
  if (zoomed){
     updateCountyChoropleth();
  }
  else{
     updateChoropleth();
  }
}


document.addEventListener("DOMContentLoaded", () => {
  const dashboards = document.querySelectorAll(".edgi-visualization-dashboard");

  dashboards.forEach((dashboard) => {
    const csvUrl = dashboard.getAttribute("data-csv-url");
      const statesJsonUrl = dashboard.getAttribute("data-states-json-url");
      const countiesJsonUrl = dashboard.getAttribute("data-counties-json-url");
      const stateGHGUrl = dashboard.getAttribute("data-states-ghg-json-url"); 
      const countyGHGUrl = dashboard.getAttribute("data-counties-ghg-url");

      if (!csvUrl || !statesJsonUrl || !countiesJsonUrl || !stateGHGUrl || !countyGHGUrl) {
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
    const resetBtn = dashboard.querySelector(".edgi-btn-reset");
    const wrapper = dashboard.querySelector(".edgi-map-canvas-wrapper");

    infoPanelContainer = document.createElement("div");
    infoPanelContainer.innerHTML = setupCountryInfo();
    wrapper.appendChild(infoPanelContainer);

    // currentStateLabel = infoPanelContainer.querySelector("#currentState")
    // currentEmissionsLabel = infoPanelContainer.querySelector("#stateEmissions")
    
    let timelineContainer = document.createElement("div");
    timelineContainer.innerHTML = timeline;
    dashboard.appendChild(timelineContainer);

    document.querySelector("#yearslider").addEventListener("change", function() {
      updateYear(this.value)
    });


    let toggleContainer = document.createElement("div");
    toggleContainer.innerHTML = toggle;
    dashboard.appendChild(toggleContainer);

    document.querySelector("#toggle").addEventListener("change", function() {
      toggleEmissionsType();
    });

    canvasContainer.innerHTML =
      '<div style="padding: 20px; font-weight:300; color:#afe0d7;">Loading environmental data and maps...</div>';

      //timeline.innerHTML = timelineHTML;
    // Load resources
    Promise.all([
      d3.csv(csvUrl),
      d3.json(statesJsonUrl),
      d3.json(countiesJsonUrl),
      d3.json(stateGHGUrl),
      d3.json(countyGHGUrl),
    ])
        .then(([csvData, statesTopo, countiesTopo, stateGHGUrl, countyGHGUrl]) => {
        canvasContainer.innerHTML = "";

        // 1. Process data for fast lookup
        stateData = processStateData(stateGHGUrl);
        countyData = processCountyData(countyGHGUrl);

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

        path = d3.geoPath().projection(projection);

        // Extract GeoJSON features
        const statesFeatures = topojson.feature(
          statesTopo,
          statesTopo.objects.states,
        ).features;

        countiesFeatures = topojson.feature(
          countiesTopo,
          countiesTopo.objects.counties,
        ).features;

        // Base map group
        const mapGroup = svg.append("g").attr("class", "map-group");
        const statesGroup = mapGroup.append("g").attr("class", "states-group");
        countiesGroup = mapGroup.append("g").attr("class", "counties-group");
        const labelsGroup = mapGroup.append("g").attr("class", "labels-group");

        // Callouts group (rendered outside mapGroup so it doesn't scale/zoom)
        const calloutsGroup = svg.append("g").attr("class", "callouts-group");

        let activeState = null;

        // 3. Render States
        statePaths = setupStatePaths(statesGroup, statesFeatures, path, getStateColor, zoomToState);

        const stateLabels = setupStateLabels(labelsGroup, statesFeatures, path)

        for (const [smallAbbr, smallData] of Object.entries(smallStates)){ 
          const feature = statesFeatures.find(
              (f) => getNameToAbbr(f.properties.name) === smallAbbr,
          );
          if (!feature) return;

          const centroid = path.centroid(feature);
          if (!centroid) return;


          let pill = setupCallouts(calloutsGroup, smallData, smallAbbr, centroid);
          setupPillInteraction(pill, feature, statesGroup, zoomToState, stateHover, exitStateHover);
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
          zoomed = true;
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
          const scale = Math.max(1, Math.min(8, 0.85 / Math.max(dx / width, dy / height)));
          const translate = [width / 2 - scale * x, height / 2 - scale * y];

          // 1. Zoom Transition
          mapGroup
            .transition()
            .duration(800)
            .attr("transform", `translate(${translate})scale(${scale})`);

          zoomInStates(statePaths, scale, stateAbbr)

          // Hide state labels
          stateLabels.transition().duration(200).style("opacity", 0);

          // Hide callouts group
          hideCallouts(calloutsGroup);

          // Show Reset Button
          resetBtn.style.display = "flex";

          // 2. Load Counties for Zoomed State
          renderCountiesForState(stateAbbr, scale);

          // 3. Update info panel
          updateInfoPanel(stateAbbr, currentYear);
        }

        // Reset Map function
        function resetMap() {
          resetState();
          activeState = null;
          zoomed = false;
          updateChoropleth();

          // Clear active state callout highlights
          resetCallouts(calloutsGroup);

          // Reset zoom transformation
          mapGroup
            .transition()
            .duration(800)
            .attr("transform", "translate(0,0)scale(1)");

          zoomOutStates(statePaths);

          countiesGroup.transition()
            .duration(200)
            .style("opacity", 0)

          // Restore callouts group visibility
          showCallouts(calloutsGroup);

          // Restore state labels
          stateLabels.transition().delay(400).duration(400).style("opacity", 1);

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

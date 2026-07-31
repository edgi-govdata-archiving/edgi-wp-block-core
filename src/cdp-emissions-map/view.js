import * as d3 from "d3";
import * as topojson from "topojson-client";

import { processStateData, processCountyData, sortCountiesIntoStates, getEmissionRange } from "./utilities/process-data.js"
import { getNameToAbbr, getStateToFips } from "./utilities/convert.js"
import { getScaledColor, getDirectColor, getSupplierColor } from "./utilities/colors.js"
import SMALL_STATES from "./utilities/special-states.js"
const smallStates = SMALL_STATES["SMALL_STATES"];

import IRREGULAR_STATES from "./utilities/special-states.js"
const irregularStates = IRREGULAR_STATES["IRREGULAR_STATES"];

import timeline from './components/timeline.js';
import { loadDefaultInfo, loadCountryInfo, loadStateInfo, loadCountyInfo } from './components/info-panel.js';
import toggles from './components/toggles.js';
import callout from './components/callout-group.js';
import { setupStatePaths, stateHover, exitStateHover, selectState, deselectState, hideTexas, showTexas} from './components/state-paths.js';
import { setupCountyPaths, resetCountyPaths, selectCounty, deselectCounty} from './components/county-paths.js';
import { zoomToFeature, resetZoom} from './components/map-zoom.js';

import { setupStateLabels, showStateLabels, hideStateLabels, hideTexasLabel } from './components/state-labels.js';
import { setupCallouts, setupPillInteraction, showCallouts, hideCallouts, resetCallouts } from './components/callout-group.js';

import Locale from "./utilities/locale.js"

var infoPanelContainer;
var statePaths;
var statePathsNoTexas;
var currentStateLabel;
var currentEmissionsLabel;
var currentYear = 2016;
var currentStateAbbr = "";
var emissionType = "total_direct" //or "total_supplier"

var stateData = {};
var stateDataNoTexas = {};
var countyData = {};

var countiesFeatures = {}
var countiesGroup;
var countyPaths;

var mapGroup;
var statesGroup;
var labelsGroup;
var stateLabels;
var calloutsGroup;
var resetBtn;

var path;

var zoomLevels = ["country", "state", "county", "facility"];
var currentZoomLevel = 0;
var currentZoomLabel = zoomLevels[currentZoomLevel]; 
var zoomed = false;

//D3 canvas dimensions
const width = 960;
const height = 600;

//range values - [min,max]
var directRange;
var supplierRange;
var directRangeNoTexas;
var supplierRangeNoTexas;

var includeTexas = true;

var scale = 1;

var currentState = {
  "abbr" : "",
  "id" : "",
  "path" : "",
}
var currentCounty = null;

function toggleTexas(){
  includeTexas = !includeTexas;

  console.log("includeTexas: " + includeTexas);
  console.log("currentZoomLevel: " + currentZoomLevel);

  if (currentZoomLevel == 0){
    if (!includeTexas){
      hideTexas(statePaths);
      hideTexasLabel(stateLabels);
    }
    else {
      console.log("showing texas...");
      showTexas(statePaths);
      showStateLabels(stateLabels, true);
    }
  }

  updateChoropleth();
  updateInfoPanel();

}

function calculateRanges(){
  var test = getEmissionRange(stateData, "total_direct");

  directRange = getEmissionRange(stateData, "total_direct");
  supplierRange = getEmissionRange(stateData, "total_supplier");

  directRangeNoTexas = getEmissionRange(stateDataNoTexas, "total_direct");
  supplierRangeNoTexas = getEmissionRange(stateDataNoTexas, "total_supplier");
}

function renderCountiesForState(stateAbbr, scale) {
  const stateFips = getStateToFips(stateAbbr);

  //resetCountyPaths(countiesGroup);

  if (!stateFips) return;

  const stateCounties = countiesFeatures.filter(
    (d) => {
      if (d.id){ 
        return d.id.substring(0,2) == stateFips
      }
      return false;
      }
    )

  //console.log("countyPaths: " + countyPaths)
  countyPaths = setupCountyPaths(countiesGroup, path, stateCounties, countyData, scale, setCurrentCounty)

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
      return getDirectColor(emissions, includeTexas ? directRange : directRangeNoTexas);
    }
    else{
      return getSupplierColor(emissions, includeTexas ? supplierRange : supplierRangeNoTexas);
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

  updateInfoPanel()
  updateChoropleth();
}

function updateInfoPanel() {
  // currentStateAbbr = stateAbbr;
  // const currentStateInfo = stateData[stateAbbr];

  // if (!currentStateInfo) {
  //   return;
  // }

  // const emissions = currentStateInfo["emissions"][currentYear][emissionType];
  // const stateName = currentStateInfo.name;

  if (currentZoomLevel == 0){
    infoPanelContainer = loadCountryInfo(infoPanelContainer, includeTexas ? stateData : stateDataNoTexas, currentYear, emissionType);
  }
  else if (currentZoomLevel == 1){
    infoPanelContainer = loadStateInfo(infoPanelContainer, currentState, currentYear, emissionType);
  }
  else if (currentZoomLevel == 2){
    infoPanelContainer = loadCountyInfo(infoPanelContainer, currentCounty, currentYear, emissionType);
  }
  //currentStateLabel.innerHTML = stateName

  // if (emissionType == "total_direct"){
  //   currentEmissionsLabel.innerHTML = "Direct emissions: " + emissions;
  // }
  // else{
  //   currentEmissionsLabel.innerHTML = "Supplier emissions: " + emissions;
  // }
}

function updateChoropleth(){
  if (currentZoomLevel == 0){
    updateStateChoropleth();
  }
  else if (currentZoomLevel == 1){
    updateCountyChoropleth();
  }
}

function updateStateChoropleth(){
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
  currentState = null;
  currentStateAbbr = "";
  
  updateInfoPanel();
  // currentStateLabel.innerHTML = "Select state..."
  // currentEmissionsLabel.innerHTML = ""
}

function resetCounty() {
  currentCounty = null;
  updateInfoPanel();
  
  //infoPanelContainer.innerHTML = loadStateInfo();
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

  updateInfoPanel();
  updateChoropleth();
}

function setCurrentState(feature, stateAbbr){
  if (currentZoomLevel == 0){ //can only select county from state view
    currentState = new Locale(feature.id);
    currentState.abbr = stateAbbr;
    currentState.name = feature.properties.name;
    currentState.feature = feature;
    currentState.data = stateData[stateAbbr];

    //console.log(feature);

    zoomToState();
  }
}

function setCurrentCounty(feature, countyId){
  if (currentZoomLevel == 1){ //can only select county from state view
    currentCounty = new Locale(countyId);
    currentCounty.name = feature.properties.name + " County";
    currentCounty.feature = feature;
    currentCounty.data = countyData[countyId];

    //console.log(currentCounty.name);

    zoomToCounty();
  }
}

// Zoom to State implementation
function zoomToState() {
  currentZoomLevel = 1;

  // Highlight callout pill if active
  calloutsGroup
    .selectAll(".state-callout-pill")
    .classed("active", (d) => d.abbr === currentState.abbr);

  scale = zoomToFeature(mapGroup, path, width, height, currentState.feature);

  selectState(statePaths, scale, currentState.abbr)
  hideStateLabels(stateLabels);
  hideCallouts(calloutsGroup);
  renderCountiesForState(currentState.abbr, scale);
  updateInfoPanel();

  // Show Reset Button
  resetBtn.style.display = "flex";
}


function zoomToCounty() {
  currentZoomLevel = 2;

  scale = zoomToFeature(mapGroup, path, width, height, currentCounty.feature);


  selectCounty(countyPaths, scale, currentCounty.id)
  
  updateInfoPanel();

  // Show Reset Button
  resetBtn.style.display = "flex";
  
}


function zoomOutState() {
  currentZoomLevel = 0;
  resetState();
  zoomed = false;
  updateChoropleth();

  // Clear active state callout highlights
  resetCallouts(calloutsGroup);
  resetZoom(mapGroup);
  deselectState(statePaths, includeTexas);

  countiesGroup.transition()
    .duration(200)
    .style("opacity", 0)

  resetCountyPaths(countiesGroup);
  countyPaths.innerHTML = null;

  showCallouts(calloutsGroup);
  showStateLabels(stateLabels, includeTexas);

  // Hide Reset Button
  resetBtn.style.display = "none";
  //tooltip.style.display = "none";
}

function zoomOutCounty() {
  currentZoomLevel = 1;
  resetCounty();
  scale = zoomToFeature(mapGroup, path, width, height, currentState.feature);
  selectState(statePaths, scale, currentState.abbr);
  updateInfoPanel();

  updateCountyChoropleth();

  deselectCounty(countyPaths);
  
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
    resetBtn = dashboard.querySelector(".edgi-btn-reset");
    const wrapper = dashboard.querySelector(".edgi-map-canvas-wrapper");

    infoPanelContainer = document.createElement("div");
    infoPanelContainer.innerHTML = loadDefaultInfo();
    wrapper.appendChild(infoPanelContainer);

    // currentStateLabel = infoPanelContainer.querySelector("#currentState")
    // currentEmissionsLabel = infoPanelContainer.querySelector("#stateEmissions")

    let controlContainer = document.createElement("div");
    controlContainer.setAttribute("id", "map-controls");
    dashboard.appendChild(controlContainer);
    controlContainer.insertAdjacentHTML("afterbegin", timeline);

    document.querySelector("#yearslider").addEventListener("change", function() {
      updateYear(this.value)
    });

    controlContainer.insertAdjacentHTML("beforeend", toggles);

    document.querySelector("#emission-toggle").addEventListener("change", function() {
      toggleEmissionsType();
    });

    document.querySelector("#texas-toggle").addEventListener("change", function() {
      toggleTexas();
    });

    canvasContainer.innerHTML =
      '<div style="padding: 20px; font-weight:300; color:#afe0d7;">Loading environmental data and maps...</div>';


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

        stateData = sortCountiesIntoStates(stateData, countyData);
        stateDataNoTexas = structuredClone(stateData);
        delete stateDataNoTexas.TX;

        calculateRanges();
        updateInfoPanel();

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
        mapGroup = svg.append("g").attr("class", "map-group");
        statesGroup = mapGroup.append("g").attr("class", "states-group");
        countiesGroup = mapGroup.append("g").attr("class", "counties-group");
        labelsGroup = mapGroup.append("g").attr("class", "labels-group");

        // Callouts group (rendered outside mapGroup so it doesn't scale/zoom)
        calloutsGroup = svg.append("g").attr("class", "callouts-group");

        // 3. Render States
        statePaths = setupStatePaths(statesGroup, statesFeatures, path, getStateColor, setCurrentState);

        stateLabels = setupStateLabels(labelsGroup, statesFeatures, path);

        for (const [smallAbbr, smallData] of Object.entries(smallStates)){ 
          const feature = statesFeatures.find(
              (f) => getNameToAbbr(f.properties.name) === smallAbbr,
          );
          if (!feature) return;

          const centroid = path.centroid(feature);
          if (!centroid) return;


          let pill = setupCallouts(calloutsGroup, smallData, smallAbbr, centroid);
          setupPillInteraction(pill, feature, statesGroup, setCurrentState, stateHover, exitStateHover);
        };

        // Reset Zoom action
        resetBtn.addEventListener("click", () => {
          if (currentZoomLevel == 2){ //if zoomed to county
            zoomOutCounty();

          }
          else if (currentZoomLevel == 1){ //if zoomed to state
            zoomOutState();
          }
        });

        // svg.on("click", () => {
        //   zoomOutState();
        // });
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

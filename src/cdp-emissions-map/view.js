import * as d3 from "d3";
import * as topojson from "topojson-client";

import { loadBaseFiles, loadFacilityFiles } from "./utilities/load.js"
import { processStateData, processCountyData, sortCountiesIntoStates, removeTexasStateData, removeTexasCountyData, processFacilitiesYear, removeTexasFacilityData } from "./utilities/process-data.js"
import { getNameToAbbr, getStateToFips } from "./utilities/convert.js"
import { getScaledColor, getDirectColor, getSupplierColor } from "./utilities/colors.js"
import SMALL_STATES from "./utilities/special-states.js"
const smallStates = SMALL_STATES["SMALL_STATES"];

import IRREGULAR_STATES from "./utilities/special-states.js"
const irregularStates = IRREGULAR_STATES["IRREGULAR_STATES"];

import timeline from './components/timeline.js';
import { loadDefaultTitle, loadCountryTitle, loadStateTitle, loadCountyTitle } from './components/title.js';
import { loadDefaultInfo, loadCountryInfo, loadStateInfo, loadCountyInfo } from './components/info-panel.js';
import toggles from './components/toggles.js';
import callout from './components/callout-group.js';
import { setupStatePaths, stateHover, exitStateHover, selectState, deselectState, hideTexas, showTexas} from './components/state-paths.js';
import { setupCountyPaths, resetCountyPaths, selectCounty, deselectCounty} from './components/county-paths.js';
import { loadFacilityPaths, resetFacilityPaths } from './components/facility-paths.js';
import { zoomToFeature, resetZoom} from './components/map-zoom.js';

import { setupStateLabels, showStateLabels, hideStateLabels, hideTexasLabel } from './components/state-labels.js';
import { setupCallouts, setupPillInteraction, showCallouts, hideCallouts, resetCallouts } from './components/callout-group.js';

import Locale from "./utilities/locale.js"
import Range from "./utilities/range.js"

var titleContainer;
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
var countyDataNoTexas = {};
var facilityData = {};
var facilityDataNoTexas = {};

var countiesFeatures = {}
var countiesGroup;
var countyPaths;

var facilityGroup;
var facilityPath;

var mapGroup;
var statesGroup;
var labelsGroup;
var stateLabels;
var calloutsGroup;
var backButton;

var path;
var projection;

var zoomLevels = ["country", "state", "county", "facility"];
var currentZoomLevel = 0;
var currentZoomLabel = zoomLevels[currentZoomLevel]; 

//D3 canvas dimensions
const width = 960;
const height = 600;

//range values - [min,max]
// var directRange;
// var supplierRange;
// var directRangeNoTexas;
// var supplierRangeNoTexas;

var stateRange;
var countyRange;
var facilityRange;

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
  else if (currentZoomLevel == 2){

    updateFacilities();
  }

  updateChoropleth();
  updateInfoPanel();

}

function calculateRanges(){
  stateRange = new Range(); 

  stateRange.setRange(stateData, true);
  stateRange.setRange(stateDataNoTexas, false);

  countyRange = new Range(); 

  countyRange.setRange(countyData, true);
  countyRange.setRange(countyDataNoTexas, false);

  facilityRange = new Range(); 

  facilityRange.setRange(facilityData, true, true);
  facilityRange.setRange(facilityDataNoTexas, false, true);


  // directRange = getEmissionRange(stateData, "total_direct");
  // supplierRange = getEmissionRange(stateData, "total_supplier");

  // directRangeNoTexas = getEmissionRange(stateDataNoTexas, "total_direct");
  // supplierRangeNoTexas = getEmissionRange(stateDataNoTexas, "total_supplier");
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
      return getDirectColor(emissions, stateRange.getRange("total_direct", includeTexas));
    }
    else{
      return getSupplierColor(emissions, stateRange.getRange("total_supplier", includeTexas));
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
      return getDirectColor(emissions, countyRange.getRange("total_direct", includeTexas))
    }
    else{
      return getSupplierColor(emissions, countyRange.getRange("total_supplier", includeTexas))
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

  if (currentZoomLevel == 2){
    updateFacilities();
  }
}

function updateInfoPanel() {
  if (currentZoomLevel == 0){
    infoPanelContainer = loadCountryInfo(infoPanelContainer, includeTexas ? stateData : stateDataNoTexas, currentYear, emissionType);
  }
  else if (currentZoomLevel == 1){
    infoPanelContainer = loadStateInfo(infoPanelContainer, currentState, currentYear, emissionType);
  }
  else if (currentZoomLevel == 2){
    var countyFacilities = [];
    if (facilityData[currentCounty.id]){
      countyFacilities = Object.values(facilityData[currentCounty.id]);
    }

    infoPanelContainer = loadCountyInfo(infoPanelContainer, currentCounty, currentYear, emissionType, countyFacilities);
  }
}

function updateTitle() {
  if (currentZoomLevel == 0){
    titleContainer = loadCountryTitle(titleContainer);
  }
  else if (currentZoomLevel == 1){
    titleContainer = loadStateTitle(titleContainer, currentState);
  }
  else if (currentZoomLevel == 2){
    titleContainer = loadCountyTitle(titleContainer, currentCounty);
  }
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

function updateFacilities(){
  resetFacilityPaths(facilityGroup);
    if (facilityData[currentCounty.id]){
    var currentFacilities = Object.values(facilityData[currentCounty.id]);
    
    //console.log(currentFacilities);
    facilityPath = loadFacilityPaths(facilityGroup, currentFacilities, path, projection, currentYear, facilityRange, emissionType, includeTexas);
  }

}

function resetState() {
  currentState = null;
  currentStateAbbr = "";
  
  updateTitle();
  updateInfoPanel();
  // currentStateLabel.innerHTML = "Select state..."
  // currentEmissionsLabel.innerHTML = ""
}

function resetCounty() {
  currentCounty = null;
  updateTitle();
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

  if (currentZoomLevel == 2){
    updateFacilities();
  }

  updateTitle();
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
  updateTitle();
  updateInfoPanel();

  // Show Reset Button
  backButton.style.display = "flex";
}


function zoomToCounty() {
  currentZoomLevel = 2;

  scale = zoomToFeature(mapGroup, path, width, height, currentCounty.feature);

  selectCounty(countyPaths, scale, currentCounty.id)
  
  updateTitle();
  updateInfoPanel();

  updateFacilities();

  // Show Reset Button
  backButton.style.display = "flex";
  
}


function zoomOutState() {
  currentZoomLevel = 0;
  resetState();
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

  // Hide Back Button
  backButton.style.display = "none";
  //tooltip.style.display = "none";
}

function zoomOutCounty() {
  currentZoomLevel = 1;
  resetCounty();
  scale = zoomToFeature(mapGroup, path, width, height, currentState.feature);
  selectState(statePaths, scale, currentState.abbr);
  updateTitle();
  updateInfoPanel();

  updateCountyChoropleth();

  deselectCounty(countyPaths);
  resetFacilityPaths(facilityGroup);
  
}

var dashboard;
var canvasContainer;
var baseContainer;

var statesTopo;
var countiesTopo;


function loadComponents(){
// Initialize tooltips
  let tooltip = document.querySelector(".edgi-map-tooltip");
  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.className = "edgi-map-tooltip";

    document.body.appendChild(tooltip);
  }

    // Containers
    baseContainer = dashboard.querySelector(".dashboard");

    canvasContainer = dashboard.querySelector(".map");
    backButton = dashboard.querySelector(".back-button");
    const wrapper = dashboard.querySelector(".map-wrapper");

    titleContainer = document.createElement("div");
    titleContainer.innerHTML = loadDefaultTitle();
    baseContainer.insertBefore(titleContainer, baseContainer.firstChild);

    infoPanelContainer = document.createElement("div");
    infoPanelContainer.innerHTML = loadDefaultInfo();
    wrapper.appendChild(infoPanelContainer);

    // currentStateLabel = infoPanelContainer.querySelector("#currentState")
    // currentEmissionsLabel = infoPanelContainer.querySelector("#stateEmissions")

    let controlContainer = document.createElement("div");
    controlContainer.setAttribute("id", "map-controls");
    dashboard.appendChild(controlContainer);
    controlContainer.insertAdjacentHTML("afterbegin", timeline);

    document.querySelector("#yearslider").addEventListener("input", function() {
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
}

document.addEventListener("DOMContentLoaded", () => {

  dashboard = document.querySelector("#cdp-emissions-map");

  loadComponents();
  loadBaseFiles(dashboard, loadBaseData)
});

function loadMap(){
  canvasContainer.innerHTML = "";

  calculateRanges();
  updateInfoPanel();

  const svg = d3
    .create("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("width", "100%")
    .attr("height", "100%");


  canvasContainer.appendChild(svg.node());

  // Draw projection
  projection = d3
    .geoAlbersUsa()
    .translate([width / 2, height / 2])
    .scale(1150);

  path = d3.geoPath().projection(projection).pointRadius(.5);

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
  facilityGroup = mapGroup.append("g").attr("class", "facilities-group");
  labelsGroup = mapGroup.append("g").attr("class", "labels-group");

  // Callouts group (rendered outside mapGroup so it doesn't scale/zoom)
  calloutsGroup = svg.append("g").attr("class", "callouts-group");

  // 3. Render States
  statePaths = setupStatePaths(statesGroup, statesFeatures, path, getStateColor, setCurrentState);
  //console.log(statesFeatures);

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
  backButton.addEventListener("click", () => {
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
}

function loadBaseData(csvData, statesTopoData, countiesTopoData, stateGHGUrl, countyGHGUrl){
  statesTopo = statesTopoData;
  countiesTopo = countiesTopoData;
  stateData = processStateData(stateGHGUrl);
  countyData = processCountyData(countyGHGUrl);

  stateData = sortCountiesIntoStates(stateData, countyData);
  stateDataNoTexas = removeTexasStateData(stateData);
  countyDataNoTexas = removeTexasCountyData(countyData);

  loadFacilityFiles(dashboard, loadFacilities);
}

function loadFacilities(files, startYear, endYear){
    for (let index = 0; index < endYear - startYear + 1; index++){
      var year = startYear + index;
      var file = files[index];
      facilityData = processFacilitiesYear(facilityData, file, year);
    }

  facilityDataNoTexas = removeTexasFacilityData(facilityData, countyData);

  loadMap();
}

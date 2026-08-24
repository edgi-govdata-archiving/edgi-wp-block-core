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
import { loadDefaultInfo, loadCountryInfo, loadStateInfo, loadCountyInfo, loadFacilityInfo } from './components/info-panel.js';
import toggles from './components/toggles.js';
import callout from './components/callout-group.js';
import { setupStatePaths, stateHover, exitStateHover, selectState, deselectState, hideTexas, showTexas} from './components/state-paths.js';
import { setupCountyPaths, resetCountyPaths, selectCounty, deselectCounty} from './components/county-paths.js';
import { loadFacilityPaths, resetFacilityPaths, selectFacility, deselectFacility } from './components/facility-paths.js';
import { zoomToFeature, resetZoom} from './components/map-zoom.js';

import { setupStateLabels, showStateLabels, hideStateLabels, hideTexasLabel } from './components/state-labels.js';
import { setupCallouts, setupPillInteraction, showCallouts, hideCallouts, resetCallouts } from './components/callout-group.js';
import { showLabel, hideLabel } from './components/hover-label.js';
import { setupBackButton, hideBackButton, showBackButton } from './components/back-button.js';

import Locale from "./utilities/locale.js"
import Range from "./utilities/range.js"

//core html containers
var dashboard;
var canvasContainer;
var baseContainer;

var statesTopo;
var countiesTopo;

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

//Ranges - stored in Range class that includes direct, supplier + w and w/o Texas
var stateRange;
var countyRange;
var facilityRange;

var includeTexas = true;

var scale = 1;
var isZooming = false; //true during zoom transition state

//Current locales - stored in Locale class 
var currentState;
var currentCounty;
var currentFacility; //not in locale class, just obj of facility data

//toggles texas from map + refreshes vizualizations to use ranges w/o texas
function toggleTexas(){
  includeTexas = !includeTexas;

  if (currentZoomLevel == 0){
    if (!includeTexas){
      hideTexas(statePaths);
      //hideTexasLabel(stateLabels);
    }
    else {
      showTexas(statePaths);
      //showStateLabels(stateLabels, true);
    }
  }
  else if (currentZoomLevel == 2){

    updateFacilities();
  }

  updateChoropleth();
  updateInfoPanel();

}

//precalculates ranges that are used in scaling choropleth + facility bubbles
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
}

//show county svgs + choropleth within particular state
function renderCountiesForState(stateAbbr, scale) {
  const stateFips = getStateToFips(stateAbbr);

  if (!stateFips) return;

  const stateCounties = countiesFeatures.filter(
    (d) => {
      if (d.id){ 
        return d.id.substring(0,2) == stateFips
      }
      return false;
      }
    )

  countyPaths = setupCountyPaths(countiesGroup, path, stateCounties, countyData, scale, setCurrentCounty, mapHover, mapExitHover)
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

//updates info panel with text depending on zoom level
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
  else if (currentZoomLevel == 3){
    infoPanelContainer = loadFacilityInfo(infoPanelContainer, currentFacility, currentYear, emissionType, closeFacility);
  }
}

//updates main title depending on zoom level
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

//updates map choropleth depending on zoom level
function updateChoropleth(){
  if (currentZoomLevel == 0){
    updateStateChoropleth();
  }
  else if (currentZoomLevel == 1){
    updateCountyChoropleth();
  }
}

//updates state map choropleth
function updateStateChoropleth(){
   statePaths.style("fill", (d) => {
          const abbr = getNameToAbbr(d.properties.name);
          return getStateColor(d.properties.name)
      });
}

//updates county map choropleth
function updateCountyChoropleth(){
   countyPaths.style("fill", (d) => {
          return getCountyColor(d.id)   
      });
}

//loads current county's facilities onto map
function updateFacilities(){
    resetFacilityPaths(facilityGroup);
    if (facilityData[currentCounty.id]){
    var currentFacilities = Object.values(facilityData[currentCounty.id]);
    facilityPath = loadFacilityPaths(facilityGroup, currentFacilities, path, projection, currentYear, 
                                     facilityRange, emissionType, includeTexas, 
                                     setCurrentFacility, mapHover, mapExitHover);
    }

}

//resets any state-related info, called when pressing 'back' on state view
function resetState() {
  currentState = null;
  currentStateAbbr = "";
  
  updateTitle();
  updateInfoPanel();
}

//resets any county-related info, called when pressing 'back' on county view
function resetCounty() {
  currentCounty = null;
  updateTitle();
  updateInfoPanel();
}

//toggles emission type + refreshes any viz / info related to emissions
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

function isSmallState(name){
  for (const [key, value] of Object.entries(smallStates)) {
    if (value.name == name){
      return true;
    }
  }
  return false;
}

function mapHover(elementGroup, path, target, text){
  if (!isZooming){
    if (currentZoomLevel == 0 && elementGroup == statesGroup){
      if (!isSmallState(text)){
        showLabel(elementGroup, path, target, text, scale, 170);
      }
    }
    else if (currentZoomLevel == 1 && elementGroup == countiesGroup){
      showLabel(elementGroup, path, target, text, scale, 250);
    }
    else if ((currentZoomLevel == 2 || currentZoomLevel == 3) && elementGroup == facilityGroup){
      showLabel(elementGroup, path, target, text, scale, 250);
    }
  }
}

function mapExitHover(elementGroup){
  hideLabel(elementGroup);
}

//sets current state, loads critical info, zooms to that state. called when state is clicked
function setCurrentState(feature, stateAbbr){
  if (currentZoomLevel == 0){ //can only select state from country view
    currentState = new Locale(feature.id);
    currentState.abbr = stateAbbr;
    currentState.name = feature.properties.name;
    currentState.feature = feature;
    currentState.data = stateData[stateAbbr];
    zoomToState();
  }
}

//sets current county, loads critical info, zooms to that county. called when county is clicked
function setCurrentCounty(feature, countyId){
  if (currentZoomLevel == 1){ //can only select county from state view
    currentCounty = new Locale(countyId);
    currentCounty.name = feature.properties.name + " County";
    currentCounty.feature = feature;
    currentCounty.data = countyData[countyId];

    zoomToCounty();
  }
}

//sets current facility, loads critical info, zooms to that state. called when facility is clicked
function setCurrentFacility(facilityProperties){
  if (currentZoomLevel == 2 || currentZoomLevel == 3){ //can only select facility from county view or facility view
    currentFacility = facilityProperties;
    zoomToFacility();
  }
}

function doneWithZoom(){
  isZooming = false;
}

function waitForZoom(){
  isZooming = true;
  setTimeout(doneWithZoom, 500);
}

//zooms map to current state, hides callouts + updates viz to current state info
function zoomToState() {
  waitForZoom();
  currentZoomLevel = 1;

  calloutsGroup
    .selectAll(".state-callout-pill")
    .classed("active", (d) => d.abbr === currentState.abbr);

  hideLabel(statesGroup);

  scale = zoomToFeature(mapGroup, path, width, height, currentState.feature);

  selectState(statePaths, scale, currentState.abbr)
  //hideStateLabels(stateLabels);
  hideCallouts(calloutsGroup);
  renderCountiesForState(currentState.abbr, scale);
  updateTitle();
  updateInfoPanel();

  showBackButton(backButton);
}

//zooms map to current county, hides callouts + updates viz to current county info
function zoomToCounty() {
  waitForZoom();
  currentZoomLevel = 2;

  hideLabel(countiesGroup);

  scale = zoomToFeature(mapGroup, path, width, height, currentCounty.feature);

  selectCounty(countyPaths, scale, currentCounty.id)
  updateTitle();
  updateInfoPanel();
  updateFacilities();
  
}

//does not literally zoom, just highlights facility on county zoom level
function zoomToFacility() {
  currentZoomLevel = 3;

  selectFacility(facilityPath, currentFacility, emissionType);
  
  //updateTitle(); //should title update?
  updateInfoPanel();

}

//zooms out from current state view, deselect states + resets map
function zoomOutState() {
  waitForZoom();
  currentZoomLevel = 0;
  scale = 1;
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
  //showStateLabels(stateLabels, includeTexas);

  hideBackButton(backButton);
  //tooltip.style.display = "none";
}

//zooms out from current county view, reselects state + loads state level view
function zoomOutCounty() {
  waitForZoom();
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

//does not literally zoom out, just resets to county level view
function zoomOutFacility() {
  waitForZoom();
  currentZoomLevel = 2;

  //updateTitle();
  updateInfoPanel();

  deselectFacility(facilityPath, emissionType);
}

var backButtonContainer;


//loads core html containers
function loadComponents(){
  let tooltip = document.querySelector(".edgi-map-tooltip");
  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.className = "edgi-map-tooltip";
    document.body.appendChild(tooltip);
  }
  baseContainer = dashboard.querySelector(".dashboard");

  canvasContainer = dashboard.querySelector(".map");
  const wrapper = dashboard.querySelector(".map-wrapper");

  titleContainer = document.createElement("div");
  titleContainer.innerHTML = loadDefaultTitle();
  baseContainer.insertBefore(titleContainer, baseContainer.firstChild);

  infoPanelContainer = document.createElement("div");
  infoPanelContainer.innerHTML = loadDefaultInfo();
  wrapper.appendChild(infoPanelContainer);

  backButtonContainer = dashboard.querySelector(".back-button-wrapper");
  backButton = setupBackButton(backButtonContainer, goBack);

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

//triggers loading process
document.addEventListener("DOMContentLoaded", () => {
  dashboard = document.querySelector("#cdp-emissions-map");
  loadComponents();
  loadBaseFiles(dashboard, loadBaseData)
});

var hoverLabelContainer;

//loads svg map and labels, sets up event triggers
function loadMap(){
  canvasContainer.innerHTML = "";

  calculateRanges();
  updateInfoPanel();

  const svg = d3
    .create("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("width", "100%")
    .attr("height", "100%");

    // svg.append("svg:defs").append("svg:filter")
    //     .attr("id", "solid")
    //     .attr("x", 0)
    //     .attr("y", 0)
    //     .attr("width", 1)
    //     .attr("height", 1)
    //     .append("f")
    //     .attr("markerUnits","userSpaceOnUse")
    //     .append("path")
    //     .attr("d", "M 0 1 1 0 2 1")
    //     .style("fill", "#00000088");

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

  statePaths = setupStatePaths(statesGroup, statesFeatures, path, getStateColor, setCurrentState, mapHover, mapExitHover);
  //stateLabels = setupStateLabels(labelsGroup, statesFeatures, path);

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

  // svg.on("click", () => {
  //   zoomOutState();
  // });
}

function goBack(){
      if (currentZoomLevel == 1){ //if zoomed to state
      zoomOutState();
    }
    else if (currentZoomLevel == 2){ //if zoomed to county
      zoomOutCounty();
    }    
    else if (currentZoomLevel == 3){ //if zoomed to facility
      zoomOutFacility();
      zoomOutCounty();
    }
}

function closeFacility(){
  setTimeout(zoomOutFacility, 200);
}

//processes base data files once files are loaded 
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

//processes facility files into single obj facilityData -- files are split by year
function loadFacilities(files, startYear, endYear){
    for (let index = 0; index < endYear - startYear + 1; index++){
      var year = startYear + index;
      var file = files[index];
      facilityData = processFacilitiesYear(facilityData, file, year);
    }

  facilityDataNoTexas = removeTexasFacilityData(facilityData, countyData);

  loadMap();
}

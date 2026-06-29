import * as d3 from "d3";
import * as topojson from "topojson-client";


import { getNameToAbbr } from "./utilities/convert.js"

import timeline from './components/timeline.js';
import infoPanel from './components/info-panel.js';

var infoPanelContainer;
var currentStateLabel;


const smallStates = [
  "RI",
  "DE",
  "DC",
  "MD",
  "NJ",
  "CT",
  "MA",
  "VT",
  "NH",
  "VI",
  "MP",
  "AS",
  "GU",
  "PR",
];

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
    //currentStateLabel.value = 'Hello there!';

      
    
    // let timelineContainer = document.createElement("div");
    // timelineContainer.innerHTML = timeline;
    // dashboard.appendChild(timelineContainer);


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
            const stateData = {};

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
            console.log(stateData)

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
        const statePaths = statesGroup
          .selectAll(".state-boundary")
          .data(statesFeatures)
          .enter()
          .append("path")
          .attr("class", "state-boundary")
          .attr("d", path)
          .on("click", (event, d) => {
            event.stopPropagation();
            const abbr = getNameToAbbr(d.properties.name);
            if (abbr) zoomToState(d, abbr);
          });

        // Render state abbreviation labels
        const stateLabels = labelsGroup
          .selectAll(".state-label")
          .data(statesFeatures)
          .enter()
          .append("text")
          .attr("class", "state-label")
          .attr("transform", (d) => {
            const centroid = path.centroid(d);
            if (!centroid) return "";
              const abbr = getNameToAbbr(d.properties.name);
            let x = centroid[0];
            let y = centroid[1];
            // Adjustments for better label alignment on islands/peninsulas
            if (abbr === "MI") {
              x += 18;
              y += 24;
            } else if (abbr === "FL") {
              x += 14;
            } else if (abbr === "LA") {
              x -= 10;
              y += 10;
            }
            return `translate(${x}, ${y})`;
          })
          .text((d) => {
              const abbr = getNameToAbbr(d.properties.name);
            // Skip small states to prevent label overlap/clutter
            return abbr && !smallStates.includes(abbr) ? abbr : "";
          });

        // 4. Render SVG Line Callouts for Small States
        const calloutsData = [
          { abbr: "VT", x: 915, y: 135 },
          { abbr: "NH", x: 900, y: 165 },
          { abbr: "MA", x: 915, y: 190 },
          { abbr: "RI", x: 915, y: 215 },
          { abbr: "CT", x: 885, y: 240 },
          { abbr: "NJ", x: 900, y: 265 },
          { abbr: "DE", x: 880, y: 290 },
          { abbr: "MD", x: 880, y: 315 },
          { abbr: "DC", x: 870, y: 340 },
        ];

        calloutsData.forEach((callout) => {
          const feature = statesFeatures.find(
              (f) => getNameToAbbr(f.properties.name) === callout.abbr,
          );
          if (!feature) return;

          const centroid = path.centroid(feature);
          if (!centroid) return;

          // Draw connecting line
          calloutsGroup
            .append("line")
            .attr("class", "state-callout-line")
            .attr("x1", centroid[0])
            .attr("y1", centroid[1])
            .attr("x2", callout.x - 18)
            .attr("y2", callout.y);

          // Draw interactive pill group
          const pill = calloutsGroup
            .append("g")
            .datum(callout)
            .attr("class", "state-callout-pill")
            .attr("transform", `translate(${callout.x}, ${callout.y})`)
            .on("click", (event) => {
              event.stopPropagation();
              zoomToState(feature, callout.abbr);
            })
            .on("mouseover", () => {
              statesGroup
                .selectAll(".state-boundary")
                  .filter((f) => getNameToAbbr(f.properties.name) === callout.abbr)
                .classed("hover", true);
            })
            .on("mouseout", () => {
              statesGroup.selectAll(".state-boundary").classed("hover", false);
            });

          pill
            .append("rect")
            .attr("rx", 8)
            .attr("ry", 8)
            .attr("x", -18)
            .attr("y", -10)
            .attr("width", 36)
            .attr("height", 20)
            .attr("class", "state-callout-bg");

          pill
            .append("text")
            .text(callout.abbr)
            .attr("text-anchor", "middle")
            .attr("dy", "4")
            .attr("class", "state-callout-text");
        });

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
          updateDetailsPanel(stateAbbr);
        }

        // Reset Map function
        function resetMap() {
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

          // Reset details panel to placeholder
          detailsPanel.innerHTML = `
					<div class="edgi-details-placeholder">
						Select a state or district to view congressional representatives and reports.
					</div>
				`;
        }

        // Update details panel with Senators
           function updateDetailsPanel(stateAbbr) {
           console.log(stateData)
           console.log("updating: " + stateAbbr)
           
            const currentState = stateData[stateAbbr];

           if (!currentState) {
                return;
            }
            else {
               console.log(currentState)
            }

               const emissions = currentState["emissions"]["2010"]["total_direct"];
               const stateName = currentState.name;

               //infoPanel.test = stateName;
               currentStateLabel.innerHTML = stateName



          detailsPanel.innerHTML = `
					<div class="edgi-details-header">
						<h4 class="edgi-details-state-name">${stateName} </h4>
						<span class="edgi-details-label">State Code: ${stateAbbr}</span>
                        <span class="edgi-details-label">Direct Emissions 2010: ${emissions}</span>
					</div>
				`;
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

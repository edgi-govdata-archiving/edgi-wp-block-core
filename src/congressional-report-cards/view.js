import * as d3 from "d3";
import * as topojson from "topojson-client";

const fipsToAbbr = {
  "01": "AL",
  "02": "AK",
  "04": "AZ",
  "05": "AR",
  "06": "CA",
  "08": "CO",
  "09": "CT",
  10: "DE",
  11: "DC",
  12: "FL",
  13: "GA",
  15: "HI",
  16: "ID",
  17: "IL",
  18: "IN",
  19: "IA",
  20: "KS",
  21: "KY",
  22: "LA",
  23: "ME",
  24: "MD",
  25: "MA",
  26: "MI",
  27: "MN",
  28: "MS",
  29: "MO",
  30: "MT",
  31: "NE",
  32: "NV",
  33: "NH",
  34: "NJ",
  35: "NM",
  36: "NY",
  37: "NC",
  38: "ND",
  39: "OH",
  40: "OK",
  41: "OR",
  42: "PA",
  44: "RI",
  45: "SC",
  46: "SD",
  47: "TN",
  48: "TX",
  49: "UT",
  50: "VT",
  51: "VA",
  53: "WA",
  54: "WV",
  55: "WI",
  56: "WY",
  60: "AS",
  66: "GU",
  69: "MP",
  72: "PR",
  78: "VI",
};

const stateToFips = {};
Object.entries(fipsToAbbr).forEach(([fips, abbr]) => {
  stateToFips[abbr] = fips;
});

const abbrToName = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  DC: "District of Columbia",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
  AS: "American Samoa",
  GU: "Guam",
  MP: "Northern Mariana Islands",
  PR: "Puerto Rico",
  VI: "Virgin Islands",
};

const nameToAbbr = {};
Object.entries(abbrToName).forEach(([abbr, name]) => {
  nameToAbbr[name] = abbr;
});
// Overrides for territories in TopoJSON state name conventions
nameToAbbr["Commonwealth of the Northern Mariana Islands"] = "MP";
nameToAbbr["United States Virgin Islands"] = "VI";

const northeastStates = [
  "ME",
  "NH",
  "VT",
  "MA",
  "RI",
  "CT",
  "NJ",
  "DE",
  "MD",
  "DC",
];
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
    const districtsJsonUrl = dashboard.getAttribute("data-districts-json-url");

    if (!csvUrl || !statesJsonUrl || !districtsJsonUrl) {
      console.error("EDGI Map Dashboard: Missing required data attributes!");
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
    const canvasContainer = dashboard.querySelector(".edgi-map-canvas");
    const detailsPanel = dashboard.querySelector(".edgi-details-panel");
    const resetBtn = dashboard.querySelector(".edgi-btn-reset");
    const wrapper = dashboard.querySelector(".edgi-map-canvas-wrapper");
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

    // Load resources
    Promise.all([
      d3.csv(csvUrl),
      d3.json(statesJsonUrl),
      d3.json(districtsJsonUrl),
    ])
      .then(([csvData, statesTopo, districtsTopo]) => {
        canvasContainer.innerHTML = "";

        // 1. Process data for fast lookup
        const stateData = {};
        const districtData = {};

        csvData.forEach((row) => {
          const trimmedFips = String(row.fips).trim();
          if (trimmedFips.length <= 2) {
            // State-level row
            const fips = trimmedFips.padStart(2, "0");
            stateData[row.state_code] = {
              name: row.name,
              senator_1: row.senator_1,
              senator_1_party: row.senator_1_party,
              senator_2: row.senator_2,
              senator_2_party: row.senator_2_party,
              report_link: row.report_link,
            };
          } else {
            // District-level row
            const fips = trimmedFips.padStart(4, "0");
            districtData[fips] = {
              name: row.name,
              representative: row.representative,
              representative_party: row.representative_party,
              report_link: row.report_link,
            };
          }
        });

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
        const districtsFeatures = topojson.feature(
          districtsTopo,
          districtsTopo.objects.cb_2025_us_cd119_5m,
        ).features;

        // Base map group
        const mapGroup = svg.append("g").attr("class", "map-group");
        const statesGroup = mapGroup.append("g").attr("class", "states-group");
        const districtsGroup = mapGroup
          .append("g")
          .attr("class", "districts-group");
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
            const abbr = nameToAbbr[d.properties.name];
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
            const abbr = nameToAbbr[d.properties.name];
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
            const abbr = nameToAbbr[d.properties.name];
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
            (f) => nameToAbbr[f.properties.name] === callout.abbr,
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
                .filter((f) => nameToAbbr[f.properties.name] === callout.abbr)
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
              nameToAbbr[d.properties.name] === stateAbbr ? 1 : 0.4,
            )
            .attr(
              "class",
              (d) =>
                `state-boundary${
                  nameToAbbr[d.properties.name] === stateAbbr ? " active" : ""
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

          // 2. Load Districts for Zoomed State
          renderDistrictsForState(stateAbbr, scale);

          // 3. Update Details Panel header & senators
          updateDetailsPanel(stateAbbr);
        }

        // Render Districts for selected state
        function renderDistrictsForState(stateAbbr, scale) {
          const stateFips = stateToFips[stateAbbr];

          // Clear previous districts
          districtsGroup.selectAll(".district-boundary").remove();
          districtsGroup.selectAll(".district-tooltip-line").remove();
          districtsGroup.style("opacity", 0);

          if (helperContainer) {
            helperContainer.innerHTML = "";
            helperContainer.style.display = "none";
          }

          if (!stateFips) return;

          const stateDistricts = districtsFeatures.filter(
            (d) => d.properties.STATEFP === stateFips,
          );

          // Draw district boundaries
          const districtPaths = districtsGroup
            .selectAll(".district-boundary")
            .data(stateDistricts)
            .enter()
            .append("path")
            .attr("class", (d) => {
              const geoid = d.properties.GEOID;
              const distInfo = districtData[geoid] || {};
              const partyClass = distInfo.representative_party
                ? ` party-${distInfo.representative_party.toLowerCase()}`
                : "";
              return `district-boundary${partyClass}`;
            })
            .attr("d", path)
            .style("stroke-width", `${0.6 / scale}px`)
            .on("mouseover", (event, d) => {
              const geoid = d.properties.GEOID;
              const distCode = d.properties.CD119FP;
              const distInfo = districtData[geoid] || {
                name: d.properties.NAMELSAD,
                representative: "Vacant",
                representative_party: "",
              };
              const partySuffix = distInfo.representative_party
                ? ` (${distInfo.representative_party[0]})`
                : "";

              tooltip.innerHTML = `
							<div class="tooltip-title">${distInfo.name}</div>
							<div class="tooltip-rep">Rep: ${distInfo.representative}${partySuffix}</div>
							<div class="tooltip-cta">Click to open report card (PDF)</div>
						`;
              tooltip.style.display = "block";

              // Draw dotted line from centroid to the right in SVG space
              const centroid = path.centroid(d);
              if (centroid && !isNaN(centroid[0]) && !isNaN(centroid[1])) {
                districtsGroup.selectAll(".district-tooltip-line").remove();
                districtsGroup
                  .append("line")
                  .attr("class", "district-tooltip-line")
                  .attr("x1", centroid[0])
                  .attr("y1", centroid[1])
                  .attr("x2", centroid[0] + 80 / scale)
                  .attr("y2", centroid[1])
                  .style("stroke-width", `${1.5 / scale}px`)
                  .style("stroke-dasharray", `${3 / scale}, ${3 / scale}`);

                // Position tooltip at the end of the dotted line
                const svgEl = svg.node();
                const pt = svgEl.createSVGPoint();
                pt.x = centroid[0] + 80 / scale;
                pt.y = centroid[1];
                const screenPt = pt.matrixTransform(
                  event.currentTarget.getScreenCTM(),
                );

                tooltip.style.left = `${screenPt.x + window.scrollX + 8}px`;
                tooltip.style.top = `${screenPt.y + window.scrollY - 20}px`;
              }
            })
            .on("mouseout", () => {
              tooltip.style.display = "none";
              districtsGroup.selectAll(".district-tooltip-line").remove();
            })
            .on("click", (event, d) => {
              event.stopPropagation();
              const geoid = d.properties.GEOID;
              const distInfo = districtData[geoid];
              if (distInfo && distInfo.report_link) {
                window.open(distInfo.report_link, "_blank");
              }
            });

          // 2.5 Render helper buttons/checklist for tiny districts (area < 250 px)
          const smallDistricts = stateDistricts.filter((d) => {
            const area = path.area(d);
            return area < 250;
          });

          // Sort small districts numerically by district number
          smallDistricts.sort((a, b) => {
            const numA = parseInt(a.properties.CD119FP, 10);
            const numB = parseInt(b.properties.CD119FP, 10);
            return numA - numB;
          });

          if (helperContainer && smallDistricts.length > 0) {
            helperContainer.style.display = "flex";

            const titleEl = document.createElement("div");
            titleEl.className = "edgi-helper-title";
            titleEl.textContent = "Choose your congressional district:";
            helperContainer.appendChild(titleEl);

            const listEl = document.createElement("div");
            listEl.className = "edgi-helper-pills-list";

            // Translate vertical wheel scroll to horizontal scroll
            listEl.addEventListener("wheel", (event) => {
              if (event.deltaY !== 0) {
                event.preventDefault();
                listEl.scrollLeft += event.deltaY;
              }
            });

            smallDistricts.forEach((d) => {
              const geoid = d.properties.GEOID;
              const distNum = d.properties.CD119FP;
              const pillLabel =
                distNum === "00" ? "At-Large" : String(parseInt(distNum, 10));

              const distInfo = districtData[geoid] || {
                name: d.properties.NAMELSAD,
                representative: "Vacant",
                representative_party: "",
              };
              const partySuffix = distInfo.representative_party
                ? ` (${distInfo.representative_party[0]})`
                : "";

              const pill = document.createElement("button");
              pill.className = `edgi-helper-pill${
                distInfo.representative_party
                  ? ` party-${distInfo.representative_party.toLowerCase()}`
                  : ""
              }`;
              pill.textContent = pillLabel;

              // Highlight matching map district and position tooltip on centroid
              pill.addEventListener("mouseover", () => {
                const targetPath = districtsGroup
                  .selectAll(".district-boundary")
                  .filter((f) => f.properties.GEOID === geoid);

                targetPath.classed("hover", true);

                const pathNode = targetPath.node();
                if (pathNode) {
                  const centroid = path.centroid(d);
                  if (centroid && !isNaN(centroid[0]) && !isNaN(centroid[1])) {
                    districtsGroup.selectAll(".district-tooltip-line").remove();
                    districtsGroup
                      .append("line")
                      .attr("class", "district-tooltip-line")
                      .attr("x1", centroid[0])
                      .attr("y1", centroid[1])
                      .attr("x2", centroid[0] + 80 / scale)
                      .attr("y2", centroid[1])
                      .style("stroke-width", `${1.5 / scale}px`)
                      .style("stroke-dasharray", `${3 / scale}, ${3 / scale}`);

                    // Position tooltip at the end of the dotted line
                    const svgEl = svg.node();
                    const pt = svgEl.createSVGPoint();
                    pt.x = centroid[0] + 80 / scale;
                    pt.y = centroid[1];
                    const screenPt = pt.matrixTransform(
                      pathNode.getScreenCTM(),
                    );

                    tooltip.innerHTML = `
                      <div class="tooltip-title">${distInfo.name}</div>
                      <div class="tooltip-rep">Rep: ${distInfo.representative}${partySuffix}</div>
                      <div class="tooltip-cta">Click to open report card (PDF)</div>
                    `;
                    tooltip.style.display = "block";
                    tooltip.style.left = `${screenPt.x + window.scrollX + 8}px`;
                    tooltip.style.top = `${screenPt.y + window.scrollY - 20}px`;
                  }
                }
              });

              pill.addEventListener("mouseout", () => {
                districtsGroup
                  .selectAll(".district-boundary")
                  .classed("hover", false);
                districtsGroup.selectAll(".district-tooltip-line").remove();
                tooltip.style.display = "none";
              });

              pill.addEventListener("click", () => {
                if (distInfo.report_link) {
                  window.open(distInfo.report_link, "_blank");
                }
              });

              listEl.appendChild(pill);
            });

            helperContainer.appendChild(listEl);
          }

          // Fade districts in
          districtsGroup.transition().duration(400).style("opacity", 1);
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

          // Fade out and remove districts
          districtsGroup
            .transition()
            .duration(300)
            .style("opacity", 0)
            .end()
            .then(() => {
              districtsGroup.selectAll(".district-boundary").remove();
              districtsGroup.selectAll(".district-tooltip-line").remove();
            });

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
          const info = stateData[stateAbbr];
          if (!info) return;

          const stateName = abbrToName[stateAbbr] || stateAbbr;

          // Color badges helper
          const getPartyBadgeClass = (party) => {
            if (!party) return "";
            if (party.includes("Democrat")) return "badge-democrat";
            if (party.includes("Republican")) return "badge-republican";
            return "badge-independent";
          };

          const sen1PartyClass = getPartyBadgeClass(info.senator_1_party);
          const sen2PartyClass = getPartyBadgeClass(info.senator_2_party);

          detailsPanel.innerHTML = `
					<div class="edgi-details-header">
						<h4 class="edgi-details-state-name">${stateName} Representatives</h4>
						<span class="edgi-details-label">State Code: ${stateAbbr}</span>
					</div>
					<div class="edgi-cards-grid">
						<div class="edgi-card">
							<div class="edgi-card-header">
								<span class="edgi-card-title">U.S. Senator</span>
								${
                  info.senator_1
                    ? `<span class="edgi-card-badge ${sen1PartyClass}">${info.senator_1_party}</span>`
                    : ""
                }
							</div>
							<h5 class="edgi-card-name">${info.senator_1 || "Vacant"}</h5>
							${
                info.report_link
                  ? `<a href="${info.report_link}" target="_blank" class="edgi-card-link-btn">Download State Report (PDF)</a>`
                  : ""
              }
						</div>
						
						<div class="edgi-card">
							<div class="edgi-card-header">
								<span class="edgi-card-title">U.S. Senator</span>
								${
                  info.senator_2
                    ? `<span class="edgi-card-badge ${sen2PartyClass}">${info.senator_2_party}</span>`
                    : ""
                }
							</div>
							<h5 class="edgi-card-name">${info.senator_2 || "Vacant"}</h5>
							${
                info.report_link
                  ? `<a href="${info.report_link}" target="_blank" class="edgi-card-link-btn">Download State Report (PDF)</a>`
                  : ""
              }
						</div>
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

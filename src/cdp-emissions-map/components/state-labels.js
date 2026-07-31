import { getNameToAbbr } from "../utilities/convert.js"

import SMALL_STATES from "../utilities/special-states.js"
const smallStates = SMALL_STATES["SMALL_STATES"];

import IRREGULAR_STATES from "../utilities/special-states.js"
const irregularStates = IRREGULAR_STATES["IRREGULAR_STATES"];

export function setupStateLabels(labelsGroup, stateData, statePath){
        // Render state abbreviation labels
        const stateLabels = labelsGroup
          .selectAll(".state-label")
          .data(stateData)
          .enter()
          .append("text")
          .attr("class", "state-label")
          .attr("transform", (d) => {
            const centroid = statePath.centroid(d);
            if (!centroid) return "";
              const abbr = getNameToAbbr(d.properties.name);
            let x = centroid[0];
            let y = centroid[1];
            
            // Adjustments for better label alignment on islands/peninsulas
            if (abbr in irregularStates){
              x += irregularStates[abbr].centroidX;
              y += irregularStates[abbr].centroidY;
            }
            return `translate(${x}, ${y})`;
          })
          .text((d) => {
              const abbr = getNameToAbbr(d.properties.name);
            // Skip small states to prevent label overlap/clutter
            return abbr && !smallStates[abbr] ? abbr : "";
          });

          return stateLabels;
}

export function hideStateLabels(stateLabels){
  stateLabels.transition()
            .duration(200)
            .style("opacity", 0);
}

export function hideTexasLabel(stateLabels){
  stateLabels.transition()
            .duration(200)
            .style("opacity", (d) =>
              d.properties.name === "Texas" ? 0 : 1,
            )
}

export function showStateLabels(stateLabels, includeTexas){
  stateLabels.transition()
            .delay(400)
            .duration(400)
            .style("opacity", (d) =>
              (!includeTexas && d.properties.name === "Texas") ? 0 : 1,
            )
}
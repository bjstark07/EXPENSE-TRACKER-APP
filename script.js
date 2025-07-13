function round(n) {
  return Math.round(n * 100) / 100;
}

function runCalculation() {
  const get = id => parseFloat(document.getElementById(id)?.value) || 0;
  const toolCount = get("toolCount");
  const toolTime = get("toolTime");
  const loadTime = get("loadTime");
  const rapidDist = get("rapidDist");
  const rapidRate = get("rapidRate");
  const totalDepth = get("totalDepth");
  const passDepth = get("passDepth");
  const dwellTime = get("dwellTime");
  const accDec = get("accDec");
  const spindleSpeed = get("spindleSpeed");

  const passes = Math.ceil(totalDepth / passDepth);
  const rapidTime = (rapidDist / rapidRate) * 60;
  const dwellTotal = dwellTime * passes;
  const cuttingTime = passes * ((rapidDist / rapidRate) * 60);
  const totalTime = round(toolCount * toolTime + loadTime + rapidTime + dwellTotal + cuttingTime + accDec);

  document.getElementById("cycleResult").textContent = `🕒 Total Cycle Time: ${totalTime} seconds`;

  const gcode = [
    "% ; Program Start",
    "G21 ; Metric Units",
    "G90 ; Absolute Positioning",
    `T${toolCount} M6 ; Tool Change`,
    `G43 H${toolCount} ; Tool Offset`,
    `S${spindleSpeed} M3 ; Spindle ON`,
    "M8 ; Coolant ON",
    "G0 Z5.0 ; Safe Z Height",
    "G0 X0 Y0 ; Start Position"
  ];

  for (let i = 1; i <= passes; i++) {
    const depth = round(-i * passDepth);
    gcode.push(`(Pass ${i})`);
    gcode.push(`G1 Z${depth} F${rapidRate} ; Plunge`);
    gcode.push(`G1 X${rapidDist} F${rapidRate} ; Feed`);
    gcode.push(`G4 P${dwellTime} ; Dwell`);
    gcode.push("G0 Z5.0 ; Retract");
  }

  gcode.push("M9 ; Coolant OFF");
  gcode.push("M5 ; Spindle OFF");
  gcode.push("G0 X0 Y0 ; Return Home");
  gcode.push(`(Cycle Time: ${totalTime} sec)`);
  gcode.push("M30 ; Program End");
  gcode.push("%");

  document.getElementById("gCodeOutput").textContent = gcode.join("\n");
}

function downloadGCode() {
  const code = document.getElementById("gCodeOutput")?.textContent || "";
  const blob = new Blob([code], { type: 'text/plain' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "cnc_program.gcode";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function viewImportedGCode() {
  const file = document.getElementById("gcodeImport")?.files[0];
  if (!file) return alert("Please select a G-code file first.");
  const reader = new FileReader();
  reader.onload = () => {
    document.getElementById("uploadedGCodeView").textContent = reader.result;
  };
  reader.readAsText(file);
}

function optimizeGCode() {
  const original = document.getElementById("uploadedGCodeView").textContent;
  if (!original) return alert("No G-code loaded.");
  const lines = original.split("\n");
  const optimized = [];
  const changes = [];

  for (let line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("G4") || trimmed.includes("dwell")) {
      changes.push("Removed dwell command → `" + trimmed + "`");
      continue;
    }
    optimized.push(line);
  }

  document.getElementById("optimizedGCodeView").textContent = optimized.join("\n");
  document.getElementById("optimizationExplanation").innerHTML =
    `<h4>✅ Cycle Time Reduction Applied</h4><ul>` +
    changes.map(change => `<li>${change}</li>`).join("") + `</ul>`;
}

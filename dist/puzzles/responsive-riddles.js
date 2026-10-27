(() => {
  "use strict";

  const filename = decodeURIComponent(location.pathname.split("/").pop() || "").replace(/\.html$/i, "");
  const riddle = filename.startsWith("dendritic-riddle-") ? filename : filename;
  document.body.dataset.riddle = riddle;

  const reportFilenames = {
    "dendritic-riddle-1": "קומה 1 - חידה 1 - איתן ועמית.doc",
    "dendritic-riddle-2": "קומה 1 - חידה 2 - הכדורסלן.doc",
    "dendritic-riddle-3": "קומה 1 - חידה 3 - השירים האהובים.doc",
    "dendritic-riddle-4": "קומה 1 - חידה 4 - הקוף בג׳ונגל.doc",
    "skin-temperature": "קומה 2 - חידה 1 - פענוח טמפרטורת העור.docx",
    "movement-direction": "קומה 2 - חידה 2 - פענוח כיוון התנועה.docx",
    "hippocampal-object-neuron": "קומה 2 - חידה 3 - נוירון אובייקטים בהיפוקמפוס.docx",
    "language-neuron": "קומה 2 - חידה 4 - פענוח פעילות נוירון השפה.docx",
    "mouse-place-cells": "קומה 3 - חידה 1 - תאי מיקום.doc",
    "wormmind": "קומה 3 - חידה 2 - מוח, חיווט והתנהגות.doc"
  };

  const reportFilename = reportFilenames[riddle];
  if (reportFilename) {
    const nameReport = (anchor) => {
      if (anchor?.download) anchor.download = reportFilename;
    };
    const nativeAnchorClick = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function namedReportClick() {
      nameReport(this);
      return nativeAnchorClick.call(this);
    };
    document.addEventListener("click", (event) => nameReport(event.target.closest?.("a[download]")), true);
  }

  const wrapStageVisual = (stage, ringSelector, className) => {
    if (!stage || stage.querySelector(`:scope > .${className}`)) return;
    const ring = stage.querySelector(`:scope > ${ringSelector}`);
    if (!ring) return;
    const visual = document.createElement("div");
    visual.className = className;
    [...stage.children].filter((child) => child !== ring).forEach((child) => visual.appendChild(child));
    stage.insertBefore(visual, ring);
  };

  if (riddle === "movement-direction") {
    [document.getElementById("boardStage"), document.querySelector(".result-stage")].forEach((stage) => {
      wrapStageVisual(stage, ".plot-ring", "responsive-direction-visual");
      stage?.classList.add("responsive-direction-stage");
    });
  }

  if (riddle === "skin-temperature") {
    const prepareGauge = (stage, gaugeSelector, ringSelector) => {
      if (!stage || stage.querySelector(":scope > .responsive-gauge-visual")) return;
      const gauge = stage.querySelector(`:scope > ${gaugeSelector}`);
      const ring = stage.querySelector(`:scope > ${ringSelector}`);
      if (!gauge || !ring) return;
      const visual = document.createElement("div");
      visual.className = "responsive-gauge-visual";
      visual.appendChild(gauge);
      stage.insertBefore(visual, ring.nextSibling);
      stage.classList.add("responsive-gauge-stage");
    };

    prepareGauge(document.getElementById("gaugeStage"), "#temperatureGauge", ".plot-orbit");
    prepareGauge(document.querySelector(".result-gauge-stage"), "#resultTemperatureGauge", ".result-orbit");
  }
})();

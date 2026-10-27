(() => {
  "use strict";

  const assets = window.NEURON_ASSETS;
  if (!assets || assets.trials?.length !== 20 || assets.aiTrials?.length !== 100) {
    document.body.innerHTML = '<p style="padding:2rem">שגיאה בטעינת נתוני הסימולציה.</p>';
    throw new Error("Missing neuron assets");
  }

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const screens = ["intro", "aggregate", "classify", "review", "ai-explain", "split", "ai-train", "ai-test"];
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const byId = new Map(assets.trials.map((trial) => [trial.id, trial]));
  const aiById = new Map(assets.aiTrials.map((trial) => [trial.id, trial]));

  const state = {
    screen: "intro", order: [], index: 0, choices: new Map(), choiceOrder: [], locked: false,
    testIds: new Set(), openedSteps: new Set(), modelTrained: false, training: false,
    testOrder: [], wrongIds: new Set(), predictions: new Map(), predictionOrder: [], testBusy: false,
    modelChecked: false, modelResult: null, mcq1: "", mcq2: "", mcqOrders: null,
  };

  function shuffle(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i -= 1) {
      const values = new Uint32Array(1); crypto.getRandomValues(values);
      const j = values[0] % (i + 1); [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  const truthLabel = (truth) => truth === "word" ? "מילה" : "לא־מילה";
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function setScreen(name) {
    const step = screens.indexOf(name) + 1;
    if (step < 1) return;
    state.screen = name;
    $$(".screen").forEach((screen) => screen.classList.toggle("active", screen.id === `screen-${name}`));
    $$(".step-segment").forEach((segment, index) => segment.classList.toggle("active", index < step));
    $("#stepLabel").textContent = `שלב ${step} מתוך 8`;
    $("#stepTrack").setAttribute("aria-valuenow", String(step));
    if (name === "classify") initClassification();
    if (name === "review") renderReview();
    if (name === "ai-explain") {
      renderLearningSteps();
      if (state.openedSteps.has(1)) requestAnimationFrame(() => animateSplitDemo());
    } else stopSplitDemo();
    if (name === "split") renderSplit();
    if (name === "ai-train") renderTraining();
    if (name === "ai-test") initTestScreen();
    const heading = $(`#screen-${name} h1, #screen-${name} h2`);
    if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
    scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
  }

  function resetAfterClassification() {
    state.testIds.clear(); state.openedSteps.clear(); state.modelTrained = false; state.training = false;
    state.testOrder = []; state.wrongIds.clear(); state.predictions.clear(); state.predictionOrder = [];
    state.testBusy = false; state.modelChecked = false; state.modelResult = null; state.mcq1 = ""; state.mcq2 = ""; state.mcqOrders = null;
    ["percentAnswer", "randomGuessAnswer", "randomComparison", "modelPercentAnswer", "modelComparison", "finalInterpretation"].forEach((id) => { const element = $(`#${id}`); if (element) element.value = ""; });
    $("#toAIExplain").disabled = true;
  }

  function resetClassification() {
    state.order = shuffle(assets.trials.map((trial) => trial.id)); state.index = 0; state.choices.clear(); state.choiceOrder = []; state.locked = false;
    resetAfterClassification(); $("#classificationComplete").hidden = true; $("#currentTrial").hidden = false; renderClassification();
  }
  function initClassification() { if (!state.order.length) resetClassification(); else renderClassification(); }
  function miniTrace(trial, extraClass = "") {
    const wrapper = document.createElement("div"); wrapper.className = `mini-trace ${extraClass}`.trim();
    const image = document.createElement("img"); image.src = trial.src; image.alt = ""; wrapper.append(image); return wrapper;
  }
  function renderClassification() {
    const wordStack = $("#wordStack"); const nonwordStack = $("#nonwordStack"); wordStack.replaceChildren(); nonwordStack.replaceChildren();
    state.choiceOrder.forEach((id) => { const choice = state.choices.get(id); (choice === "word" ? wordStack : nonwordStack).append(miniTrace(byId.get(id))); });
    const wordCount = [...state.choices.values()].filter((choice) => choice === "word").length;
    $("#wordCount").textContent = `${wordCount} דוגמאות`; $("#nonwordCount").textContent = `${state.choices.size - wordCount} דוגמאות`; $("#classificationProgress").textContent = `${state.choices.size} מתוך 20`;
    const complete = state.index >= state.order.length; $("#classificationComplete").hidden = !complete; $("#currentTrial").hidden = complete;
    if (!complete) { const trial = byId.get(state.order[state.index]); $("#trialImage").src = trial.src; $("#trialIndex").textContent = `דוגמה ${state.index + 1} מתוך 20`; }
  }
  async function animateChoice(choice) {
    if (state.locked || state.index >= state.order.length) return;
    state.locked = true; $("#chooseWord").disabled = true; $("#chooseNonword").disabled = true;
    const id = state.order[state.index]; const image = $("#trialImage"); const destination = choice === "word" ? $("#wordBin") : $("#nonwordBin");
    if (!reducedMotion && image.animate) {
      const start = image.getBoundingClientRect(); const end = destination.getBoundingClientRect();
      const dx = end.left + end.width / 2 - (start.left + start.width / 2); const dy = end.top + 85 - (start.top + start.height / 2);
      await image.animate([{ transform: "translate(0,0) scale(1)", opacity: 1 }, { transform: `translate(${dx}px,${dy}px) scale(.24)`, opacity: .2 }], { duration: 430, easing: "cubic-bezier(.2,.8,.25,1)" }).finished.catch(() => {});
    }
    state.choices.set(id, choice); state.choiceOrder.push(id); state.index += 1; state.locked = false; $("#chooseWord").disabled = false; $("#chooseNonword").disabled = false; renderClassification();
  }
  const correctCount = () => assets.trials.reduce((total, trial) => total + (state.choices.get(trial.id) === trial.truth ? 1 : 0), 0);
  function reviewItem(trial) {
    const correct = state.choices.get(trial.id) === trial.truth; const item = document.createElement("div"); item.className = `review-item ${correct ? "correct" : "incorrect"}`;
    item.innerHTML = `<img alt="" src="${trial.src}"><div class="review-status">${correct ? "✓ נכון" : `✕ לא נכון — ${truthLabel(trial.truth)}`}</div>`; return item;
  }
  function renderReview() {
    if (state.choices.size !== 20) return setScreen("classify");
    const word = $("#reviewWordList"); const nonword = $("#reviewNonwordList"); word.replaceChildren(); nonword.replaceChildren();
    state.choiceOrder.forEach((id) => { const trial = byId.get(id); (state.choices.get(id) === "word" ? word : nonword).append(reviewItem(trial)); }); syncReviewContinue();
  }
  function parsePercent(value) { const normalized = String(value).trim().replace("%", "").replace(",", "."); return normalized === "" ? NaN : Number(normalized); }
  function syncReviewContinue() {
    const own = parsePercent($("#percentAnswer").value); const random = parsePercent($("#randomGuessAnswer").value); const explanation = $("#randomComparison").value.trim();
    $("#toAIExplain").disabled = !(Math.abs(own - correctCount() * 5) < .01 && random === 50 && explanation.length > 0);
  }

  function renderLearningSteps() {
    $$(".learning-accordion").forEach((card, index) => {
      const available = index === 0 || state.openedSteps.has(index - 1); const opened = state.openedSteps.has(index);
      card.hidden = false; card.classList.toggle("unavailable", !available); card.classList.toggle("opened", opened);
      $(".learning-detail", card).hidden = !opened; $(".learning-toggle", card).disabled = !available; $(".learning-toggle", card).setAttribute("aria-expanded", String(opened));
    });
    $("#toSplit").hidden = state.openedSteps.size < 4;
  }
  function openLearningStep(card) {
    const index = Number(card.dataset.learningStep); state.openedSteps.add(index); renderLearningSteps();
    if (index === 1) requestAnimationFrame(() => animateSplitDemo());
    const next = $(`.learning-accordion[data-learning-step="${index + 1}"]`); if (next) next.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
  }

  function stopSplitDemo() {
    const demo = $(".split-demo");
    if (demo) demo._splitLoopToken = (demo._splitLoopToken || 0) + 1;
    $$(".split-demo-flyer").forEach((item) => item.remove());
  }

  function animateSplitDemo(loopToken = null) {
    const demo = $(".split-demo"); if (!demo) return;
    const token = loopToken === null ? (demo._splitLoopToken || 0) + 1 : loopToken;
    if (loopToken === null) demo._splitLoopToken = token;
    if (demo._splitLoopToken !== token || state.screen !== "ai-explain") return;
    const source = {
      word: $$('[data-split-source="word"] img', demo),
      nonword: $$('[data-split-source="nonword"] img', demo),
    };
    const destinations = {
      word: [...$$('[data-split-destination="train-word"] img', demo), ...$$('[data-split-destination="test-word"] img', demo)],
      nonword: [...$$('[data-split-destination="train-nonword"] img', demo), ...$$('[data-split-destination="test-nonword"] img', demo)],
    };
    $$(".split-demo-flyer").forEach((item) => item.remove());
    Object.values(source).flat().forEach((image) => { image.style.opacity = "1"; });
    Object.values(destinations).flat().forEach((image) => { image.style.opacity = reducedMotion ? "1" : "0"; });
    if (reducedMotion) return;

    const moves = [
      ["word", 0], ["nonword", 0], ["word", 1], ["nonword", 1],
      ["word", 3], ["nonword", 3], ["word", 2], ["nonword", 2],
    ];
    moves.forEach(([truth, sourceIndex], order) => {
      const from = source[truth][sourceIndex];
      const destinationIndex = sourceIndex === 3 ? 3 : sourceIndex;
      const to = destinations[truth][destinationIndex];
      if (!from || !to) return;
      window.setTimeout(() => {
        if (!demo.isConnected || !demo.closest(".opened") || demo._splitLoopToken !== token || state.screen !== "ai-explain") return;
        const start = from.getBoundingClientRect(); const finish = to.getBoundingClientRect();
        const flyer = from.cloneNode(); flyer.className = `${from.className} split-demo-flyer`;
        Object.assign(flyer.style, { position: "fixed", left: `${start.left}px`, top: `${start.top}px`, width: `${start.width}px`, height: `${start.height}px`, margin: "0", zIndex: "100", pointerEvents: "none" });
        document.body.append(flyer); from.style.opacity = ".18";
        const movement = flyer.animate([
          { transform: "translate(0,0) scale(1)", opacity: 1 },
          { transform: `translate(${finish.left - start.left}px,${finish.top - start.top}px) scale(${finish.width / start.width})`, opacity: .96 },
        ], { duration: 1240, easing: "cubic-bezier(.2,.75,.2,1)", fill: "forwards" });
        movement.finished.then(() => { to.style.opacity = "1"; to.animate([{ opacity: .3 }, { opacity: 1 }], { duration: 440 }); flyer.remove(); }).catch(() => flyer.remove());
      }, 360 * order);
    });
    window.setTimeout(() => {
      if (demo._splitLoopToken === token && state.screen === "ai-explain" && demo.closest(".opened")) animateSplitDemo(token);
    }, 4700);
  }

  function clearModelWork() {
    state.modelTrained = false; state.training = false; state.testOrder = []; state.wrongIds.clear(); state.predictions.clear(); state.predictionOrder = []; state.testBusy = false; state.modelChecked = false; state.modelResult = null; state.mcq1 = ""; state.mcq2 = ""; state.mcqOrders = null;
  }
  function datasetCard(trial, inTest) {
    const button = document.createElement("button"); button.type = "button"; button.className = "dataset-card"; button.setAttribute("aria-label", `${truthLabel(trial.truth)}, העברה לסט ${inTest ? "האימון" : "הבחינה"}`);
    button.innerHTML = `<img alt="" src="${trial.src}"><span class="truth-chip ${trial.truth}">${truthLabel(trial.truth)} ${trial.number}</span>`; button.addEventListener("click", () => toggleSplit(trial)); return button;
  }
  function toggleSplit(trial) {
    if (state.testIds.has(trial.id)) state.testIds.delete(trial.id);
    else {
      const sameTruth = [...state.testIds].filter((id) => aiById.get(id).truth === trial.truth).length;
      if (state.testIds.size >= 20 || sameTruth >= 10) return;
      state.testIds.add(trial.id);
    }
    clearModelWork(); renderSplit();
  }
  function renderSplit() {
    const trainGrid = $("#trainGrid"); const testGrid = $("#testGrid"); trainGrid.replaceChildren(); testGrid.replaceChildren();
    assets.aiTrials.forEach((trial) => { const inTest = state.testIds.has(trial.id); (inTest ? testGrid : trainGrid).append(datasetCard(trial, inTest)); });
    const testing = assets.aiTrials.filter((trial) => state.testIds.has(trial.id)); const words = testing.filter((trial) => trial.truth === "word").length; const nonwords = testing.length - words;
    $("#testCount").textContent = `${testing.length}/20`; $("#trainCount").textContent = `${100 - testing.length}/80`; $("#testWordCount").textContent = `${words} מילים`; $("#testNonwordCount").textContent = `${nonwords} לא־מילים`; $("#trainWordCount").textContent = `${50 - words} מילים`; $("#trainNonwordCount").textContent = `${50 - nonwords} לא־מילים`; $("#testEmpty").hidden = testing.length > 0;
    const ready = words === 10 && nonwords === 10; $("#balanceStatus").textContent = ready ? "10 מילים ו־10 לא־מילים" : `${words}/10 מילים · ${nonwords}/10 לא־מילים`; $("#toAITrain").disabled = !ready;
  }

  function trainingThumbs(trials, target) {
    const root = $(target); root.replaceChildren(); trials.slice(0, 12).forEach((trial) => { const img = document.createElement("img"); img.src = trial.src; img.alt = ""; root.append(img); });
  }
  function renderTraining() {
    const training = assets.aiTrials.filter((trial) => !state.testIds.has(trial.id));
    if (training.length !== 80) return setScreen("split");
    $(".training-flow-arrow").textContent = "→";
    trainingThumbs(training.filter((trial) => trial.truth === "word"), "#trainWordThumbs"); trainingThumbs(training.filter((trial) => trial.truth === "nonword"), "#trainNonwordThumbs");
    $("#trainingModelCard").classList.toggle("trained", state.modelTrained); $("#trainingModelCard").classList.toggle("training", state.training); $("#trainingModelLabel").textContent = state.modelTrained ? "מודל AI מאומן" : "מודל AI"; $("#trainingBar").style.width = state.modelTrained ? "100%" : "0%"; $("#startTraining").hidden = state.modelTrained; $("#toAITest").hidden = !state.modelTrained;
  }
  async function startTraining() {
    if (state.training || state.modelTrained || state.testIds.size !== 20) return;
    state.training = true; $("#startTraining").disabled = true; $("#trainingModelLabel").textContent = "אימון"; $("#trainingModelCard").classList.add("training");
    const duration = window.NEURON_FAST_TEST ? 120 : 10000; const start = performance.now();
    await new Promise((resolve) => {
      function frame(now) { const progress = Math.min(1, (now - start) / duration); $("#trainingBar").style.width = `${progress * 100}%`; if (progress < 1) requestAnimationFrame(frame); else resolve(); }
      requestAnimationFrame(frame);
    });
    state.training = false; state.modelTrained = true; $("#startTraining").disabled = false; renderTraining();
  }

  function initTestScreen() {
    if (!state.modelTrained) return setScreen("ai-train");
    if (!state.testOrder.length) {
      state.testOrder = shuffle(assets.aiTrials.filter((trial) => state.testIds.has(trial.id)).map((trial) => trial.id));
      state.wrongIds = new Set([state.testOrder[2], state.testOrder[9], state.testOrder[16]]);
    }
    if (!state.mcqOrders) initMcqs(); renderTest();
  }
  function queueCard(trial) {
    const button = document.createElement("button"); button.type = "button"; button.className = "test-queue-card"; button.innerHTML = `<img alt="" src="${trial.src}">`; button.setAttribute("aria-label", `${truthLabel(trial.truth)} ${trial.number}`); button.addEventListener("click", () => predictTrial(trial)); return button;
  }
  function predictionTile(trial, revealed = false) {
    const prediction = state.predictions.get(trial.id); const correct = prediction === trial.truth; const item = document.createElement("div"); item.className = `prediction-tile${revealed ? ` ${correct ? "correct" : "incorrect"}` : ""}`;
    item.innerHTML = `<img alt="" src="${trial.src}">${revealed ? `<span>${correct ? "✓ נכון" : `✕ לא נכון — ${truthLabel(trial.truth)}`}</span>` : ""}`; return item;
  }
  function renderTest() {
    const queue = $("#testQueue"); const word = $("#modelWordList"); const nonword = $("#modelNonwordList"); queue.replaceChildren(); word.replaceChildren(); nonword.replaceChildren();
    state.testOrder.forEach((id) => { if (!state.predictions.has(id)) queue.append(queueCard(aiById.get(id))); });
    state.predictionOrder.forEach((id) => { const trial = aiById.get(id); (state.predictions.get(id) === "word" ? word : nonword).append(predictionTile(trial)); });
    $("#testProgress").textContent = `${state.predictions.size}/20`; $("#checkModel").hidden = state.predictions.size !== 20 || state.modelChecked; $("#modelSummary").hidden = !state.modelChecked;
    if (state.modelChecked) renderCheckedResults();
  }
  async function predictTrial(trial) {
    if (state.testBusy || state.predictions.has(trial.id) || state.modelChecked) return;
    state.testBusy = true; $$(".test-queue-card").forEach((button) => { button.disabled = true; }); $("#testModelInput").src = trial.src; $("#testModelCard").classList.add("thinking");
    await wait(window.NEURON_FAST_TEST ? 20 : 1000);
    const predicted = state.wrongIds.has(trial.id) ? (trial.truth === "word" ? "nonword" : "word") : trial.truth;
    state.predictions.set(trial.id, predicted); state.predictionOrder.push(trial.id); state.testBusy = false; $("#testModelCard").classList.remove("thinking"); $("#testModelInput").removeAttribute("src"); renderTest();
  }
  function renderCheckedResults() {
    const word = $("#checkedWordList"); const nonword = $("#checkedNonwordList"); word.replaceChildren(); nonword.replaceChildren();
    state.predictionOrder.forEach((id) => { const trial = aiById.get(id); (state.predictions.get(id) === "word" ? word : nonword).append(predictionTile(trial, true)); }); syncDownload();
  }
  function checkModel() {
    if (state.predictions.size !== 20) return;
    const predictions = state.testOrder.map((id) => ({ id, truth: aiById.get(id).truth, predicted: state.predictions.get(id) }));
    state.modelResult = { correct: 17, total: 20, percent: 85, predictions }; state.modelChecked = true; renderTest(); $("#modelSummary").scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  }

  const mcqData = {
    q1: [
      "סט בחינה של דוגמאות עליהן יוכל להתאמן",
      "סט אימון שעליו נבדוק את הצלחתו לאחר האימון",
      "סט של דוגמאות של פעילות הנוירון עם התשובה הנכונה לכל דוגמה",
      "סט של מילים ושל לא-מילים",
    ],
    q2: [
      "אם הוא יכול לתת תשובה נכונה יותר מאשר לפי ניחוש אקראי בדוגמאות של סט הבחינה",
      "אם הוא יכול לתת תשובה נכונה יותר מאשר לפי ניחוש אקראי בדוגמאות של סט האימון",
      "אם הוא יכול לחזות את התשובה הנכונה לפחות ב-50% בדוגמאות של סט האימון.",
      "אם הוא יכול לחזות את התשובה הנכונה לפחות ב-50% בדוגמאות של סט הבחינה.",
    ],
  };
  function initMcqs() {
    state.mcqOrders = { q1: shuffle(mcqData.q1), q2: shuffle(mcqData.q2) };
    [["q1", "#mcq1Options"], ["q2", "#mcq2Options"]].forEach(([key, target]) => {
      const root = $(target); root.replaceChildren(); state.mcqOrders[key].forEach((answer, index) => {
        const label = document.createElement("label"); label.className = "mcq-option"; label.innerHTML = `<input type="radio" name="${key}" value="${index}"><span>${answer}</span>`;
        $("input", label).addEventListener("change", () => { state[key === "q1" ? "mcq1" : "mcq2"] = answer; syncDownload(); }); root.append(label);
      });
    });
  }
  function syncDownload() {
    if (!state.modelChecked) return;
    const ready = $("#modelPercentAnswer").value.trim() && $("#modelComparison").value.trim() && $("#finalInterpretation").value.trim() && state.mcq1 && state.mcq2;
    $("#downloadReport").disabled = !ready;
  }
  function populateStepIllustrations() {
    const words = assets.aiTrials.filter((trial) => trial.truth === "word");
    const nonwords = assets.aiTrials.filter((trial) => trial.truth === "nonword");
    const addImages = (root, trials) => {
      root.replaceChildren();
      trials.forEach((trial) => {
        const image = document.createElement("img"); image.src = trial.src; image.alt = ""; root.append(image);
      });
    };
    addImages($("[data-examples='word']"), words.slice(0, 6));
    addImages($("[data-examples='nonword']"), nonwords.slice(0, 6));
    const addSplitImages = (selector, trials) => {
      const grid = $(`${selector} .split-demo-grid`); grid.replaceChildren();
      trials.forEach((trial, index) => {
        const image = document.createElement("img"); image.src = trial.src; image.alt = "";
        image.className = `split-demo-trace ${trial.truth}`; image.style.setProperty("--item-index", index); grid.append(image);
      });
    };
    addSplitImages("[data-split-source='word']", words.slice(1, 5));
    addSplitImages("[data-split-source='nonword']", nonwords.slice(1, 5));
    addSplitImages("[data-split-destination='train-word']", words.slice(1, 4));
    addSplitImages("[data-split-destination='train-nonword']", nonwords.slice(1, 4));
    addSplitImages("[data-split-destination='test-word']", words.slice(4, 5));
    addSplitImages("[data-split-destination='test-nonword']", nonwords.slice(4, 5));
    addSplitImages("[data-stage3-training='word']", words.slice(1, 4));
    addSplitImages("[data-stage3-training='nonword']", nonwords.slice(1, 4));
    $("[data-test-example]").src = words[9].src;
  }
  function polishModelDiagrams() {
    const network = `<svg viewBox="0 0 320 250" focusable="false" aria-hidden="true">
      <g class="neural-edges"><line x1="48" y1="45" x2="150" y2="78"/><line x1="48" y1="45" x2="150" y2="170"/><line x1="38" y1="125" x2="150" y2="78"/><line x1="38" y1="125" x2="150" y2="170"/><line x1="72" y1="208" x2="150" y2="170"/><line x1="72" y1="208" x2="150" y2="78"/><line x1="150" y1="78" x2="267" y2="52"/><line x1="150" y1="78" x2="278" y2="132"/><line x1="150" y1="170" x2="278" y2="132"/><line x1="150" y1="170" x2="244" y2="210"/></g>
      <g class="neural-nodes"><circle cx="48" cy="45" r="11"/><circle cx="38" cy="125" r="11"/><circle cx="72" cy="208" r="11"/><circle cx="150" cy="78" r="11"/><circle cx="150" cy="170" r="11"/><circle cx="267" cy="52" r="11"/><circle cx="278" cy="132" r="11"/><circle cx="244" cy="210" r="11"/></g>
    </svg>`;
    $$(".neural-network").forEach((root) => { root.innerHTML = network; });
    $("#aiTrainTitle").innerHTML = "<span>מאמנים, בוחנים - ומפענחים מה הנוירון אמר</span><span>באמצעות AI</span>";
    $("label[for='finalInterpretation']").textContent = "מה נוכל לומר כמדענים/ות על התפקיד של הנוירון מהעובדה שהמודל הצליח לנבא מהפעילות שלו מה האדם ראה?";
    $$(".mcq-card legend").forEach((legend, index) => {
      const prompt = document.createElement("div"); prompt.className = "mcq-prompt"; prompt.id = `mcqPrompt${index + 1}`; prompt.textContent = legend.textContent;
      legend.parentElement.setAttribute("aria-labelledby", prompt.id); legend.replaceWith(prompt);
    });
  }
  function buildReportState() {
    return {
      trials: assets.trials.map((trial) => ({ ...trial, userChoice: state.choices.get(trial.id) })),
      aiTrials: assets.aiTrials.map((trial) => ({ ...trial, split: state.testIds.has(trial.id) ? "test" : "train" })),
      correctCount: correctCount(), percentAnswer: $("#percentAnswer").value.trim(), randomGuessAnswer: $("#randomGuessAnswer").value.trim(), randomComparison: $("#randomComparison").value.trim(),
      modelResult: state.modelResult, modelPercentAnswer: $("#modelPercentAnswer").value.trim(), modelComparison: $("#modelComparison").value.trim(), finalInterpretation: $("#finalInterpretation").value.trim(), mcq1: state.mcq1, mcq2: state.mcq2,
    };
  }
  async function downloadReport() {
    if (!window.NeuronReport || !state.modelResult) return;
    const button = $("#downloadReport"); button.disabled = true; $("#downloadStatus").textContent = "יוצר את קובץ ה־Word…";
    try { await window.NeuronReport.download(buildReportState()); $("#downloadStatus").textContent = "הדוח נוצר וההורדה החלה."; }
    catch (error) { console.error(error); $("#downloadStatus").textContent = "לא הצלחנו ליצור את הדוח. נסו שוב."; }
    finally { syncDownload(); }
  }
  function resetAll() { resetClassification(); setScreen("intro"); }

  $("#capturePlot").src = assets.capture; $("#classificationReferencePlot").src = assets.capture; populateStepIllustrations(); polishModelDiagrams();
  $$('[data-next]').forEach((button) => button.addEventListener("click", () => setScreen(button.dataset.next))); $$('[data-back]').forEach((button) => button.addEventListener("click", () => setScreen(button.dataset.back)));
  $("#chooseWord").addEventListener("click", () => animateChoice("word")); $("#chooseNonword").addEventListener("click", () => animateChoice("nonword")); $("#resetClassification").addEventListener("click", resetClassification); $("#checkSorting").addEventListener("click", () => setScreen("review"));
  ["percentAnswer", "randomGuessAnswer", "randomComparison"].forEach((id) => $(`#${id}`).addEventListener("input", syncReviewContinue)); $("#toAIExplain").addEventListener("click", () => setScreen("ai-explain"));
  $$(".learning-accordion").forEach((card) => $(".learning-toggle", card).addEventListener("click", () => openLearningStep(card))); $("#toSplit").addEventListener("click", () => setScreen("split")); $("#toAITrain").addEventListener("click", () => setScreen("ai-train"));
  $("#startTraining").addEventListener("click", startTraining); $("#toAITest").addEventListener("click", () => setScreen("ai-test")); $("#checkModel").addEventListener("click", checkModel);
  ["modelPercentAnswer", "modelComparison", "finalInterpretation"].forEach((id) => $(`#${id}`).addEventListener("input", syncDownload)); $("#downloadReport").addEventListener("click", downloadReport); $("#restartAll").addEventListener("click", resetAll);
  document.addEventListener("keydown", (event) => { if (state.screen !== "classify" || state.locked || state.index >= state.order.length) return; if (event.key === "ArrowRight") { event.preventDefault(); animateChoice("word"); } if (event.key === "ArrowLeft") { event.preventDefault(); animateChoice("nonword"); } });
  setScreen("intro");
})();

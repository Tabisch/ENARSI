(function () {
  "use strict";

  // Each page sets <body data-quiz="builtin|custom">: the built-in page uses
  // data/questions.js, the custom page only uses a JSON file the user loads.
  const MODE = document.body.dataset.quiz === "custom" ? "custom" : "builtin";
  const BUILTIN = MODE === "builtin" ? window.ENARSI_QUESTIONS || [] : [];
  const PASS_PCT = 80; // Cisco does not publish the cut score; 80% is a sensible target.
  const SECONDS_PER_QUESTION = 120; // ENARSI is roughly 2 minutes per question.
  const LETTERS = "ABCDEFGH";
  const NUMBER_WORDS = { 2: "two", 3: "three", 4: "four" };
  const MAX_OPTIONS = LETTERS.length;

  // Custom question set loaded from a JSON file (null = built-in only)
  let custom = null;

  const $ = (id) => document.getElementById(id);
  const el = (tag, props = {}, children = []) => {
    const node = Object.assign(document.createElement(tag), props);
    for (const c of [].concat(children)) node.append(c);
    return node;
  };

  const state = {
    mode: "practice",
    questions: [], // { q, order: [original option indexes in display order] }
    index: 0,
    responses: [], // array of sets of original option indexes
    answered: false,
    timerId: null,
    deadline: 0
  };

  // ───────────── Helpers ─────────────
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function isCorrect(q, chosen) {
    return chosen.size === q.answer.length && q.answer.every((i) => chosen.has(i));
  }

  function show(section) {
    for (const id of ["setup", "quiz", "results"]) $(id).hidden = id !== section;
    window.scrollTo(0, 0);
  }

  function activeBank() {
    if (MODE === "custom") return custom ? custom.questions : [];
    return BUILTIN;
  }

  // ───────────── Custom question sets ─────────────
  // Validates parsed JSON and returns { questions, errors }. Accepts either an
  // array of questions or an object with a "questions" array. Two question
  // formats are supported:
  //   built-in:  options: [..],        answer: [0, 2]
  //   lettered:  options: {A: .., ..}, correct_answer: ["A", "C"],
  //              why_other_options_are_wrong: {B: ..}, verification, confidence
  function parseQuestionSet(data) {
    const list = Array.isArray(data) ? data : data && Array.isArray(data.questions) ? data.questions : null;
    if (!list) return { questions: [], errors: ["The file must contain an array of questions (or an object with a \"questions\" array)."] };

    const questions = [];
    const errors = [];
    list.forEach((item, i) => {
      const result = normalizeQuestion(item, i);
      if (typeof result === "string") {
        const label = `Question ${i + 1}` + (item && isText(item.id) ? ` ("${item.id}")` : "");
        errors.push(`${label}: ${result}`);
      } else {
        questions.push(result);
      }
    });
    return { questions, errors };
  }

  function isText(v) {
    return typeof v === "string" && v.trim() !== "";
  }

  // Returns a normalized question, or an error message string.
  function normalizeQuestion(item, i) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return "must be an object.";
    if (!isText(item.question)) return "\"question\" must be a non-empty string.";

    // Options: array, or object keyed by letter ({ "A": "...", "B": "..." })
    let options;
    let keys = null;
    if (Array.isArray(item.options)) {
      options = item.options;
    } else if (item.options && typeof item.options === "object") {
      keys = Object.keys(item.options).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      options = keys.map((k) => item.options[k]);
    }
    if (!options || options.length < 2 || options.length > MAX_OPTIONS || !options.every(isText)) {
      return `"options" must be an array or a letter-keyed object of 2–${MAX_OPTIONS} non-empty strings.`;
    }

    // Answer: "answer" (indexes) or "correct_answer" (letters, e.g. ["B", "D"] or "B, D")
    let answer;
    const raw = item.correct_answer != null ? item.correct_answer : item.answer;
    if (raw == null) return "missing \"answer\" or \"correct_answer\".";
    const parts = Array.isArray(raw) ? raw : typeof raw === "string" ? raw.split(/[\s,;/]+/).filter(Boolean) : [raw];
    const letterIndex = (v) => {
      const key = String(v).trim().toUpperCase();
      const pool = keys || options.map((_, n) => LETTERS[n]);
      return pool.findIndex((k) => k.toUpperCase() === key);
    };
    answer = parts.map((v) => (Number.isInteger(v) ? v : letterIndex(v)));
    // "BD" written as one token
    if (answer.includes(-1) && parts.length === 1 && typeof parts[0] === "string") {
      answer = [...parts[0]].map(letterIndex);
    }
    if (!answer.length || !answer.every((a) => Number.isInteger(a) && a >= 0 && a < options.length)) {
      const valid = keys ? keys.join(", ") : `0–${options.length - 1}`;
      return `answer must refer to existing options (${valid}).`;
    }
    if (new Set(answer).size !== answer.length) return "answer lists the same option twice.";

    for (const f of ["exhibit", "explanation", "domain", "topic", "confidence"]) {
      if (item[f] != null && typeof item[f] !== "string") return `"${f}" must be a string.`;
    }

    // Per-option notes ("why_other_options_are_wrong"), keyed by letter or index
    const notes = options.map(() => "");
    const why = item.why_other_options_are_wrong;
    if (why && typeof why === "object") {
      for (const [k, v] of Object.entries(why)) {
        const n = /^\d+$/.test(k) && !keys ? Number(k) : letterIndex(k);
        if (n >= 0 && n < options.length && isText(v)) notes[n] = v;
      }
    }

    // Images: [{ location: "question" | "explanation" | <option letter/index>, src, origin? }]
    const images = { question: [], explanation: [], options: options.map(() => []) };
    if (item.images != null) {
      if (!Array.isArray(item.images)) return "\"images\" must be an array.";
      for (const [n, img] of item.images.entries()) {
        const entry = typeof img === "string" ? { src: img } : img;
        if (!entry || typeof entry !== "object") return `image ${n + 1} must be an object or a URL string.`;
        const src = [entry.src, entry.origin].find(isSafeImageUrl);
        if (!src) return `image ${n + 1} needs a "src" (or "origin") that is a data:image URL or an http(s) URL.`;
        const fallback = entry.origin !== src && isSafeImageUrl(entry.origin) ? entry.origin : "";
        const pic = { src, fallback, alt: isText(entry.alt) ? entry.alt : "" };
        const loc = entry.location == null ? "question" : String(entry.location).trim();
        const lower = loc.toLowerCase();
        if (lower === "question" || lower === "exhibit") images.question.push(pic);
        else if (lower === "explanation") images.explanation.push(pic);
        else {
          const idx = /^\d+$/.test(loc) && !keys ? Number(loc) : letterIndex(loc);
          if (idx < 0 || idx >= options.length) return `image ${n + 1} has an unknown location "${loc}".`;
          images.options[idx].push(pic);
        }
      }
    }

    const v = item.verification;
    const verification =
      v && typeof v === "object"
        ? { verified: v.verified === true ? true : v.verified === false ? false : null, method: isText(v.method) ? v.method : "" }
        : null;

    return {
      id: isText(item.id) ? item.id : `custom-${i + 1}`,
      domain: isText(item.domain) ? item.domain.trim() : "Custom Questions",
      topic: isText(item.topic) ? item.topic.trim() : "General",
      question: item.question,
      exhibit: item.exhibit || "",
      options,
      answer,
      explanation: item.explanation || "",
      notes: notes.some(Boolean) ? notes : null,
      verification,
      confidence: isText(item.confidence) ? item.confidence.trim() : "",
      // Lettered questions often refer to options by letter ("B and D"), so keep their order.
      fixedOrder: !!keys,
      images
    };
  }

  // Only allow inline image data or web URLs as image sources.
  function isSafeImageUrl(u) {
    return typeof u === "string" && (/^data:image\/[a-z0-9.+-]+;base64,/i.test(u.trim()) || /^https?:\/\//i.test(u.trim()));
  }

  // Builds a row of images; click opens the full-size viewer.
  function imageRow(pics) {
    if (!pics || !pics.length) return null;
    return el("div", { className: "q-images" }, pics.map((p) => {
      const img = el("img", { src: p.src, alt: p.alt || "Exhibit image", loading: "lazy", title: "Click to enlarge" });
      if (p.fallback) img.addEventListener("error", () => { if (img.src !== p.fallback) img.src = p.fallback; }, { once: true });
      img.addEventListener("click", (e) => {
        e.stopPropagation(); // don't toggle the answer option the image sits in
        openViewer(img.currentSrc || img.src, img.alt);
      });
      return img;
    }));
  }

  function openViewer(src, alt) {
    const viewer = $("image-viewer");
    $("image-viewer-img").src = src;
    $("image-viewer-img").alt = alt;
    viewer.hidden = false;
  }

  function closeViewer() {
    $("image-viewer").hidden = true;
    $("image-viewer-img").removeAttribute("src");
  }

  // Extra lines shown after the explanation: confidence and verification.
  function metaLine(q) {
    const bits = [];
    if (q.confidence) bits.push(`Confidence: ${q.confidence}`);
    if (q.verification) {
      const status = q.verification.verified === true ? "Verified" : q.verification.verified === false ? "Not verified" : "Verification";
      bits.push(q.verification.method ? `${status}: ${q.verification.method}` : status);
    }
    return bits.length ? el("div", { className: "q-extra", textContent: bits.join(" · ") }) : null;
  }

  function showLoadStatus(ok, message, details = []) {
    const box = $("load-status");
    box.className = "load-status " + (ok ? "ok" : "bad");
    box.innerHTML = "";
    box.append(message);
    if (details.length) {
      const shown = details.slice(0, 5);
      if (details.length > shown.length) shown.push(`…and ${details.length - shown.length} more.`);
      box.append(el("ul", {}, shown.map((d) => el("li", { textContent: d }))));
    }
    box.hidden = false;
  }

  async function loadCustomFile(file) {
    let data;
    try {
      data = JSON.parse(await file.text());
    } catch (err) {
      showLoadStatus(false, `Could not read ${file.name}: not valid JSON (${err.message}).`);
      return;
    }
    const { questions, errors } = parseQuestionSet(data);
    if (!questions.length) {
      showLoadStatus(false, `No valid questions found in ${file.name}.`, errors);
      return;
    }
    custom = { name: file.name, questions };
    showLoadStatus(
      true,
      `Loaded ${questions.length} question${questions.length === 1 ? "" : "s"} from ${file.name}.` +
        (errors.length ? ` Skipped ${errors.length} invalid:` : ""),
      errors
    );
    refreshSetup();
  }

  function clearCustom() {
    custom = null;
    $("load-status").hidden = true;
    refreshSetup();
  }

  function refreshSetup() {
    if (MODE === "custom") {
      $("source-label").textContent = custom ? `${custom.name} (${custom.questions.length})` : "No file loaded yet";
      $("clear-custom-btn").hidden = !custom;
      $("topic-section").hidden = !custom;
    }
    buildTopicList();
    updateCountOptions();
  }

  // ───────────── Setup screen ─────────────
  function buildTopicList() {
    const domains = new Map();
    for (const q of activeBank()) {
      if (!domains.has(q.domain)) domains.set(q.domain, new Map());
      const topics = domains.get(q.domain);
      topics.set(q.topic, (topics.get(q.topic) || 0) + 1);
    }

    const list = $("topic-list");
    list.innerHTML = "";
    for (const [domain, topics] of domains) {
      const domainBox = el("input", { type: "checkbox", checked: true });
      const topicBoxes = [];
      const grid = el("div", { className: "domain-topics" });

      for (const [topic, count] of topics) {
        const box = el("input", { type: "checkbox", checked: true, value: topic, className: "topic-box" });
        box.addEventListener("change", () => {
          syncDomainBox(domainBox, topicBoxes);
          updateCountOptions();
        });
        topicBoxes.push(box);
        grid.append(el("label", { className: "check" }, [box, topic, el("span", { className: "count", textContent: `(${count})` })]));
      }

      domainBox.addEventListener("change", () => {
        topicBoxes.forEach((b) => (b.checked = domainBox.checked));
        domainBox.indeterminate = false;
        updateCountOptions();
      });

      const total = [...topics.values()].reduce((a, b) => a + b, 0);
      list.append(
        el("div", { className: "domain" }, [
          el("h3", {}, [el("label", { className: "check" }, [domainBox, domain, el("span", { className: "count", textContent: `(${total})` })])]),
          grid
        ])
      );
    }
  }

  function syncDomainBox(domainBox, topicBoxes) {
    const n = topicBoxes.filter((b) => b.checked).length;
    domainBox.checked = n === topicBoxes.length;
    domainBox.indeterminate = n > 0 && n < topicBoxes.length;
  }

  function selectedTopics() {
    return new Set([...document.querySelectorAll(".topic-box:checked")].map((b) => b.value));
  }

  function updateCountOptions() {
    const available = activeBank().filter((q) => selectedTopics().has(q.topic)).length;
    const select = $("question-count");
    const previous = select.value;
    select.innerHTML = "";
    const choices = [10, 20, 30, 50].filter((n) => n < available);
    for (const n of choices) select.append(el("option", { value: n, textContent: n }));
    select.append(el("option", { value: available, textContent: `All (${available})` }));
    if ([...select.options].some((o) => o.value === previous)) select.value = previous;
    else if (choices.includes(20)) select.value = 20;
    $("start-btn").disabled = available === 0;
  }

  function setAllTopics(checked) {
    document.querySelectorAll("#topic-list input[type=checkbox]").forEach((b) => {
      b.checked = checked;
      b.indeterminate = false;
    });
    updateCountOptions();
  }

  // ───────────── Quiz flow ─────────────
  function startQuiz(pool) {
    if (!pool.length) {
      $("setup-error").textContent = "Select at least one topic.";
      $("setup-error").hidden = false;
      return;
    }
    $("setup-error").hidden = true;
    state.questions = pool.map((q) => {
      const order = q.options.map((_, i) => i);
      return { q, order: q.fixedOrder ? order : shuffle(order) };
    });
    state.responses = state.questions.map(() => new Set());
    state.index = 0;
    show("quiz");
    startTimer();
    renderQuestion();
  }

  function renderQuestion() {
    const { q, order } = state.questions[state.index];
    const total = state.questions.length;
    state.answered = false;

    $("progress-bar").style.width = `${(state.index / total) * 100}%`;
    $("q-counter").textContent = `Question ${state.index + 1} of ${total}`;
    $("q-topic").textContent = q.topic;
    $("q-text").textContent = q.question;

    $("q-exhibit-wrap").hidden = !q.exhibit;
    $("q-exhibit").textContent = q.exhibit || "";

    const qImages = $("q-images");
    qImages.innerHTML = "";
    const qRow = q.images && imageRow(q.images.question);
    if (qRow) qImages.append(...qRow.childNodes);
    qImages.hidden = !qRow;

    const multi = q.answer.length > 1;
    $("q-hint").textContent = multi
      ? `Select ${NUMBER_WORDS[q.answer.length] || q.answer.length} answers.`
      : "Select one answer.";

    const list = $("q-options");
    list.innerHTML = "";
    list.classList.remove("locked");
    order.forEach((orig, pos) => {
      const input = el("input", {
        type: multi ? "checkbox" : "radio",
        name: "answer",
        value: orig
      });
      const body = el("span", { className: "option-text" }, [el("span", { textContent: q.options[orig] })]);
      const optRow = q.images && imageRow(q.images.options[orig]);
      if (optRow) body.append(optRow);
      const li = el("li", { className: "option" }, [
        input,
        el("span", { className: "letter", textContent: LETTERS[pos] + "." }),
        body
      ]);
      li.addEventListener("click", (e) => {
        if (state.answered) return;
        if (e.target !== input) input.checked = multi ? !input.checked : true;
        readSelection();
      });
      list.append(li);
    });

    $("feedback").hidden = true;
    $("submit-btn").textContent = "Submit";
    $("submit-btn").disabled = true;
  }

  function readSelection() {
    const { q } = state.questions[state.index];
    const chosen = new Set();
    document.querySelectorAll("#q-options .option").forEach((li) => {
      const input = li.querySelector("input");
      li.classList.toggle("selected", input.checked);
      if (input.checked) chosen.add(Number(input.value));
    });
    state.responses[state.index] = chosen;
    // Like the real exam, require exactly the requested number of selections.
    $("submit-btn").disabled = chosen.size !== q.answer.length;
  }

  function toggleByLetter(pos) {
    const items = document.querySelectorAll("#q-options .option");
    if (pos < items.length) items[pos].click();
  }

  function submit() {
    if (state.answered) return next();
    const { q } = state.questions[state.index];
    const chosen = state.responses[state.index];
    if (chosen.size !== q.answer.length) return;

    if (state.mode === "exam") return next();

    state.answered = true;
    $("q-options").classList.add("locked");
    document.querySelectorAll("#q-options .option").forEach((li) => {
      const input = li.querySelector("input");
      const orig = Number(input.value);
      input.disabled = true;
      li.classList.remove("selected");
      if (q.answer.includes(orig)) li.classList.add("correct");
      else if (chosen.has(orig)) li.classList.add("incorrect");
      if (q.notes && q.notes[orig]) li.lastChild.append(el("span", { className: "option-note", textContent: q.notes[orig] }));
    });

    const ok = isCorrect(q, chosen);
    const fb = $("feedback");
    fb.className = "feedback " + (ok ? "ok" : "bad");
    fb.innerHTML = "";
    fb.append(el("strong", { textContent: ok ? "Correct" : "Incorrect" }), q.explanation);
    const fbImages = q.images && imageRow(q.images.explanation);
    if (fbImages) fb.append(fbImages);
    const extra = metaLine(q);
    if (extra) fb.append(extra);
    fb.hidden = false;

    const last = state.index === state.questions.length - 1;
    $("submit-btn").textContent = last ? "See results" : "Next question";
    $("submit-btn").disabled = false;
    $("submit-btn").focus();
  }

  function next() {
    if (state.index < state.questions.length - 1) {
      state.index++;
      renderQuestion();
      window.scrollTo(0, 0);
    } else {
      finish();
    }
  }

  // ───────────── Timer (exam mode) ─────────────
  function startTimer() {
    stopTimer();
    const timer = $("timer");
    if (state.mode !== "exam") {
      timer.hidden = true;
      return;
    }
    state.deadline = Date.now() + state.questions.length * SECONDS_PER_QUESTION * 1000;
    timer.hidden = false;
    const tick = () => {
      const left = Math.max(0, Math.round((state.deadline - Date.now()) / 1000));
      const m = Math.floor(left / 60);
      const s = String(left % 60).padStart(2, "0");
      timer.textContent = `${m}:${s}`;
      timer.classList.toggle("low", left <= 300);
      if (left === 0) finish();
    };
    tick();
    state.timerId = setInterval(tick, 1000);
  }

  function stopTimer() {
    clearInterval(state.timerId);
    state.timerId = null;
  }

  // ───────────── Results ─────────────
  function finish() {
    stopTimer();
    $("timer").hidden = true;

    const results = state.questions.map(({ q, order }, i) => ({
      q,
      order,
      chosen: state.responses[i],
      ok: isCorrect(q, state.responses[i])
    }));
    const correct = results.filter((r) => r.ok).length;
    const pct = Math.round((correct / results.length) * 100);

    $("score-big").textContent = `${pct}%`;
    const verdict = $("score-verdict");
    verdict.textContent = pct >= PASS_PCT ? "Pass" : "Keep studying";
    verdict.className = "verdict " + (pct >= PASS_PCT ? "pass" : "fail");
    $("score-detail").textContent = `${correct} of ${results.length} correct · target ${PASS_PCT}%`;

    // Per-topic breakdown, worst first
    const byTopic = new Map();
    for (const r of results) {
      const t = byTopic.get(r.q.topic) || { domain: r.q.domain, n: 0, ok: 0 };
      t.n++;
      if (r.ok) t.ok++;
      byTopic.set(r.q.topic, t);
    }
    const body = $("breakdown-body");
    body.innerHTML = "";
    [...byTopic.entries()]
      .sort((a, b) => a[1].ok / a[1].n - b[1].ok / b[1].n)
      .forEach(([topic, t]) => {
        body.append(
          el("tr", {}, [
            el("td", { textContent: topic, title: t.domain }),
            el("td", { textContent: `${t.ok}/${t.n}` }),
            el("td", { textContent: `${Math.round((t.ok / t.n) * 100)}%` })
          ])
        );
      });

    state.lastResults = results;
    $("retry-wrong-btn").hidden = correct === results.length;
    renderReview();
    show("results");
  }

  function renderReview() {
    const onlyWrong = $("only-wrong").checked;
    const list = $("review-list");
    list.innerHTML = "";
    state.lastResults.forEach((r, i) => {
      if (onlyWrong && r.ok) return;
      const opts = el("ul");
      r.order.forEach((orig, pos) => {
        const cls = r.q.answer.includes(orig) ? "correct" : r.chosen.has(orig) ? "chosen-wrong" : "";
        const mark = r.chosen.has(orig) ? " ← your answer" : "";
        const li = el("li", { className: cls, textContent: `${LETTERS[pos]}. ${r.q.options[orig]}${mark}` });
        const optRow = r.q.images && imageRow(r.q.images.options[orig]);
        if (optRow) li.append(optRow);
        if (r.q.notes && r.q.notes[orig]) li.append(el("span", { className: "option-note", textContent: r.q.notes[orig] }));
        opts.append(li);
      });
      const parts = [
        el("div", { className: "q-meta" }, [
          el("span", { textContent: `Question ${i + 1} · ${r.ok ? "Correct" : r.chosen.size ? "Incorrect" : "Not answered"}` }),
          el("span", { className: "tag", textContent: r.q.topic })
        ]),
        el("p", { className: "q-text", textContent: r.q.question })
      ];
      const qRow = r.q.images && imageRow(r.q.images.question);
      if (qRow) parts.push(qRow);
      if (r.q.exhibit) {
        parts.push(el("div", { className: "exhibit" }, [
          el("div", { className: "exhibit-label", textContent: "Exhibit" }),
          el("pre", { textContent: r.q.exhibit })
        ]));
      }
      parts.push(opts, el("div", { className: "explain", textContent: r.q.explanation }));
      const exRow = r.q.images && imageRow(r.q.images.explanation);
      if (exRow) parts.push(exRow);
      const extra = metaLine(r.q);
      if (extra) parts.push(extra);
      list.append(el("div", { className: "review-item " + (r.ok ? "right" : "wrong") }, parts));
    });
    if (!list.children.length) list.append(el("p", { className: "muted", textContent: "No incorrect answers. Nice work!" }));
  }

  // ───────────── Wiring ─────────────
  function init() {
    if (MODE === "builtin" && !BUILTIN.length) {
      $("setup-error").textContent = "Built-in questions not found (data/questions.js did not load).";
      $("setup-error").hidden = false;
    }
    refreshSetup();

    if (MODE === "custom") {
      $("load-custom-btn").addEventListener("click", () => $("custom-file").click());
      $("custom-file").addEventListener("change", (e) => {
        const file = e.target.files[0];
        e.target.value = ""; // allow re-loading the same file after edits
        if (file) loadCustomFile(file);
      });
      $("clear-custom-btn").addEventListener("click", clearCustom);
    }

    $("select-all").addEventListener("click", () => setAllTopics(true));
    $("select-none").addEventListener("click", () => setAllTopics(false));

    $("start-btn").addEventListener("click", () => {
      state.mode = document.querySelector("input[name=mode]:checked").value;
      const topics = selectedTopics();
      const count = Number($("question-count").value);
      startQuiz(shuffle(activeBank().filter((q) => topics.has(q.topic))).slice(0, count));
    });

    $("submit-btn").addEventListener("click", submit);
    $("quit-btn").addEventListener("click", () => {
      if (confirm("End the quiz now? Unanswered questions count as incorrect.")) finish();
    });
    $("restart-btn").addEventListener("click", () => {
      stopTimer();
      show("setup");
    });
    $("retry-wrong-btn").addEventListener("click", () => {
      startQuiz(shuffle(state.lastResults.filter((r) => !r.ok).map((r) => r.q)));
    });
    $("only-wrong").addEventListener("change", renderReview);
    $("image-viewer").addEventListener("click", closeViewer);

    document.addEventListener("keydown", (e) => {
      if (!$("image-viewer").hidden) {
        if (e.key === "Escape" || e.key === "Enter") { e.preventDefault(); closeViewer(); }
        return;
      }
      if ($("quiz").hidden || e.ctrlKey || e.metaKey || e.altKey) return;
      const pos = LETTERS.indexOf(e.key.toUpperCase());
      if (pos >= 0 && e.key.length === 1) {
        toggleByLetter(pos);
      } else if (e.key === "Enter" && !$("submit-btn").disabled) {
        e.preventDefault();
        submit();
      }
    });
  }

  init();
})();

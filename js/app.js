(function () {
  "use strict";

  const BANK = window.ENARSI_QUESTIONS || [];
  const PASS_PCT = 80; // Cisco does not publish the cut score; 80% is a sensible target.
  const SECONDS_PER_QUESTION = 120; // ENARSI is roughly 2 minutes per question.
  const LETTERS = "ABCDEF";
  const NUMBER_WORDS = { 2: "two", 3: "three", 4: "four" };

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

  // ───────────── Setup screen ─────────────
  function buildTopicList() {
    const domains = new Map();
    for (const q of BANK) {
      if (!domains.has(q.domain)) domains.set(q.domain, new Map());
      const topics = domains.get(q.domain);
      topics.set(q.topic, (topics.get(q.topic) || 0) + 1);
    }

    const list = $("topic-list");
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
    const available = BANK.filter((q) => selectedTopics().has(q.topic)).length;
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
    state.questions = pool.map((q) => ({ q, order: shuffle(q.options.map((_, i) => i)) }));
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
      const li = el("li", { className: "option" }, [
        input,
        el("span", { className: "letter", textContent: LETTERS[pos] + "." }),
        el("span", { textContent: q.options[orig] })
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
    });

    const ok = isCorrect(q, chosen);
    const fb = $("feedback");
    fb.className = "feedback " + (ok ? "ok" : "bad");
    fb.innerHTML = "";
    fb.append(el("strong", { textContent: ok ? "Correct" : "Incorrect" }), q.explanation);
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
        opts.append(el("li", { className: cls, textContent: `${LETTERS[pos]}. ${r.q.options[orig]}${mark}` }));
      });
      const parts = [
        el("div", { className: "q-meta" }, [
          el("span", { textContent: `Question ${i + 1} · ${r.ok ? "Correct" : r.chosen.size ? "Incorrect" : "Not answered"}` }),
          el("span", { className: "tag", textContent: r.q.topic })
        ]),
        el("p", { className: "q-text", textContent: r.q.question })
      ];
      if (r.q.exhibit) {
        parts.push(el("div", { className: "exhibit" }, [
          el("div", { className: "exhibit-label", textContent: "Exhibit" }),
          el("pre", { textContent: r.q.exhibit })
        ]));
      }
      parts.push(opts, el("div", { className: "explain", textContent: r.q.explanation }));
      list.append(el("div", { className: "review-item " + (r.ok ? "right" : "wrong") }, parts));
    });
    if (!list.children.length) list.append(el("p", { className: "muted", textContent: "No incorrect answers. Nice work!" }));
  }

  // ───────────── Wiring ─────────────
  function init() {
    if (!BANK.length) {
      $("setup-error").textContent = "No questions found. Check that data/questions.js loaded.";
      $("setup-error").hidden = false;
      return;
    }
    buildTopicList();
    updateCountOptions();

    $("select-all").addEventListener("click", () => setAllTopics(true));
    $("select-none").addEventListener("click", () => setAllTopics(false));

    $("start-btn").addEventListener("click", () => {
      state.mode = document.querySelector("input[name=mode]:checked").value;
      const topics = selectedTopics();
      const count = Number($("question-count").value);
      startQuiz(shuffle(BANK.filter((q) => topics.has(q.topic))).slice(0, count));
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

    document.addEventListener("keydown", (e) => {
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

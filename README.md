# ENARSI Practice Quiz

A static quiz website for the Cisco **300-410 ENARSI** (Implementing Cisco Enterprise Advanced Routing and Services) exam. The questions follow the exam's multiple-choice style: single-answer questions, "Choose two/three" questions, and "Refer to the exhibit" questions with CLI output.

## Usage

Open `index.html` in a browser. You don't need a build step or a server, because it also works from `file://`.

- **Practice mode:** shows the correct answer and an explanation after each question.
- **Exam mode:** gives you 2 minutes per question and shows results only at the end.
- The results page has a breakdown by topic, a full review, and a "Retry incorrect" button.
- Keyboard shortcuts: `A`–`F` to select an answer, `Enter` to submit or go to the next question.

## Structure

| File | Purpose |
|------|---------|
| `index.html` | Page markup |
| `css/style.css` | Styling (follows the system light/dark theme) |
| `js/app.js` | Quiz logic |
| `data/questions.js` | Question bank |

## Adding questions

Append an object to `window.ENARSI_QUESTIONS` in `data/questions.js`:

```js
{
  id: "ospf-9",                       // unique
  domain: "Layer 3 Technologies",     // blueprint domain (groups topics on the setup screen)
  topic: "OSPF",
  question: "Which two ...? (Choose two.)",
  exhibit: `R1# show ip ospf neighbor ...`,  // optional
  options: ["...", "...", "...", "..."],
  answer: [0, 2],                     // indexes of the correct options
  explanation: "Why the answer is correct."
}
```

The answer options are shuffled every time a question is shown.

*Unofficial study aid. Not affiliated with Cisco.*

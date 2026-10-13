# ENARSI Practice Quiz

A static quiz website for the Cisco **300-410 ENARSI** (Implementing Cisco Enterprise Advanced Routing and Services) exam. The questions follow the exam's multiple-choice style: single-answer questions, "Choose two/three" questions, and "Refer to the exhibit" questions with CLI output.

## Usage

Open `index.html` in a browser (or go to https://enarsi.tabisch.net). You don't need a build step or a server.

The start page links to two separate quizzes:

| Page | What it does |
|------|--------------|
| `quiz/` | **Built-in quiz** using the question bank in `quiz/data/questions.js` |
| `custom/` | **Custom quiz** that only uses a JSON file you load (see below) |

Both quizzes have:

- **Practice mode:** shows the correct answer and an explanation after each question.
- **Exam mode:** gives you 2 minutes per question and shows results only at the end.
- A results page with a breakdown by topic, a full review, and a "Retry incorrect" button.
- Keyboard shortcuts: `A`–`H` to select an answer, `Enter` to submit or go to the next question.

## Structure

The two quizzes are separate, self-contained apps. Each folder has its own HTML, CSS, JavaScript and data and doesn't load anything from the other app, so either one can be copied or hosted on its own.

```
index.html, landing.css      Start page (links to both apps)
quiz/                        Built-in quiz app
  index.html
  css/style.css
  js/app.js
  data/questions.js          Question bank
custom/                      Custom quiz app
  index.html
  css/style.css
  js/app.js                  Includes the JSON loader and validation
  data/example.json          Example question file
```

Changes to one app (for example, styling or quiz logic) don't affect the other.

## Loading a custom question set

On the custom quiz page (`custom/`), click **Load JSON file…** and pick a `.json` file. The file can be an array of questions, or an object with a `"questions"` array, using the same fields as the built-in questions (see below and [`custom/data/example.json`](custom/data/example.json)).

- Only `question`, `options` (2–8 strings) and `answer` (an index or an array of indexes) are required. `domain` defaults to "Custom Questions" and `topic` defaults to "General".
- In JSON, write multi-line exhibits with `\n` (template literals only work in `questions.js`).
- Invalid entries are skipped and listed with the reason. The valid ones still load.
- Click **Unload** to remove the loaded set.
- The file is read locally in the browser and is never uploaded anywhere. It is not saved, so you need to load it again after a page reload.

### Lettered format

Questions can also use letter-keyed options. Both formats can be mixed in one file:

```json
{
  "question": "Which ports does RADIUS use? (Choose two.)",
  "options": { "A": "UDP 1644 for authentication", "B": "UDP 1812 for authentication", "C": "TCP 1812 for authentication", "D": "UDP 1813 for accounting" },
  "correct_answer": ["B", "D"],
  "explanation": "RADIUS uses UDP 1812 for authentication and UDP 1813 for accounting.",
  "why_other_options_are_wrong": { "A": "Not a RADIUS port.", "C": "RADIUS uses UDP, not TCP." },
  "verification": { "verified": true, "method": "Checked against RFC 2865/2866." },
  "confidence": "high"
}
```

- `correct_answer` can be `["B", "D"]`, `"B, D"` or `"BD"`. Letters are not case-sensitive.
- Questions in this format keep their A/B/C order instead of being shuffled, because explanations often refer to options by letter.
- `why_other_options_are_wrong` notes appear under each option once you've answered and on the results review. `confidence` and `verification` appear under the explanation.

### Images

Both formats accept an optional `images` array:

```json
"images": [
  { "location": "question", "src": "data:image/png;base64,iVBOR...", "origin": "https://example.com/exhibit.png" },
  { "location": "B", "src": "https://example.com/option-b.png" },
  { "location": "explanation", "src": "data:image/jpeg;base64,/9j/..." }
]
```

- `location`: `question` (shown under the question text), an option letter such as `A` (or an index for array-style options), or `explanation` (shown after answering). If it's missing, the image goes under the question.
- `src`: a `data:image/...;base64,` URL or an `http(s)://` link. `origin` is optional; it is used if `src` fails to load. Other URL types are rejected.
- Click an image to enlarge it, and click or press Esc to close it.

## Adding questions

Append an object to `window.ENARSI_QUESTIONS` in `quiz/data/questions.js`:

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

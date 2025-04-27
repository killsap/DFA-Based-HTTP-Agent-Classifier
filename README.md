# DFA-Based HTTP Agent Classifier

A tiny, deterministic-finite-automaton (DFA) that classifies HTTP request
sequences as **AI agent** or **human** using only discrete, explainable tokens
(headers, timing, typing speed, burst depth, etc.).  Built as a university
project.

---
## Table of Contents
1. [Features](#features)
2. [Folder Layout](#folder-layout)
3. [Prerequisites](#prerequisites)
4. [Quick Start](#quick-start)
5. [NPM Scripts](#npm-scripts)
6. [Synthetic Dataset](#synthetic-dataset)
7. [How It Works](#how-it-works)
8. [Limitations & Future Work](#limitations--future-work)
9. [License](#license)

---
## Features
| Layer | What it does |
|-------|--------------|
| **Token extractor** | Converts raw headers / timing / typing into one of 10 tokens (H₁–H₄, T₁/T₂, C₁, D₁, K₁). |
| **4-state DFA** | `q0 → q1 → qA` flip after ≥ 2 bot tokens (provably minimal). |
| **Browser demo** | `/public/index.html` shows “🚨 Agent / ✅ Human” live. |
| **Playwright / Nova scripts** | Automate clicks and generate burst traffic for testing. |
| **Synthetic corpus** | `npm run gen` fabricates labeled JSON traces. |
| **Metrics** | `npm run eval` (dataset) & `npm run metrics` (interactive logs). |
| **No build step** | Runs directly from source; no bundler required for coursework. |

---
## Folder Layout
```text
root/
  package.json
  playwright.config.js
  Agents/
  | - AiAgentNovaAct.py       # AI Agent Nova Act for text input speed
  | - aiAgentTestHeadless.py  # Headless agent test
  dfa_http_classifier_esmodules/
  │
  ├── public/                 # static demo (index.html, dfa.js copy)
  │   ├── index.html          # UI + detectors + DFA import
  │   └── dfa.js              # minimal DFA (copied from src/)
  │
  ├── src/
  │   ├── dfa.js              # state table + classify()
  │   └── tokenExtractor.js   # header / timing to tokens
  │
  ├── scripts/
  │   ├── server.mjs          # Node dev server + /log endpoint
  │   ├── generateDataset.mjs # npm run gen
  │   ├── evaluate.mjs        # npm run eval
  │   └── metricsInteractions.mjs  # npm run metrics
  │
  ├── test/                   # Jest unit tests
  │   └── dfa.test.js
  │
  ├── logs/                   # interactive logs + synthetic corpus
  │   └── dataset/            # generated JSON traces live here
  │
  └── package.json
```

---
## Prerequisites
* **Node.js ≥ 14** (ES-modules & optional chaining supported)
* **npm** (ships with Node)
* Playwright (for headless automation) and Amazon Nova Act Developer Preview: https://nova.amazon.com/act

---
## Quick Start
```bash
# 1. clone & install
git clone https://github.com/killsap/DFA-Based-HTTP-Agent-Classifier.git
cd DFA-Based-HTTP-Agent-Classifier
npm install
cd dfa_http_classifier_esmodules
npm install

# 2. run unit tests
npm test

# 3. start the local demo server
npm run serve
# → http://localhost:8080  (click buttons, type, paste)
# 3.1 python3 ./aiAgentTestHeadless.py --openai # Don't forget to set your API key
# 3.2 python3 ./AiAgentNovaAct.py # Don't forget to set your API key
# 4. synthetic dataset (100 traces)
npm run gen -- logs/dataset 100   # 50 human + 50 agent
npm run eval -- logs/dataset      # prints accuracy / precision / recall

# 5. metrics on your live clicks
npm run metrics
```

---
## NPM Scripts
| Script | Purpose |
|--------|---------|
| `npm test` | Jest unit tests (`test/dfa.test.js`). |
| `npm run serve` | Node server with `/log` API (serves `/public`). |
| `npm run static` | Serve repo root via `http-server` (no logging). |
| `npm run gen -- <dir> [n]` | Generate *n* traces (default 100) into `<dir>`. |
| `npm run eval -- <dir>` | Evaluate DFA on every JSON in `<dir>`. |
| `npm run metrics` | Confusion-matrix from `logs/buttonInteractions.json`. |

---
## Synthetic Dataset
Each file is:
```jsonc
{
  "tokens": ["H2", "T1", "T2"],
  "label":  "agent"              // or "human"
}
```
The generator alternates human / agent, yielding a 50 : 50 balance.

---
## How It Works
1. **Extraction** – Headers (`User-Agent`, `X-Requested-With`, …), timing (< 50 ms), typing speed (< 40 ms) → discrete tokens.
2. **DFA** – 4 states, deterministic; any 2 bot tokens reach `qA`.
3. **Verdict** – UI shows emoji + logs JSON; Playwright/Nova scripts read it.

For formal definition, minimization proof, and complexity analysis, see the *report* or canvas document (Sections 2–4).

---
## Limitations & Future Work
* Easily spoofed by sophisticated bots adding delays or masking headers.
* DFA can only express finite‑memory rules; richer behaviour needs probabilistic edges or ML.
* Typing-speed detector relies on `Performance.now()` which some browsers clamp.
> See Section of the report for expansion ideas.
---

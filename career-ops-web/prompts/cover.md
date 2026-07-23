# Mode: cover — Cover Letter Generator

Generate a tailored cover letter for the candidate from the job description and CV provided in context.

## Step 1 — Parse the JD

Extract:
- **Role title** (exact wording from JD)
- **Company name**
- **Location / city**
- **Top 3-4 required competencies**
- **Mission/vision language** the company uses (opening paragraphs)
- **Domain** (e.g. fintech, healthcare, media, logistics)
- **Start date signals** ("immediate", "ASAP", "from now on")
- **Language requirement**, if any
- **JD tone** (formal / direct / casual)

## Step 2 — Keyword extraction

Extract the top 8-10 exact phrases the company uses in the JD, split into:
- **ATS-critical**: role-specific titles, tool names, methodology names
- **Human trust signals**: action verbs the company uses, product/domain nouns, outcome language, team framing

Mirror their vocabulary, not their structure. Content stays sourced from the candidate's CV — only vocabulary shifts. Use each keyword once — never repeat for density.

## Step 3 — Achievement selection (from the candidate's CV only)

Select 4-5 achievement bullets from the CV provided in context:
1. Score each against the JD's top 3-4 required competencies
2. Pick the 4-5 highest-scoring, with at least one metric per bullet
3. Use the exact wording and metrics from the CV — never paraphrase or invent

Format: `**Bold lead phrase,** one sentence of impact with metric.`

## Step 4 — Draft the letter

Write the full letter as plain text, following this structure:

```text
[Candidate Name]
[Location] | [Email] | [Phone if available] | [LinkedIn if available]

Cover Letter: [Role Title]
[Company], [City]   [Date]

[Salutation — optional, omit if no hiring manager name is known]

[Opening — 2 sentences]
Why applying + functional summary, using JD mirror vocabulary.

[Profile introduction — 1 paragraph]
Years of experience, current/most recent role, domain, from the CV summary.

[Achievements — 4-5 bullets]
• **Lead phrase,** impact sentence with metric.
(...)

[Problems I will solve — 2-3 sentences]
Specific to this company's actual situation, based on the JD's own stated priorities. Not generic.

[Closing — 1-2 sentences]
Availability and enthusiasm, no filler.
```

## Language rules (enforced in every sentence)

1. **Active voice only** — never "was delivered", "has been built", "were led"
2. **No abbreviations unless the JD used them first**
3. **No em dashes** — replace with a comma, full stop, or rewrite the sentence
4. **No buzzwords** — hard ban: leverage, synergy, seamless, holistic, robust, cutting-edge, spearheaded, championed, orchestrated, passionate, excited, stakeholder alignment, data-driven (say what the data drove instead), actionable insights, move the needle, north star, unique opportunity, perfect fit, strong track record
5. **No filler openers** — never "I am pleased to", "I am writing to express", "I am excited to"
6. **Concrete over abstract** — every claim needs a number, system name, or specific outcome
7. **350-420 words** total body (header not counted)
8. **Self-check** — before finalising, re-read each sentence: could it appear in any cover letter for any company? If yes, rewrite it.
9. **Tone consistency** — apply one consistent tone throughout, matching the JD's register unless the user specified a tone.

---

_Adapted from santifer/career-ops (MIT) `modes/cover.md` for the career-ops-web single-shot Gemini pipeline: the multi-turn clarification steps (company-research WebSearch, gap-detection Q&A, the four mandatory user prompts, PDF template resolver script) that depend on an interactive agentic session have been removed — this mode runs as a single API call given CV + JD + tone. The achievement-selection rules, language rules, and letter structure are preserved verbatim in spirit. See NOTES FOR JULES in the build guide._

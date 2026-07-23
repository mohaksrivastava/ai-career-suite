# Mode: job — Full A-G Evaluation

When given a job description, ALWAYS deliver the 7 blocks (A-F evaluation + G legitimacy) below, in order, as Markdown. This is the career-ops A-F pipeline referenced throughout the app.

## Step 0 — Archetype Detection

Classify the job into one of the 6 archetypes (see the Archetype Detection table above). If it is a hybrid, indicate the 2 closest ones. This determines:
- Which proof points to prioritize in Block B
- How to rewrite the summary in Block E
- Which STAR stories to prepare in Block F

## Block A — Role Summary

Table with:
- Archetype detected
- Domain (platform/agentic/LLMOps/ML/enterprise)
- Function (build/consult/manage/deploy)
- Seniority
- Remote (full/hybrid/onsite)
- Team size (if mentioned)
- **Culture screen**: pass / caution / fail, with the specific evidence found or missing — not just a score, name what you saw
- TL;DR in 1 sentence

### Geo-mismatch check

Cross-check any stated location/remote designation against the JD body:

- **Contradiction** = the location field says remote, but the JD body states a **binding attendance requirement**: "hybrid", "X days per week/month" in office, "in-office", "onsite"/"on-site", mandatory office attendance, or a relocation requirement.
- **Not a contradiction:** negations ("no onsite requirement"), optional or occasional in-person events, or generic benefits boilerplate.
- If the JD body says nothing about location or attendance, emit no flag.

On contradiction, add exactly one flag line at the top of Block B, quoting the evidence **verbatim**:

`⚠️ **Geo-mismatch:** location field says remote, but JD body says "{verbatim JD line}"`

## Block B — Match with CV

Using the candidate CV provided in context, create a table with each JD requirement mapped to exact lines in the CV.

**Adapted to the archetype:**
- If FDE → prioritize delivery speed and client-facing proof points
- If SA → prioritize system design and integrations
- If PM → prioritize product discovery and metrics
- If LLMOps → prioritize evals, observability, pipelines
- If Agentic → prioritize multi-agent, HITL, orchestration
- If Transformation → prioritize change management, adoption, scaling

**Gaps** section with mitigation strategy for each. For each gap:
1. Is it a hard blocker or a nice-to-have?
2. Can the candidate demonstrate adjacent experience?
3. Concrete mitigation plan (phrase for cover letter, quick project, etc.)

## Block C — Level and Strategy

1. **Level detected** in the JD vs **candidate's natural level for that archetype**
2. **"Sell senior without lying" plan**: specific phrases adapted to the archetype, concrete achievements to highlight
3. **"If they downlevel me" plan**: accept if compensation is fair, negotiate 6-month review, clear promotion criteria

## Block D — Comp and Demand

Using your own knowledge of market compensation trends (no external tools are available), estimate:
- Typical salary band for the role, level, and location described
- Company's likely compensation posture given its type

Classify the employer into the closest category and state a confidence level:

| Company type | Typical comp reliability | Signals |
|--------------|--------------------------|---------|
| Public big tech / mature tech | High to medium | Public company, structured levels, large engineering org |
| Growth-stage / VC-backed startup | Medium | Funded startup, competitive hiring market, base + equity + bonus |
| Early-stage / pre-revenue startup | Medium to low | Small team, vague role scope, equity-heavy promises |
| Enterprise / traditional corporate | Medium | Formal HR process, stable base, slower bands |
| Agency / outsourcing / consulting vendor | Medium to low | Client allocation, project-based work |
| Local SMB / service business | Low | Small company, broad role, informal HR |
| Government / academic / nonprofit | Medium to high | Published grades/bands, lower market competitiveness |

If uncertain, mark it `Unknown` and default compensation reliability to `Low`.

If the JD states an explicit salary figure, quote it **verbatim** as the first line of this block, before any estimate:

`Advertised (JD): {verbatim figure or "not stated"}`

Never blend the advertised figure with your own estimate — present your estimate as a separate, clearly-labeled range below it. State plainly when you have low confidence in an estimate; never invent false precision.

## Block E — Customization Plan

| # | Section | Current status | Proposed change | Why |
|---|---------|---------------|------------------|---------|
| ... | ... | ... | ... | ... |

Top 5 changes to CV to maximize match.

## Block F — Interview Plan

6-10 STAR+R stories (STAR + **Reflection**) mapped to JD requirements, drawn from the candidate's CV:

| # | JD Requirement | STAR+R Story | S | T | A | R | Reflection |
|---|-----------------|-----------------|---|---|---|---|------------|

The **Reflection** column captures what was learned or what would be done differently — this signals seniority.

**Selected and framed according to the archetype:**
- FDE → emphasize delivery speed and client-facing
- SA → emphasize architectural decisions
- PM → emphasize discovery and trade-offs
- LLMOps → emphasize metrics, evals, production hardening
- Agentic → emphasize orchestration, error handling, HITL
- Transformation → emphasize adoption, organizational change

Also include:
- 1 recommended case study (which of the candidate's projects to present and how)
- Red-flag interview questions and how to answer them

## Block G — Posting Legitimacy

Analyze the job posting text alone (no external browsing is available) for signals that indicate whether this looks like a real, active opening.

**Ethical framing:** Present observations, not accusations. Every signal has legitimate explanations. The user decides how to weigh them.

**Signals to analyze from the JD text itself:**
- **Description quality:** Does it name specific technologies, frameworks, tools? Does it mention team size, reporting structure, or org context? Are requirements realistic (years of experience vs. technology age)? Is there a clear scope for the first 6-12 months? Is compensation mentioned? What ratio of the JD is role-specific vs. generic boilerplate? Any internal contradictions (entry-level title + staff requirements)?
- **Employment classification risk:** Does the JD use contractor/services-status language ("invoice for services", "independent contractor", "consulting agreement") combined with an absence of benefits/PTO/defined-end-date language? If so, flag it:

  `⚠️ **Employment classification signal:** This posting uses language associated with contractor/services status rather than standard employee status — e.g. "{specific phrase found}". Confirm classification directly with the employer.`

- **AI-buzzword vs. infrastructure mismatch:** Heavy "AI enablement/transformation/innovation" language sitting on a role/team-size/industry combination that looks under-resourced for that mandate. Flag only when 2+ of these are present: buzzword density vs. scope, small team (~5 or fewer) owning transformation outcomes, legacy-heavy industry. If flagged:

  `⚠️ **Buzzword/infrastructure mismatch signal:** This JD leans on AI/transformation language ("{specific phrases found}") while {signals observed}. Probe the actual state of their systems directly in interviews.`

**Output format:**

**Assessment:** One of three tiers — High Confidence / Proceed with Caution / Suspicious.

**Signals table:** Each signal observed with its finding and weight (Positive / Neutral / Concerning).

**Context Notes:** Any caveats (niche role, government job, evergreen position, etc.) that explain potentially concerning signals.

**Edge cases:** Government/academic postings and executive/staff+ roles legitimately stay open longer — do not penalize for that alone. If no other signal is concerning, default to "Proceed with Caution" rather than "Suspicious" — never default to "Suspicious" without positive evidence.

---

## Risk Summary (after Block G)

Close the report with a `## Risk Summary` table, one row per signal, so the top-line question ("is this safe to pursue?") is answered on one screen:

| Signal | Status |
|--------|--------|
| Posting legitimacy | ✅ High Confidence / ⚠️ {tier} — {one-line reason} |
| Employment classification | ✅ clear / ⚠️ {quoted phrase} |
| Culture screen | ✅ pass / ⚠️ caution or fail — {evidence} |
| AI claims vs. infrastructure | ✅ consistent / ⚠️ {finding} / — not evaluated |

---

_Adapted from santifer/career-ops (MIT) `modes/oferta.md` for the career-ops-web single-shot Gemini pipeline: this is a stateless API call with no filesystem, WebSearch, Playwright, or subagent access, so the liveness gate, blacklist gate, bounded-research-budget WebSearch queries, tracker recording, and report-file writing steps from the original mode have been removed. The 7-block evaluation structure and scoring logic are preserved. See NOTES FOR JULES in the build guide._

# Mode: email — Application Email Drafts

Generate a formal application email body the candidate can paste into an email client, using the CV and job description provided in context.

**Never submit. Never send email. Never click send.** Draft only. The candidate must review and send manually. This constraint is non-negotiable — see NOTES FOR JULES item 2 in the build guide.

## Step 1 — Classify Email Type

Choose one of these variants based on the `emailType` field in the request:

| Variant | When | Tone |
|---|---|---|
| `application` | Default. Sending CV to HR/recruiter for a posted role. | Formal, concise, screening-friendly |
| `referral` | Requesting a referral or internal contact. | Warm, low-pressure, easy to forward |
| `cold` | No posted role, speculative reach-out. | Direct, value-first, no desperation |
| `recruiter` | Following up with a recruiter who reached out first. | Professional, responsive |

If unclear, default to `application`.

## Step 2 — Extract Fit Points

From the CV and JD provided, select 2-3 fit points:
- One role-to-profile match: stack, domain, workflow, product type, or delivery style
- One proof point: project, metric, or shipped system, using exact wording from the CV
- One differentiator

Use only facts present in the candidate's CV. Reformulate keywords from the JD; never fabricate.

## Step 3 — Attachment Checklist

Before the draft, output:

```text
Attachments to include:
- CV: attach your tailored CV
- Cover letter: optional / not generated
```

## Step 4 — Draft Structure

Always output:

```text
Subject: {subject}

{email body}
```

### Application structure
1. Greeting
2. Role intent and attachment sentence
3. 2-3 fit points in one short paragraph or compact bullets
4. Why this role is relevant, using JD language
5. Signature

### Referral structure
1. Greeting
2. One-line context: role and company
3. 2 concise proof points that are easy to forward
4. Low-pressure ask: "If this looks aligned, would you be comfortable referring me or pointing me to the right person?"
5. Signature

### Cold structure
1. Greeting
2. Value proposition first, not "I am looking for a job"
3. 2 proof points tied to the company/domain
4. Specific ask: short call, right contact, or permission to send CV
5. Signature

## Style Rules

- No corporate-speak.
- No "passionate about", "perfect fit", "unique opportunity", or vague praise.
- No exaggerated authorship claims.
- Short paragraphs. Prefer 150-250 words for application emails.
- Do not include salary unless explicitly asked.
- Do not include private references, ID numbers, or unsupported claims.

## Output

Return:
1. Attachment checklist
2. Subject and email body
3. One-line note with any missing inputs or assumptions

**Reminder: this is a draft only.** Do not phrase anything as though it has been or will be sent automatically — the output is text for the candidate to review and send themselves.

---

_Adapted from santifer/career-ops (MIT) `modes/email.md` for the career-ops-web single-shot Gemini pipeline: the report-lookup invocation modes, process-stuck/no-show recovery variants, and multi-turn intake questions (which assume an interactive agentic session with file access) have been removed. The draft-only guarantee, fit-point extraction, and structure rules are preserved. See NOTES FOR JULES in the build guide._

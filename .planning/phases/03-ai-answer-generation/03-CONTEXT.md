# Phase 3: AI Answer Generation - Context

**Gathered:** 2026-02-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Add AI-powered answer suggestions for text questions in job applications. Mock AI system by default (3 draft options per question), with optional user-provided API key for real AI (OpenAI or Claude). Includes role-specific tuning and special handling for essay questions (STAR outline).

</domain>

<decisions>
## Implementation Decisions

### Question Detection
- **Essay detection threshold:** Character limit ≥500 chars triggers essay mode (STAR outline instead of full draft)
- **STAR outline format:** Full outline with guidance — includes Situation/Task/Action/Result sections with explanatory text, placeholders, and tips

### Answer Generation UI
- **Draft presentation:** Sequential cycling — show one draft at a time with Next/Previous buttons to cycle through the 3 options
- **Edit after insert:** Both capabilities — users can switch between the original 3 drafts AND regenerate new drafts even after insertion

### Tone/Style Variants
- **Professional tone:** Neutral + polished — clean, error-free, diplomatic without being overly formal
- **Concise tone:** Minimal but complete — shortest possible answer that still fully addresses the question

### API Key Configuration
- **Provider support:** Both OpenAI + Claude — user chooses which provider to use
- **Entry UI:** Settings page section — dedicated "AI Configuration" section in extension settings/options page
- **Key validation:** Retry validation — test the API key with a real API call before saving, allow user to retry if it fails

### Claude's Discretion
- **Field type targeting** — Determine which fields get "Suggest Answer" button based on field characteristics (textarea, label keywords, size, context)
- **Detection signals** — Use multiple signals (label analysis, field type, character limits, question markers) for accurate question detection
- **Draft insertion flow** — Design the smoothest user flow for inserting drafts into form fields
- **Placeholder formatting** — Choose clear visual treatment for placeholders like [insert specific metric]
- **Story-Driven tone** — Craft compelling narrative style with appropriate storytelling elements
- **Role-specific tuning depth** — Determine appropriate level of customization (vocabulary, examples, context) based on user's role (Tech/Healthcare/Finance)
- **Mock vs real AI indication** — Choose clear method to show users whether mock or real AI is active

</decisions>

<specifics>
## Specific Ideas

- Three distinct tone options: Professional (neutral/polished), Concise (minimal but complete), Story-Driven (narrative/engaging)
- Essay questions (500+ chars) should receive STAR outline format instead of full draft answers
- STAR outline should be comprehensive with guidance, not just bullet points
- Users need ability to both cycle through original drafts and regenerate new ones
- API key validation happens before saving (test with real API call)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-ai-answer-generation*
*Context gathered: 2026-02-24*

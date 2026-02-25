# Phase 3: AI Answer Generation - Research

**Researched:** 2026-02-24
**Domain:** AI integration (OpenAI & Anthropic), prompt engineering, API key management
**Confidence:** MEDIUM

## Summary

Phase 3 adds AI-powered answer suggestions to job application forms. The research reveals that both OpenAI and Anthropic provide official SDKs with similar patterns, but the implementation should abstract these providers behind a common interface. The key architectural insight is that **provider abstraction is critical** — the application should never directly couple to a specific AI provider's SDK. Mock AI generation for users without API keys requires careful template design to produce believably varied but clearly placeholder-marked responses.

**Primary recommendation:** Use official SDKs (openai and @anthropic-ai/sdk), abstract behind a common interface (`AIProvider`), store API keys in Chrome Storage (plain storage in v1 per STATE.md), and implement mock generation as a separate provider that doesn't call external APIs.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Question Detection:**
- Essay detection threshold: Character limit ≥500 chars triggers essay mode (STAR outline instead of full draft)
- STAR outline format: Full outline with guidance — includes Situation/Task/Action/Result sections with explanatory text, placeholders, and tips

**Answer Generation UI:**
- Draft presentation: Sequential cycling — show one draft at a time with Next/Previous buttons to cycle through the 3 options
- Edit after insert: Both capabilities — users can switch between the original 3 drafts AND regenerate new drafts even after insertion

**Tone/Style Variants:**
- Professional tone: Neutral + polished — clean, error-free, diplomatic without being overly formal
- Concise tone: Minimal but complete — shortest possible answer that still fully addresses the question

**API Key Configuration:**
- Provider support: Both OpenAI + Claude — user chooses which provider to use
- Entry UI: Settings page section — dedicated "AI Configuration" section in extension settings/options page
- Key validation: Retry validation — test the API key with a real API call before saving, allow user to retry if it fails

### Claude's Discretion

- **Field type targeting** — Determine which fields get "Suggest Answer" button based on field characteristics (textarea, label keywords, size, context)
- **Detection signals** — Use multiple signals (label analysis, field type, character limits, question markers) for accurate question detection
- **Draft insertion flow** — Design the smoothest user flow for inserting drafts into form fields
- **Placeholder formatting** — Choose clear visual treatment for placeholders like [insert specific metric]
- **Story-Driven tone** — Craft compelling narrative style with appropriate storytelling elements
- **Role-specific tuning depth** — Determine appropriate level of customization (vocabulary, examples, context) based on user's role (Tech/Healthcare/Finance)
- **Mock vs real AI indication** — Choose clear method to show users whether mock or real AI is active

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope

</user_constraints>

---

## Standard Stack

### Core AI SDKs
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| openai | Latest (4.x+) | OpenAI API integration | Official SDK with TypeScript support, automatic retries, streaming |
| @anthropic-ai/sdk | Latest (0.x) | Anthropic Claude API integration | Official SDK with similar patterns to OpenAI, streaming support |

**Installation:**
```bash
npm install openai @anthropic-ai/sdk
```

**Key capabilities verified (HIGH confidence):**
- Both SDKs support TypeScript with full type definitions
- Both handle automatic API key loading from environment (but extensions must pass explicitly)
- Both support streaming responses (not needed for v1 but good to know)
- OpenAI SDK: `openai` package provides chat completions via `client.chat.completions.create()`
- Anthropic SDK: `@anthropic-ai/sdk` provides messages via `client.messages.create()`

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zod | Latest | Runtime type validation | Validate API responses and user configuration |
| Chrome Storage API | Native | API key storage | Store encrypted keys (v1: plain storage per STATE.md) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Official SDKs | Direct fetch() | Lose retry logic, error handling, type safety. Official SDKs handle rate limits, retries, connection errors robustly |
| Provider abstraction | Direct SDK calls | Lock-in to specific provider, harder to add providers, can't support mock mode cleanly |
| Chrome Storage | localStorage | Loses extension context access, no sync capability, cleared with browsing data |

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   ├── ai/
│   │   ├── providers/          # Provider implementations
│   │   │   ├── base.ts         # Abstract AIProvider interface
│   │   │   ├── openai.ts       # OpenAI implementation
│   │   │   ├── anthropic.ts    # Anthropic implementation
│   │   │   └── mock.ts         # Mock AI for users without keys
│   │   ├── prompt-builder.ts   # Prompt construction logic
│   │   ├── config.ts           # AI configuration management
│   │   └── index.ts            # Public API
│   └── storage/
│       └── encryption.ts       # Placeholder (v2 feature per STATE.md)
```

### Pattern 1: Provider Abstraction Pattern
**What:** Abstract AI provider behind common interface, never import provider SDKs outside provider files
**When to use:** Always — enables mock mode, provider switching, testing
**Example:**
```typescript
// src/lib/ai/providers/base.ts
export interface AIProvider {
  generateAnswer(params: GenerateParams): Promise<GenerateResult>
  validateKey(apiKey: string): Promise<boolean>
}

export type GenerateParams = {
  question: string
  userProfile: Profile
  tone: 'professional' | 'concise' | 'story-driven'
  essayMode?: boolean
}

export type GenerateResult = {
  drafts: string[]
  provider: 'openai' | 'anthropic' | 'mock'
}

// src/lib/ai/providers/openai.ts
import OpenAI from 'openai'

export class OpenAIProvider implements AIProvider {
  private client: OpenAI
  
  constructor(apiKey: string) {
    this.client = new OpenAI({ 
      apiKey,
      dangerouslyAllowBrowser: true // Required for extension context
    })
  }
  
  async generateAnswer(params: GenerateParams): Promise<GenerateResult> {
    // Generate 3 variants using separate API calls
    const prompts = this.buildPrompts(params)
    const drafts = await Promise.all(
      prompts.map(async (prompt) => {
        const response = await this.client.chat.completions.create({
          model: 'gpt-4o-mini', // Use mini for cost efficiency
          messages: [
            { role: 'system', content: this.buildSystemPrompt(params) },
            { role: 'user', content: prompt }
          ],
          max_tokens: params.essayMode ? 300 : 150,
          temperature: 0.7 // Balance creativity and consistency
        })
        return response.choices[0].message.content || ''
      })
    )
    
    return { drafts, provider: 'openai' }
  }
  
  private buildSystemPrompt(params: GenerateParams): string {
    // Role-specific tuning based on user profile
    const roleContext = {
      tech: 'You are helping a software engineer...',
      healthcare: 'You are helping a healthcare professional...',
      finance: 'You are helping a finance professional...'
    }[params.userProfile.role]
    
    return `${roleContext}
    
Generate job application answers with these requirements:
- Use ${params.tone} tone
- Include placeholders in [brackets] for specific details
- ${params.essayMode ? 'Provide STAR outline structure' : 'Keep answer concise'}
- Never invent specific metrics, dates, or project names
`
  }
}
```

### Pattern 2: Prompt Builder Pattern
**What:** Centralize prompt construction logic, separate from provider implementation
**When to use:** When building prompts for AI providers
**Example:**
```typescript
// src/lib/ai/prompt-builder.ts
export class PromptBuilder {
  static buildSystemPrompt(params: {
    role: string
    tone: 'professional' | 'concise' | 'story-driven'
    essayMode: boolean
  }): string {
    const toneInstructions = {
      professional: 'Use neutral, polished language. Be diplomatic and error-free.',
      concise: 'Use minimal but complete language. Shortest possible answer that fully addresses question.',
      'story-driven': 'Use narrative style with compelling storytelling elements.'
    }
    
    const roleInstructions = {
      tech: `You are assisting a software engineer. Use technical vocabulary naturally.
Examples of good placeholders: [specific framework name], [years of experience], [team size]`,
      healthcare: `You are assisting a healthcare professional. Use medical terminology appropriately.
Examples of good placeholders: [certification name], [patient volume], [department name]`,
      finance: `You are assisting a finance professional. Use financial terminology naturally.
Examples of good placeholders: [portfolio size], [specific regulation], [years of experience]`
    }
    
    return `${roleInstructions[params.role] || roleInstructions.tech}

Tone: ${toneInstructions[params.tone]}

${params.essayMode ? this.getEssayInstructions() : this.getShortAnswerInstructions()}

Critical requirements:
- ALWAYS include placeholders in [brackets] for specific details user must fill
- NEVER invent specific metrics, dates, company names, or project names
- Make it obvious what needs user input`
  }
  
  private static getEssayInstructions(): string {
    return `Format: Provide STAR outline structure:

**Situation:** [Brief context about the challenge]
**Task:** [What you needed to accomplish]
**Action:** [Specific steps you took - include 2-3 bullet points with placeholders]
**Result:** [Quantifiable outcome with [metric] placeholder]

Include explanatory guidance in each section.`
  }
  
  private static getShortAnswerInstructions(): string {
    return `Keep answer to 2-3 sentences maximum. Focus on answering the question directly.`
  }
}
```

### Pattern 3: Mock Provider Pattern
**What:** Implement mock AI that generates believable template responses without API calls
**When to use:** When user has no API key configured
**Example:**
```typescript
// src/lib/ai/providers/mock.ts
export class MockProvider implements AIProvider {
  async generateAnswer(params: GenerateParams): Promise<GenerateResult> {
    // Generate 3 variants from templates, no API call
    const templates = this.getTemplates(params)
    const drafts = templates.map(template => 
      this.fillTemplate(template, params)
    )
    
    return { drafts, provider: 'mock' }
  }
  
  private getTemplates(params: GenerateParams): string[] {
    if (params.essayMode) {
      return this.getEssayTemplates(params.tone)
    }
    
    return this.getShortTemplates(params.tone)
  }
  
  private getEssayTemplates(tone: string): string[] {
    // Return 3 distinct STAR outline templates
    return [
      `**Situation:** [Describe the context and challenge you faced]
**Task:** [What specific goal or responsibility were you assigned]
**Action:** [Detail the steps you took - include specific methodologies, tools, or approaches]
**Result:** [Quantify the outcome with specific metrics or improvements]`,
      
      `**Situation:** In [project/role context], I encountered [specific challenge].
**Task:** My objective was to [specific goal].
**Action:** I approached this by: [action 1], [action 2], [action 3]
**Result:** This led to [measurable outcome with metric].`,
      
      `**Situation:** [Time period and context]
**Task:** The primary challenge was [specific task]
**Action:** My strategy involved [methodology and key steps]
**Result:** Successfully [outcome] as measured by [metric]`
    ]
  }
}
```

### Anti-Patterns to Avoid
- **Direct provider SDK imports outside provider files:** Makes provider switching impossible, breaks mock mode
- **Storing API keys unencrypted:** Security risk (note: v1 uses plain storage per STATE.md, encryption deferred to v2)
- **Hard-coded prompts in components:** Makes iteration difficult, couples UI to AI logic
- **Single prompt for all 3 variants:** Produces similar responses, use temperature or different prompt phrasings
- **Inventing specific details:** AI must never hallucinate company names, metrics, or dates — use placeholders

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| API client logic | Custom fetch with retries | Official SDKs (openai, @anthropic-ai/sdk) | SDKs handle retries, rate limits, streaming, connection errors. Tested across millions of requests. |
| Retry/backoff logic | Custom exponential backoff | SDK built-in retry logic | OpenAI SDK has automatic retries with exponential backoff. Don't duplicate. |
| Token counting | Custom tokenizer | Not needed in v1 | Rate limits are enforced by provider. Track at application level only if needed. |
| Prompt templates | String concatenation | Structured prompt builder | Centralized prompt logic prevents inconsistencies, easier to test and iterate |
| API key encryption | Custom crypto | Chrome Storage API + Web Crypto API (v2) | v1: Plain storage per STATE.md. v2: Use Web Crypto API, not custom encryption. |
| Provider switching | if/else chains | Abstract factory pattern | Maintainable provider abstraction scales to multiple providers |

**Key insight:** The official SDKs from OpenAI and Anthropic handle nearly all edge cases you'll encounter (rate limits, retries, network errors, streaming). Building custom API clients is a trap — you'll spend weeks discovering edge cases the SDKs already handle.

---

## Common Pitfalls

### Pitfall 1: API Keys Exposed in Extension Code
**What goes wrong:** API keys hardcoded or logged, visible in extension inspection
**Why it happens:** Developers forget extension code is inspectable by users
**How to avoid:** 
- Never hardcode API keys
- Never log API keys (even in development)
- Store in Chrome Storage, retrieve only when needed
- Pass to SDK via constructor, never as default
**Warning signs:** Seeing API keys in console.log, finding keys in committed code

### Pitfall 2: Calling AI APIs from Content Scripts
**What goes wrong:** CORS errors, API keys exposed to page context
**Why it happens:** Content scripts run in page context, can't make external API calls safely
**How to avoid:** 
- Always call AI APIs from background script (service worker) or popup
- Use message passing to request generation from content script
- Never pass API keys to content scripts
**Warning signs:** CORS errors, network inspector shows API calls from content.js

### Pitfall 3: Not Handling Rate Limits
**What goes wrong:** 429 errors crash the extension, poor user experience
**Why it happens:** Assuming unlimited API capacity
**How to avoid:** 
- Catch 429 errors specifically
- Show user-friendly "Rate limit reached" message
- Implement retry with exponential backoff (or use SDK's built-in retry)
- Consider caching recent responses
**Warning signs:** Extension crashes on repeated rapid use, no error handling for 429

### Pitfall 4: Identical Responses for All 3 Drafts
**What goes wrong:** All 3 "variants" are nearly identical
**Why it happens:** Using same prompt + low temperature for all drafts
**How to avoid:** 
- Use different prompt phrasings for each draft
- OR use higher temperature (0.7-0.9)
- OR use different system prompts emphasizing different aspects
**Warning signs:** User complaints that drafts are too similar, testing reveals <10% variation

### Pitfall 5: Mock Provider Produces Obviously Fake Content
**What goes wrong:** Users recognize mock responses instantly, lose trust
**Why it happens:** Templates too generic, no context awareness
**How to avoid:** 
- Use question text to customize templates
- Include role-specific vocabulary in mock responses
- Make placeholders obvious with brackets
- Provide 3 genuinely different template structures
**Warning signs:** User feedback that mock mode is "useless", templates look copy-pasted

### Pitfall 6: No Indication of Mock vs Real AI
**What goes wrong:** Users don't realize they're getting template responses
**Why it happens:** UI doesn't distinguish between mock and real AI
**How to avoid:** 
- Show badge/icon indicating "Mock Mode" or "Powered by [Provider]"
- Display message in settings when no API key configured
- Consider watermark or footer in generated content
**Warning signs:** User confusion about whether AI is working, unexpected results

### Pitfall 7: API Key Validation Only on Save
**What goes wrong:** Invalid keys stored, discovered only when generating answers
**Why it happens:** Skipping validation to simplify implementation
**How to avoid:** 
- Always test API key with real API call before saving
- Show clear success/failure message
- Allow retry without re-entering full key
- Store validation timestamp
**Warning signs:** Users report "AI not working" after configuring key, no validation feedback

---

## Code Examples

Verified patterns from official sources:

### OpenAI Chat Completion (Official SDK)
```typescript
// Source: https://platform.openai.com/docs/libraries
import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: await getAPIKey(), // Retrieved from Chrome Storage
  dangerouslyAllowBrowser: true // Required for extension context
})

const response = await client.chat.completions.create({
  model: 'gpt-4o-mini', // Cost-effective model for short answers
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt }
  ],
  max_tokens: 150,
  temperature: 0.7
})

const answer = response.choices[0].message.content
```

### Anthropic Messages (Official SDK)
```typescript
// Source: https://docs.anthropic.com/en/api/client-sdks
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: await getAPIKey() // Retrieved from Chrome Storage
})

const message = await client.messages.create({
  model: 'claude-3-5-sonnet-20241022', // Latest Sonnet
  max_tokens: 150,
  messages: [
    { role: 'user', content: userPrompt }
  ],
  system: systemPrompt // Anthropic uses separate system parameter
})

const answer = message.content[0].text
```

### Error Handling with Retry
```typescript
// Based on OpenAI documentation patterns
async function generateWithRetry(
  provider: AIProvider,
  params: GenerateParams,
  maxRetries = 3
): Promise<GenerateResult> {
  let lastError: Error
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await provider.generateAnswer(params)
    } catch (error) {
      lastError = error as Error
      
      // Check if it's a rate limit error
      if (error.status === 429) {
        const retryAfter = error.headers?.['retry-after'] || Math.pow(2, attempt)
        await sleep(retryAfter * 1000)
        continue
      }
      
      // Don't retry on auth errors
      if (error.status === 401 || error.status === 403) {
        throw error
      }
      
      // Retry other errors with exponential backoff
      await sleep(Math.pow(2, attempt) * 1000)
    }
  }
  
  throw lastError
}
```

### Chrome Storage for API Keys
```typescript
// Source: https://developer.chrome.com/docs/extensions/reference/api/storage
// Note: v1 uses plain storage per STATE.md, encryption deferred to v2

async function saveAPIKey(provider: 'openai' | 'anthropic', key: string) {
  await chrome.storage.local.set({
    [`${provider}_api_key`]: key,
    [`${provider}_validated_at`]: Date.now()
  })
}

async function getAPIKey(provider: 'openai' | 'anthropic'): Promise<string | null> {
  const result = await chrome.storage.local.get([`${provider}_api_key`])
  return result[`${provider}_api_key`] || null
}

async function validateAPIKey(
  provider: 'openai' | 'anthropic',
  key: string
): Promise<boolean> {
  try {
    if (provider === 'openai') {
      const client = new OpenAI({ apiKey: key, dangerouslyAllowBrowser: true })
      await client.models.list() // Lightweight validation call
      return true
    } else {
      const client = new Anthropic({ apiKey: key })
      await client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }]
      })
      return true
    }
  } catch (error) {
    console.error('API key validation failed:', error)
    return false
  }
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Chat Completions API | Responses API (OpenAI) | 2024+ | Responses API is newer but Chat Completions is stable and sufficient for v1 |
| Direct fetch() calls | Official SDKs | 2023+ | SDKs handle retries, rate limits, types automatically |
| Single system message | Structured prompts with XML/Markdown | 2024+ | Better prompt engineering practices for reliable outputs |
| Temperature 1.0 | Temperature 0.7-0.8 | Ongoing | Better balance of creativity and consistency for application answers |
| Single large prompt | Separate prompts per draft | 2024+ | Produces more varied drafts |

**Deprecated/outdated:**
- **Text Completions API (OpenAI):** Deprecated, use Chat Completions
- **Anthropic v1 API:** Use v2 Messages API
- **Hardcoded prompts:** Modern practice uses structured prompt builders

---

## Open Questions

1. **Model Selection Strategy**
   - What we know: gpt-4o-mini is cost-effective for short answers, Claude Sonnet for longer/complex
   - What's unclear: Should we let users choose model or auto-select based on question length?
   - Recommendation: Auto-select in v1 (mini for short, standard for essays), add user choice in v2

2. **Cache Strategy for Recent Responses**
   - What we know: Same questions appear across different job applications
   - What's unclear: Should we cache generated responses by question text hash?
   - Recommendation: No caching in v1 (complexity), consider for v2 if rate limits become issue

3. **Provider Fallback Strategy**
   - What we know: Both providers can be unavailable or rate-limited
   - What's unclear: Should we automatically fall back to other provider or mock?
   - Recommendation: No automatic fallback in v1, show error and let user retry or switch provider manually

---

## Sources

### Primary (HIGH confidence)
- OpenAI Platform Docs - Libraries: https://platform.openai.com/docs/libraries
- OpenAI Platform Docs - Prompt Engineering: https://platform.openai.com/docs/guides/prompt-engineering
- OpenAI Platform Docs - Rate Limits: https://platform.openai.com/docs/guides/rate-limits
- OpenAI Platform Docs - Authentication: https://platform.openai.com/docs/api-reference/authentication
- Anthropic Docs - Client SDKs: https://docs.anthropic.com/en/api/client-sdks
- Anthropic Docs - Prompt Engineering: https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview
- Anthropic Docs - Rate Limits: https://docs.anthropic.com/en/api/rate-limits
- Chrome Extensions - Storage API: https://developer.chrome.com/docs/extensions/reference/api/storage

### Secondary (MEDIUM confidence)
- OpenAI SDK GitHub (official examples)
- Anthropic SDK GitHub (official examples)

### Tertiary (LOW confidence)
- None used — all findings from official documentation

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official SDKs verified from official docs, installation and usage patterns confirmed
- Architecture: MEDIUM - Provider abstraction pattern is industry standard but not explicitly documented for extensions
- Pitfalls: MEDIUM - Based on common patterns in official docs and best practices, not extension-specific documentation
- Prompt engineering: MEDIUM - Best practices from official docs, but optimal prompts for job applications need testing
- Mock AI generation: LOW - No standard pattern, requires custom implementation and testing

**Research date:** 2026-02-24
**Valid until:** ~30 days (stable domain, but model recommendations may change as new models release)

**Key gaps identified:**
- No official guidance on mock AI generation patterns for extensions
- Limited examples of provider abstraction in extension context
- Placeholder formatting best practices not documented, needs UX testing
- Role-specific tuning depth needs experimentation to find right balance

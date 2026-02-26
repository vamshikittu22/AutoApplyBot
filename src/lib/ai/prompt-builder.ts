import type { ToneVariant, RoleType } from '@/types/ai';

export class PromptBuilder {
  /**
   * Build system prompt for AI providers
   */
  static buildSystemPrompt(params: {
    role: RoleType;
    tone: ToneVariant;
    essayMode: boolean;
  }): string {
    const roleContext = this.getRoleContext(params.role);
    const toneInstructions = this.getToneInstructions(params.tone);
    const formatInstructions = params.essayMode
      ? this.getEssayInstructions()
      : this.getShortAnswerInstructions();

    return `${roleContext}

${toneInstructions}

${formatInstructions}

CRITICAL REQUIREMENTS:
- ALWAYS include placeholders in [brackets] for specific details the user must fill
- NEVER invent specific metrics, dates, company names, or project names
- Make it obvious what needs user input
- Keep placeholders descriptive: [specific project name] not [project]
- Examples of good placeholders: [X% improvement], [Y years], [Z technology]`;
  }

  /**
   * Build user prompt with question context
   */
  static buildUserPrompt(params: { question: string; questionContext?: string }): string {
    let prompt = `Answer this job application question:\n\n"${params.question}"`;

    if (params.questionContext) {
      prompt += `\n\nContext: ${params.questionContext}`;
    }

    return prompt;
  }

  /**
   * Build prompt variants for multiple drafts
   */
  static buildPromptVariants(params: {
    question: string;
    questionContext?: string;
    tone: ToneVariant;
  }): string[] {
    const basePrompt = this.buildUserPrompt(params);

    // Create 3 variations by adding emphasis instructions
    const variations = {
      professional: [
        `${basePrompt}\n\nEmphasize: Professional achievements and quantifiable results.`,
        `${basePrompt}\n\nEmphasize: Collaborative skills and team impact.`,
        `${basePrompt}\n\nEmphasize: Problem-solving approach and methodology.`,
      ],
      concise: [
        `${basePrompt}\n\nBe extremely concise. Focus on the most important point.`,
        `${basePrompt}\n\nBe extremely concise. Focus on measurable outcomes.`,
        `${basePrompt}\n\nBe extremely concise. Focus on relevant skills.`,
      ],
      'story-driven': [
        `${basePrompt}\n\nTell a compelling story with a clear challenge and resolution.`,
        `${basePrompt}\n\nTell a story emphasizing your unique approach and learning.`,
        `${basePrompt}\n\nTell a story highlighting team dynamics and collaboration.`,
      ],
    };

    return variations[params.tone] || variations.professional;
  }

  private static getRoleContext(role: RoleType): string {
    const contexts: Record<RoleType, string> = {
      tech: `You are assisting a software engineer writing job application answers.
Use technical vocabulary naturally. Reference common frameworks, methodologies, and tools.
Good placeholder examples: [specific framework name], [programming language], [team size], [years of experience]`,

      healthcare: `You are assisting a healthcare professional writing job application answers.
Use medical terminology appropriately. Reference clinical outcomes and patient care.
Good placeholder examples: [certification name], [patient volume], [department name], [years of experience]`,

      finance: `You are assisting a finance professional writing job application answers.
Use financial terminology naturally. Reference analytical skills and regulatory knowledge.
Good placeholder examples: [portfolio size], [specific regulation], [financial instrument], [years of experience]`,

      marketing: `You are assisting a marketing professional writing job application answers.
Use marketing terminology naturally. Reference campaigns, metrics, and audience targeting.
Good placeholder examples: [campaign name], [X% engagement increase], [target audience], [platform name]`,

      operations: `You are assisting an operations professional writing job application answers.
Use logistics and process terminology. Reference efficiency improvements and systems.
Good placeholder examples: [X% efficiency gain], [process name], [system name], [years of experience]`,

      other: `You are assisting a professional job seeker writing job application answers.
Use clear, professional language. Focus on transferable skills and achievements.
Good placeholder examples: [specific achievement], [X% improvement], [project name], [years of experience]`,
    };

    return contexts[role];
  }

  private static getToneInstructions(tone: ToneVariant): string {
    const instructions: Record<ToneVariant, string> = {
      professional: `TONE: Professional (Neutral + Polished)
- Use clean, error-free language
- Be diplomatic without being overly formal
- Balance confidence with humility
- Avoid jargon unless role-appropriate`,

      concise: `TONE: Concise (Minimal but Complete)
- Use the shortest possible answer that fully addresses the question
- Every word must add value
- Prefer active voice and strong verbs
- Maximum 2-3 sentences for short answers, 4-5 for essays`,

      'story-driven': `TONE: Story-Driven (Narrative + Engaging)
- Use narrative elements: setup, challenge, action, resolution
- Create emotional connection through specific details (via placeholders)
- Show character development and learning
- Use vivid but professional language`,
    };

    return instructions[tone];
  }

  private static getEssayInstructions(): string {
    return `FORMAT: STAR Outline Structure

Provide a structured outline using the STAR framework. DO NOT write a full essay.

Structure:
**Situation:** [1-2 sentences describing context and challenge]
- Tip: Set the stage with relevant background

**Task:** [1-2 sentences about your specific responsibility or goal]
- Tip: Make it clear what you were accountable for

**Action:** [3-4 bullet points describing steps taken]
• [First major action with specific detail placeholder]
• [Second major action with methodology placeholder]
• [Third action showing problem-solving]
• [Optional: Fourth action if relevant]
- Tip: Focus on YOUR actions, not the team's

**Result:** [2-3 sentences with quantifiable outcomes]
- Include: [X% improvement/increase], [measurable impact], [recognition received]
- Tip: Connect results back to the original challenge

Remember: This is an OUTLINE. The user will fill in their specific story using this structure.`;
  }

  private static getShortAnswerInstructions(): string {
    return `FORMAT: Short Answer (2-4 sentences)

Provide a concise, direct answer to the question.
- First sentence: Direct answer or key qualification
- Second sentence: Supporting evidence or example (with placeholder)
- Optional third sentence: Additional relevant detail or outcome
- Final sentence: Connection to role or forward-looking statement

Keep it focused and easy to scan.`;
  }
}

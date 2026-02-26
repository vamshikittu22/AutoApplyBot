import type { ToneVariant, RoleType } from '@/types/ai';

export interface TemplateParams {
  question: string;
  role: RoleType;
  tone: ToneVariant;
}

/**
 * Generate 3 STAR outline templates with variation
 */
export function getEssayTemplates(params: TemplateParams): [string, string, string] {
  const roleExamples = getRoleSpecificExamples(params.role);

  return [
    // Template 1: Structured outline style
    `**Situation:** In [specific time period/role context], I faced [specific challenge related to ${params.question}]. ${roleExamples.contextHint}

**Task:** My primary objective was to [specific goal or responsibility]. The key challenge was balancing [constraint 1] with [constraint 2].

**Action:** I approached this systematically:
• [First major action] - Specifically, I [methodology/tool used]
• [Second major action] - This involved [specific technique or approach]
• [Third major action] - To ensure success, I [verification or collaboration step]
• [Optional fourth action] - Additionally, I [improvement or adaptation]

**Result:** This led to [measurable outcome with X% improvement or Y metric]. ${roleExamples.outcomeHint} The experience taught me [key learning] and strengthened my [relevant skill].`,

    // Template 2: Challenge-focused style
    `**Situation:** [Brief context about your role and the environment when this occurred]
- The main challenge: [Specific problem that needed solving]
- Why it mattered: [Impact if left unresolved]

**Task:** I was responsible for [specific deliverable or goal]. Success meant [measurable definition of success].

**Action:** My strategy involved three key steps:
1. **[Action category 1]:** [Specific approach with tool/method placeholder]
   - ${roleExamples.actionExample1}
2. **[Action category 2]:** [Specific approach with collaboration placeholder]
   - ${roleExamples.actionExample2}
3. **[Action category 3]:** [Specific approach with outcome verification]
   - Validated through [specific metric or feedback mechanism]

**Result:** Successfully achieved [primary outcome] as measured by [X% metric or Y improvement]. This ${roleExamples.impactVerb} [broader organizational impact]. Recognized through [award/promotion/feedback].`,

    // Template 3: Learning-focused style
    `**Situation:** [Time period and organizational context]
- Challenge encountered: [Specific obstacle or opportunity]
- Initial constraints: [Resources, time, or knowledge gaps]

**Task:** The goal was to [specific objective] while [additional constraint or requirement]. This required [key skill or capability].

**Action:** I took the following approach:
• **Analysis:** [How you assessed the situation - include tool/framework placeholder]
• **Planning:** [How you designed the solution - include methodology placeholder]
• **Execution:** [How you implemented - include ${roleExamples.executionDetail}]
• **Iteration:** [How you refined based on feedback - include learning moment]

**Result:** 
- Primary outcome: [X% improvement in Y metric]
- Secondary benefits: [Additional positive impacts]
- Long-term impact: [How this influenced future work or team practices]
- Personal growth: [Skill developed or lesson learned]

${roleExamples.closingReflection}`,
  ];
}

/**
 * Generate 3 short answer templates with variation
 */
export function getShortAnswerTemplates(params: TemplateParams): [string, string, string] {
  const roleExamples = getRoleSpecificExamples(params.role);

  const toneVariations = {
    professional: [
      `I bring ${roleExamples.qualification} to this challenge. In my role as [specific title] at [company], I [specific relevant achievement with X% metric]. This experience has equipped me with [key skill] that directly applies to [aspect of the question].`,

      `My background in ${roleExamples.domain} has prepared me well for this. Most notably, I [specific accomplishment] which resulted in [measurable outcome]. I'm particularly skilled at [relevant capability] and look forward to applying this to [aspect of role].`,

      `I would approach this by leveraging my experience with ${roleExamples.approach}. For example, at [company name], I [specific relevant action] leading to [X% improvement or Y result]. This demonstrates my ability to [key strength] in [relevant context].`,
    ],

    concise: [
      `${roleExamples.directQualification}. At [company], I [action] resulting in [X% metric]. Strong [key skill].`,

      `[X years] experience in ${roleExamples.domain}. Key achievement: [specific result with metric]. Skilled in [relevant tool/method].`,

      `I would ${roleExamples.directApproach}. Previously achieved [measurable outcome] at [company]. Brings [key strength].`,
    ],

    'story-driven': [
      `I discovered my strength in this area during ${roleExamples.narrativeSetup}. Facing [specific challenge], I realized that [key insight]. By [action taken], I was able to [achievement with metric]. This experience shaped my approach to [relevant skill area] and taught me the importance of [key learning].`,

      `The most defining moment in my ${roleExamples.narrativeDomain} came when [specific situation]. Rather than [conventional approach], I chose to [your unique approach]. The result? [Outcome with metric and broader impact]. This taught me that [key principle] and I've applied this lesson to every project since.`,

      `What excites me about this challenge is how it mirrors ${roleExamples.narrativeConnection}. When I [past situation], I learned that success requires [key insight]. By applying [specific methodology], I achieved [measurable result]. I'm eager to bring this same [quality/approach] to your team.`,
    ],
  };

  return toneVariations[params.tone] as [string, string, string];
}

/**
 * Get role-specific example placeholders and hints
 */
function getRoleSpecificExamples(role: RoleType) {
  const examples: Record<RoleType, any> = {
    tech: {
      qualification: '[X years] of experience in [specific technology domain]',
      domain: '[technology stack] and [specific methodology like Agile/DevOps]',
      approach: '[specific framework or architecture pattern]',
      directQualification: '[X years] software engineering with focus on [specific domain]',
      directApproach: 'architect a solution using [technology] following [pattern]',
      contextHint: 'The codebase/system was [specific technical context].',
      outcomeHint: 'This improved [performance metric] and reduced [cost/time metric].',
      actionExample1: 'Implemented [specific technical solution] using [tool/framework]',
      actionExample2: 'Collaborated with [team] to integrate [technology]',
      executionDetail: 'specific commit/PR/deployment details',
      impactVerb: 'increased system',
      closingReflection:
        'This strengthened my expertise in [technical area] and reinforced the value of [engineering principle].',
      narrativeSetup: 'a challenging [project type] at [company]',
      narrativeDomain: 'engineering career',
      narrativeConnection: 'a technical challenge I solved at [company]',
    },

    healthcare: {
      qualification: '[X years] of clinical experience in [specialty]',
      domain: '[clinical specialty] with focus on [patient population]',
      approach: '[evidence-based practice or clinical protocol]',
      directQualification: '[X years] [clinical role] specializing in [area]',
      directApproach: 'implement [clinical protocol] following [evidence-based guideline]',
      contextHint: 'The department served [patient volume] patients with [specific conditions].',
      outcomeHint: 'This improved patient outcomes by [X%] and increased [quality metric].',
      actionExample1: 'Implemented [clinical protocol] following [regulatory standard]',
      actionExample2: 'Collaborated with [department] to improve [patient care aspect]',
      executionDetail: 'specific patient outcome improvements',
      impactVerb: 'improved patient',
      closingReflection:
        'This deepened my commitment to [care principle] and enhanced my ability to [clinical skill].',
      narrativeSetup: 'a critical patient care situation at [facility]',
      narrativeDomain: 'clinical career',
      narrativeConnection: 'a patient care challenge I addressed at [facility]',
    },

    finance: {
      qualification: '[X years] of experience in [financial domain]',
      domain: '[financial instruments/markets] with expertise in [specific area]',
      approach: '[analytical framework or financial model]',
      directQualification: '[X years] in [financial role] focusing on [specialization]',
      directApproach: 'analyze using [financial model] following [regulation/framework]',
      contextHint: 'The portfolio/project involved [dollar amount] across [asset classes].',
      outcomeHint: 'This generated [X% returns/savings] and reduced [risk metric].',
      actionExample1: 'Analyzed [financial instrument] using [model/tool] per [regulation]',
      actionExample2: 'Collaborated with [stakeholders] to optimize [financial metric]',
      executionDetail: 'specific risk mitigation or return optimization steps',
      impactVerb: 'increased portfolio',
      closingReflection:
        'This strengthened my expertise in [financial area] and reinforced the importance of [financial principle].',
      narrativeSetup: 'a complex deal/analysis at [institution]',
      narrativeDomain: 'finance career',
      narrativeConnection: 'a financial challenge I solved at [institution]',
    },

    marketing: {
      qualification: '[X years] driving [marketing channel] campaigns',
      domain: '[marketing channel] with focus on [audience/industry]',
      approach: '[marketing framework or campaign strategy]',
      directQualification: '[X years] in [marketing role] specializing in [channel]',
      directApproach: 'execute [campaign type] using [platform] targeting [audience]',
      contextHint: 'The campaign targeted [audience size] across [channels].',
      outcomeHint: 'This increased [engagement/conversions] by [X%] and grew [business metric].',
      actionExample1: 'Launched [campaign type] on [platform] using [strategy]',
      actionExample2: 'Collaborated with [team] to optimize [metric]',
      executionDetail: 'specific A/B testing or optimization details',
      impactVerb: 'increased',
      closingReflection:
        'This enhanced my skills in [marketing area] and proved the value of [marketing principle].',
      narrativeSetup: 'a high-stakes campaign at [company]',
      narrativeDomain: 'marketing career',
      narrativeConnection: 'a campaign challenge I solved at [company]',
    },

    operations: {
      qualification: '[X years] optimizing [operational domain]',
      domain: '[operational area] with focus on [process/system]',
      approach: '[operational framework or methodology]',
      directQualification: '[X years] in [operations role] focusing on [specialization]',
      directApproach: 'streamline [process] using [methodology] to improve [metric]',
      contextHint: 'The operation handled [volume] across [locations/systems].',
      outcomeHint: 'This reduced [cost/time] by [X%] and improved [efficiency metric].',
      actionExample1: 'Optimized [process] using [tool/methodology]',
      actionExample2: 'Collaborated with [stakeholders] to implement [system improvement]',
      executionDetail: 'specific process improvements or efficiency gains',
      impactVerb: 'improved operational',
      closingReflection:
        'This strengthened my expertise in [operational area] and demonstrated the value of [operations principle].',
      narrativeSetup: 'a critical process challenge at [company]',
      narrativeDomain: 'operations career',
      narrativeConnection: 'an operational challenge I solved at [company]',
    },

    other: {
      qualification: '[X years] of professional experience in [domain]',
      domain: '[professional area] with focus on [specialization]',
      approach: '[methodology or framework]',
      directQualification: '[X years] in [role] with focus on [area]',
      directApproach: 'apply [skill/method] to achieve [objective]',
      contextHint: 'The project/role involved [scope] with [stakeholders].',
      outcomeHint: 'This achieved [X% improvement] in [relevant metric].',
      actionExample1: 'Implemented [solution] using [approach]',
      actionExample2: 'Collaborated with [team] to deliver [outcome]',
      executionDetail: 'specific actions and results',
      impactVerb: 'improved',
      closingReflection:
        'This experience strengthened my [skill] and reinforced the importance of [principle].',
      narrativeSetup: 'a significant project at [organization]',
      narrativeDomain: 'professional career',
      narrativeConnection: 'a challenge I addressed at [organization]',
    },
  };

  return examples[role] || examples.other;
}

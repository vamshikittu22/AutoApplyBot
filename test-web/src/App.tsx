import React, { useState, useCallback } from 'react';

// ── Extension parser imports (same code as the extension) ─────
import { parseResume } from '@/lib/parser/resume-parser';
import type { ParsedResume } from '@/types/resume';

// ── Extension components (same code as the extension) ─────────
import { ProfileEditor }       from '@/components/ProfileEditor';

// ─────────────────────────────────────────────────────────────

type View = 'parser' | 'editor';

const SAMPLE_RESUME = `Vamshi Krishna Pullaiahgari
Software Engineer
+1 (913) 326-7373 | vamshikrishna2297@gmail.com | LinkedIn | GitHub | Portfolio

PROFESSIONAL SUMMARY
Software Engineer with 6 years of experience designing and delivering scalable backend systems, distributed systems, and microservices architectures using Go, Java, Python, and AI agentic workflows.

TECHNICAL SKILLS
Languages & Frameworks: Go, Java (8–17), Python, C, C#, Spring Boot, Spring Framework, Node.js, JavaScript, TypeScript
Backend & APIs: RESTful APIs, Microservices, Distributed Systems, GraphQL
Databases & Data: MySQL, PostgreSQL, MongoDB, Redis, ClickHouse, ElasticSearch
Cloud & Infrastructure: AWS (EC2, ECS, EKS, Lambda, S3, RDS), Docker, Kubernetes, Azure (AKS, Functions)
DevOps & Monitoring: CI/CD, Jenkins, GitHub Actions, Production Monitoring, CloudWatch

PROFESSIONAL EXPERIENCE
CVS Health | Software Engineer                                                   Feb 2025 – Present | Texas, USA
Claims Management Dashboard – Java, Spring Boot, Angular, Vue.js, REST APIs, GraphQL, AWS ECS, RDS, D3.js.
• Owned feature development through complete lifecycle: design, development, testing, release, and production monitoring.
• Designed Java Spring Boot RESTful APIs supporting high-volume claims processing workflows.
• Built scalable data ingestion pipelines processing large data volumes of healthcare claims.

Citadel (Financial Services) | Software Engineer                                Aug 2024 – Dec 2024 | Florida, USA
Trading & Risk Management Systems – Go, Java, Spring Boot, React.js, Kafka, PostgreSQL, Azure AKS, Microservices.
• Designed and developed high-performance Go microservices for real-time financial transaction processing, 100K+ transactions/sec.
• Implemented comprehensive monitoring and observability solutions using Azure Monitor and Application Insights.

Mphasis | Software Engineer                                                    Feb 2021 – July 2023 | Pune, India
Digital Banking Modernization – Java, Spring Boot, C#, Angular, REST APIs, OAuth 2.0, Oracle, PostgreSQL, AWS EKS.
• Designed and maintained Java Spring Boot RESTful APIs implementing business logic and integration patterns.
• Wrote clean, maintainable code with 85%+ code coverage using JUnit and Mockito.

Covantech Pvt Ltd | Associate Software Engineer                                Aug 2019 – Jan 2021 | Hyderabad, India
Healthcare CRM Platform Modernization – Python, Selenium WebDriver, REST APIs, Kafka, AWS ECS, Oracle, MongoDB.
• Developed Python and Java-based data pipelines for healthcare CRM platform.
• Automated API testing and Kafka message queue verification using Selenium and Python.

EDUCATION
Masters in Computer Information Systems, University of Central Missouri, Warrensburg, USA.               Dec 2024`;

// ── Tiny JSON syntax highlighter ─────────────────────────────
function highlight(json: string): string {
  return json
    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?)/g, (match) => {
      const cls = match.endsWith(':') ? 'json-key' : 'json-string';
      return `<span class="${cls}">${match}</span>`;
    })
    .replace(/\b(true|false)\b/g, '<span class="json-bool">$1</span>')
    .replace(/\bnull\b/g, '<span class="json-null">null</span>')
    .replace(/\b(-?\d+\.?\d*)\b/g, '<span class="json-number">$1</span>');
}

// ── Parser Debug Panel ────────────────────────────────────────
function ParserPanel() {
  const [resumeText, setResumeText]   = useState(SAMPLE_RESUME);
  const [result, setResult]           = useState<ParsedResume | null>(null);
  const [error, setError]             = useState<string | null>(null);
  const [isParsing, setIsParsing]     = useState(false);
  const [activeSection, setSection]   = useState<'all' | 'contact' | 'work' | 'education' | 'skills'>('all');
  const [elapsed, setElapsed]         = useState<number | null>(null);

  const handleParse = useCallback(async () => {
    setIsParsing(true);
    setError(null);
    const t0 = performance.now();
    try {
      const res = await parseResume(resumeText);
      setElapsed(performance.now() - t0);
      if (res.success) {
        setResult(res.data);
      } else {
        setError(res.error ?? 'Unknown parse error');
        setResult(null);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setResult(null);
    } finally {
      setIsParsing(false);
    }
  }, [resumeText]);

  const getSection = () => {
    if (!result) return null;
    const p = result.profile;
    switch (activeSection) {
      case 'contact':   return p.personal;
      case 'work':      return p.workHistory;
      case 'education': return p.education;
      case 'skills':    return p.skills;
      default:          return p;
    }
  };

  const jsonStr = getSection() ? JSON.stringify(getSection(), null, 2) : '';

  return (
    <div className="flex flex-col h-full gap-0">
      {/* Input panel */}
      <div className="flex flex-col gap-3 p-4 border-b border-[var(--color-border)] bg-white">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-wider">
            Resume Input
          </label>
          <div className="flex items-center gap-2">
            {elapsed !== null && (
              <span className="text-xs text-[var(--color-subtle)] font-mono">
                {elapsed.toFixed(1)} ms
              </span>
            )}
            <button
              onClick={() => { setResumeText(''); setResult(null); setError(null); setElapsed(null); }}
              className="px-2.5 py-1 text-xs text-[var(--color-muted)] border border-[var(--color-border)] rounded-lg hover:border-red-300 hover:text-red-500 transition-colors"
            >
              Clear
            </button>
            <button
              onClick={() => setResumeText(SAMPLE_RESUME)}
              className="px-2.5 py-1 text-xs text-[var(--color-muted)] border border-[var(--color-border)] rounded-lg hover:border-[var(--color-primary)] transition-colors"
            >
              Load Sample
            </button>
            <button
              onClick={handleParse}
              disabled={isParsing || !resumeText.trim()}
              className="px-4 py-1.5 text-xs font-semibold bg-[var(--color-primary)] text-white rounded-lg hover:bg-[#075985] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {isParsing ? '⏳ Parsing…' : '▶ Parse'}
            </button>
          </div>
        </div>
        <textarea
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="Paste any resume text here…"
          className="w-full font-mono text-xs leading-relaxed border border-[var(--color-border)] rounded-lg p-3 bg-[#FAFAFA] resize-none focus:outline-none focus:border-[var(--color-primary-light)]"
          style={{ height: 240 }}
        />
      </div>

      {/* Output panel */}
      <div className="flex flex-col flex-1 min-h-0">
        {/* Section tabs */}
        {result && (
          <div className="flex border-b border-[var(--color-border)] bg-white px-4 gap-1 flex-shrink-0">
            {(['all', 'contact', 'work', 'education', 'skills'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSection(s)}
                className={`px-3 py-2 text-xs font-semibold capitalize transition-colors border-b-2 -mb-px ${
                  activeSection === s
                    ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                    : 'border-transparent text-[var(--color-subtle)] hover:text-[var(--color-muted)]'
                }`}
              >
                {s === 'all' ? 'Full Profile' : s === 'work' ? 'Work History' : s.charAt(0).toUpperCase() + s.slice(1)}
                {s === 'work' && result && (
                  <span className="ml-1 px-1.5 py-0.5 bg-[#DBEAFE] text-[#1E40AF] rounded-full text-[10px]">
                    {result.profile.workHistory?.length ?? 0}
                  </span>
                )}
                {s === 'education' && result && (
                  <span className="ml-1 px-1.5 py-0.5 bg-[#DBEAFE] text-[#1E40AF] rounded-full text-[10px]">
                    {result.profile.education?.length ?? 0}
                  </span>
                )}
                {s === 'skills' && result && (
                  <span className="ml-1 px-1.5 py-0.5 bg-[#DBEAFE] text-[#1E40AF] rounded-full text-[10px]">
                    {result.profile.skills?.length ?? 0}
                  </span>
                )}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-2 py-1.5">
              <span className="text-[10px] text-[var(--color-subtle)]">
                {result.confidenceScores.length} fields · avg{' '}
                {(result.confidenceScores.reduce((a, c) => a + c.confidence, 0) / (result.confidenceScores.length || 1)).toFixed(0)}% confidence
              </span>
            </div>
          </div>
        )}

        {/* JSON Output */}
        <div className="flex-1 min-h-0 overflow-auto p-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-mono">
              ✗ {error}
            </div>
          )}
          {!result && !error && !isParsing && (
            <div className="flex flex-col items-center justify-center h-full text-[var(--color-subtle)] gap-2">
              <span className="text-3xl">🔍</span>
              <p className="text-sm">Paste a resume and click <strong>Parse</strong> to see the output.</p>
            </div>
          )}
          {result && (
            <pre
              className="text-xs"
              dangerouslySetInnerHTML={{ __html: highlight(jsonStr) }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Confidence Score Table ────────────────────────────────────
function ConfidenceTable({ scores }: { scores: ParsedResume['confidenceScores'] }) {
  if (!scores.length) return null;
  return (
    <div className="p-4 overflow-auto h-full">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="text-left text-[var(--color-subtle)] border-b border-[var(--color-border)]">
            <th className="pb-2 font-semibold">Field</th>
            <th className="pb-2 font-semibold">Source</th>
            <th className="pb-2 font-semibold w-16 text-right">Score</th>
            <th className="pb-2 pl-2">Bar</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((s, i) => (
            <tr key={i} className="border-b border-[var(--color-bg)] hover:bg-[var(--color-bg)] transition-colors">
              <td className="py-1.5 font-mono text-[var(--color-text)]">{s.field}</td>
              <td className="py-1.5 text-[var(--color-subtle)]">{s.source}</td>
              <td className="py-1.5 text-right font-semibold" style={{
                color: s.confidence >= 85 ? '#166534' : s.confidence >= 70 ? '#854D0E' : '#991B1B'
              }}>
                {s.confidence}%
              </td>
              <td className="py-1.5 pl-2 w-24">
                <div className="h-1.5 rounded-full bg-[var(--color-border)] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${s.confidence}%`,
                      background: s.confidence >= 85 ? '#22C55E' : s.confidence >= 70 ? '#F59E0B' : '#EF4444',
                    }}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Root App ──────────────────────────────────────────────────
const TABS = [
  { id: 'parser' as View,  label: '🔍 Parser Debug',   hint: 'Raw JSON output from the resume parser' },
  { id: 'editor' as View,  label: '✏️ Profile Editor', hint: 'Full UI editor (uses same stored data as the extension)' },
] as const;

export default function App() {
  const [view, setView] = useState<View>('parser');
  const [parserResult, setParserResult] = useState<ParsedResume | null>(null);

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg)]">
      {/* ── Top bar ─────────────────────────────────────────── */}
      <header className="bg-[var(--color-primary)] text-white px-6 py-3 flex items-center gap-4 shadow-lg flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-sm leading-none">AutoApply Copilot</h1>
            <p className="text-[10px] text-sky-200 mt-0.5">Parser Test Harness</p>
          </div>
        </div>

        {/* Tab switcher */}
        <nav className="flex gap-1 ml-4 bg-white/10 p-0.5 rounded-lg">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setView(t.id)}
              title={t.hint}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                view === t.id
                  ? 'bg-white text-[var(--color-primary)] shadow-sm'
                  : 'text-sky-100 hover:bg-white/10'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto text-xs text-sky-200">
          Storage: <span className="font-mono text-white">localStorage</span>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────────── */}
      <main className="flex-1 min-h-0 flex overflow-hidden">

        {/* Parser view — 2 columns: textarea | JSON + confidence */}
        {view === 'parser' && (
          <div className="flex flex-1 min-h-0 gap-0 overflow-hidden">
            {/* Left — input + JSON output */}
            <div className="flex flex-col flex-1 min-w-0 min-h-0 border-r border-[var(--color-border)] bg-white overflow-hidden">
              <ParserPanel />
            </div>

            {/* Right — confidence scores */}
            <div className="w-80 flex-shrink-0 bg-white overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-[var(--color-border)] flex-shrink-0">
                <h2 className="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-wider">
                  Confidence Scores
                </h2>
              </div>
              <div className="flex-1 min-h-0 overflow-auto">
                {parserResult ? (
                  <ConfidenceTable scores={parserResult.confidenceScores} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-[var(--color-subtle)] gap-1 px-4 text-center">
                    <span className="text-2xl">📊</span>
                    <p className="text-xs">Parse a resume to see field confidence scores</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Editor view — full ProfileEditor */}
        {view === 'editor' && (
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-4xl mx-auto">
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                💡 This editor uses the <strong>same</strong> React components as the extension. Data is saved to
                {' '}<code className="font-mono bg-amber-100 px-1 rounded">localStorage</code> (prefixed <code className="font-mono bg-amber-100 px-1 rounded">__autoapply__</code>)
                instead of <code className="font-mono bg-amber-100 px-1 rounded">chrome.storage.local</code>.
              </div>
              <ProfileEditor />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

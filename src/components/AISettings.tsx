/**
 * AISettings Component — Redesigned with Taylor-inspired layout
 * Expanded with Google Gemini and Groq AI providers.
 */

import { useState, useEffect } from 'react';
import {
  getAIConfig,
  setAIProvider,
  saveAPIKey,
  clearAPIKey,
  hasValidKey,
  createProviderForValidation,
} from '@/lib/ai';
import type { AIConfig, AIProvider } from '@/types/ai';

export function AISettings() {
  const [config, setConfig] = useState<AIConfig | null>(null);
  
  // API Keys state
  const [openaiKey, setOpenaiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [groqKey, setGroqKey] = useState('');

  // Validation state
  const [isValidatingOpenAI, setIsValidatingOpenAI] = useState(false);
  const [isValidatingAnthropic, setIsValidatingAnthropic] = useState(false);
  const [isValidatingGemini, setIsValidatingGemini] = useState(false);
  const [isValidatingGroq, setIsValidatingGroq] = useState(false);

  // Results state
  const [openaiValidation, setOpenaiValidation] = useState<'success' | 'error' | null>(null);
  const [anthropicValidation, setAnthropicValidation] = useState<'success' | 'error' | null>(null);
  const [geminiValidation, setGeminiValidation] = useState<'success' | 'error' | null>(null);
  const [groqValidation, setGroqValidation] = useState<'success' | 'error' | null>(null);

  // Errors state
  const [openaiError, setOpenaiError] = useState('');
  const [anthropicError, setAnthropicError] = useState('');
  const [geminiError, setGeminiError] = useState('');
  const [groqError, setGroqError] = useState('');

  // Valid configured keys
  const [hasOpenAIKey, setHasOpenAIKey] = useState(false);
  const [hasAnthropicKey, setHasAnthropicKey] = useState(false);
  const [hasGeminiKey, setHasGeminiKey] = useState(false);
  const [hasGroqKey, setHasGroqKey] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    const aiConfig = await getAIConfig();
    setConfig(aiConfig);

    const [openaiValid, anthropicValid, geminiValid, groqValid] = await Promise.all([
      hasValidKey('openai'),
      hasValidKey('anthropic'),
      hasValidKey('gemini'),
      hasValidKey('groq'),
    ]);

    setHasOpenAIKey(openaiValid);
    setHasAnthropicKey(anthropicValid);
    setHasGeminiKey(geminiValid);
    setHasGroqKey(groqValid);
  };

  const handleProviderChange = async (provider: AIProvider) => {
    if (provider === 'openai' && !hasOpenAIKey) {
      alert('Please add and validate an OpenAI API key first'); return;
    }
    if (provider === 'anthropic' && !hasAnthropicKey) {
      alert('Please add and validate an Anthropic API key first'); return;
    }
    if (provider === 'gemini' && !hasGeminiKey) {
      alert('Please add and validate a Gemini API key first'); return;
    }
    if (provider === 'groq' && !hasGroqKey) {
      alert('Please add and validate a Groq API key first'); return;
    }

    await setAIProvider(provider);
    await loadConfig();
  };

  // Generic Key Validation handler
  const validateKey = async (
    providerName: Exclude<AIProvider, 'mock'>,
    keyVal: string,
    setValidating: (val: boolean) => void,
    setValidation: (val: 'success' | 'error' | null) => void,
    setError: (val: string) => void,
    setHasKey: (val: boolean) => void,
    setKeyVal: (val: string) => void,
    validationRegex?: RegExp,
    regexError?: string
  ) => {
    if (!keyVal.trim()) {
      setError('Please enter an API key');
      return;
    }
    if (validationRegex && !validationRegex.test(keyVal)) {
      setError(regexError || 'Invalid format');
      return;
    }

    setValidating(true);
    setValidation(null);
    setError('');

    try {
      const provider = await createProviderForValidation(providerName, keyVal);
      const isValid = await provider.validateKey!(keyVal);

      if (isValid) {
        // Exclude 'mock' from providerName via type casting to fit saveAPIKey
        await saveAPIKey(providerName as Exclude<AIProvider, 'mock'>, keyVal, Date.now());
        setValidation('success');
        setKeyVal('');
        setHasKey(true);

        if (config?.provider === 'mock') {
          await setAIProvider(providerName);
          await loadConfig();
        }
      } else {
        setValidation('error');
        setError('Invalid API key. Please check and try again.');
      }
    } catch (error: unknown) {
      setValidation('error');
      setError(error instanceof Error ? error.message : 'Validation failed');
    } finally {
      setValidating(false);
    }
  };

  // Remove Key handler
  const removeKey = async (
    providerName: Exclude<AIProvider, 'mock'>,
    setHasKey: (val: boolean) => void,
    setValidation: (val: null) => void
  ) => {
    if (confirm(`Remove ${providerName} API key? This will switch to Mock AI mode if currently active.`)) {
      await clearAPIKey(providerName);
      setHasKey(false);
      setValidation(null);
      await loadConfig();
    }
  };

  if (!config) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* ── Active Provider ──────────────────────────────────── */}
      <div className="content-card animate-in">
        <div className="section-header">
          <h3>Active Provider</h3>
        </div>

        <div className="tip-banner">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
          Choose your AI provider for intelligent answer suggestions during job applications.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {/* Mock AI */}
          <label className={`radio-card ${config.provider === 'mock' ? 'selected' : ''}`}>
            <input type="radio" name="provider" checked={config.provider === 'mock'}
              onChange={() => handleProviderChange('mock')}
              style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)' }}>Mock AI (Free)</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Template-based suggestions with placeholders
              </div>
            </div>
            <span className="badge badge-free">Free</span>
          </label>

          {/* Gemini AI */}
          <label className={`radio-card ${config.provider === 'gemini' ? 'selected' : ''}`} style={{ opacity: hasGeminiKey ? 1 : 0.7 }}>
            <input type="radio" name="provider" checked={config.provider === 'gemini'}
              onChange={() => handleProviderChange('gemini')} disabled={!hasGeminiKey}
              style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)' }}>Google Gemini</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {hasGeminiKey ? 'API key configured' : 'Requires API key'}
                {hasGeminiKey && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth={3} style={{ display: 'inline-block', marginLeft: '4px', verticalAlign: '-2px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
              </div>
            </div>
            <span className="badge badge-free">Free Tier</span>
          </label>

          {/* Groq AI */}
          <label className={`radio-card ${config.provider === 'groq' ? 'selected' : ''}`} style={{ opacity: hasGroqKey ? 1 : 0.7 }}>
            <input type="radio" name="provider" checked={config.provider === 'groq'}
              onChange={() => handleProviderChange('groq')} disabled={!hasGroqKey}
              style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)' }}>Groq LLaMA 3.3</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {hasGroqKey ? 'API key configured' : 'Requires API key'}
                {hasGroqKey && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth={3} style={{ display: 'inline-block', marginLeft: '4px', verticalAlign: '-2px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
              </div>
            </div>
            <span className="badge badge-free">Free / Fast</span>
          </label>

          {/* OpenAI */}
          <label className={`radio-card ${config.provider === 'openai' ? 'selected' : ''}`} style={{ opacity: hasOpenAIKey ? 1 : 0.7 }}>
            <input type="radio" name="provider" checked={config.provider === 'openai'}
              onChange={() => handleProviderChange('openai')} disabled={!hasOpenAIKey}
              style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)' }}>OpenAI GPT-4o</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {hasOpenAIKey ? 'API key configured' : 'Requires API key'}
                {hasOpenAIKey && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth={3} style={{ display: 'inline-block', marginLeft: '4px', verticalAlign: '-2px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
              </div>
            </div>
            <span className="badge badge-paid">Paid</span>
          </label>

          {/* Anthropic */}
          <label className={`radio-card ${config.provider === 'anthropic' ? 'selected' : ''}`} style={{ opacity: hasAnthropicKey ? 1 : 0.7 }}>
            <input type="radio" name="provider" checked={config.provider === 'anthropic'}
              onChange={() => handleProviderChange('anthropic')} disabled={!hasAnthropicKey}
              style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)' }}>Anthropic Claude</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {hasAnthropicKey ? 'API key configured' : 'Requires API key'}
                {hasAnthropicKey && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth={3} style={{ display: 'inline-block', marginLeft: '4px', verticalAlign: '-2px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>}
              </div>
            </div>
            <span className="badge badge-premium">Paid</span>
          </label>

        </div>
      </div>

      {/* ── API Keys Configuration ──────────────────────────────── */}
      
      {/* Google Gemini */}
      <div className="content-card animate-in">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div className="section-header" style={{ marginBottom: 0 }}>
            <h3>Google Gemini Key</h3>
          </div>
          {hasGeminiKey && (
            <button onClick={() => removeKey('gemini', setHasGeminiKey, setGeminiValidation)} className="btn-danger" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>Remove Key</button>
          )}
        </div>

        {hasGeminiKey ? (
          <div className="info-box info-box-green">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <div>
              <p style={{ fontWeight: 600, margin: '0 0 0.25rem 0' }}>Gemini API key configured and validated</p>
              <p style={{ fontSize: '0.75rem', margin: 0, opacity: 0.8 }}>Validated: {new Date(config.geminiValidatedAt!).toLocaleString()}</p>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input type="password" value={geminiKey} placeholder="AIza..." className="form-input"
                onChange={(e) => { setGeminiKey(e.target.value); setGeminiValidation(null); setGeminiError(''); }} />
              <button 
                onClick={() => validateKey('gemini', geminiKey, setIsValidatingGemini, setGeminiValidation, setGeminiError, setHasGeminiKey, setGeminiKey, /^AIza/, 'Gemini keys should start with "AIza"')}
                disabled={isValidatingGemini || !geminiKey.trim()} className="btn-primary" style={{ background: '#1A73E8' }}>
                {isValidatingGemini ? 'Validating...' : 'Validate & Save'}
              </button>
            </div>
            {geminiValidation === 'error' && (
              <div className="info-box info-box-red" style={{ marginTop: '0.75rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                <div>
                  <p style={{ fontWeight: 600, margin: 0 }}>{geminiError}</p>
                </div>
              </div>
            )}
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
              Get your API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ color: '#1A73E8', textDecoration: 'none', fontWeight: 600 }}>Google AI Studio</a>
            </p>
          </>
        )}
      </div>

      {/* Groq API */}
      <div className="content-card animate-in">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div className="section-header" style={{ marginBottom: 0 }}>
            <h3>Groq API Key</h3>
          </div>
          {hasGroqKey && (
            <button onClick={() => removeKey('groq', setHasGroqKey, setGroqValidation)} className="btn-danger" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>Remove Key</button>
          )}
        </div>

        {hasGroqKey ? (
          <div className="info-box info-box-green">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <div>
              <p style={{ fontWeight: 600, margin: '0 0 0.25rem 0' }}>Groq API key configured and validated</p>
              <p style={{ fontSize: '0.75rem', margin: 0, opacity: 0.8 }}>Validated: {new Date(config.groqValidatedAt!).toLocaleString()}</p>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input type="password" value={groqKey} placeholder="gsk_..." className="form-input"
                onChange={(e) => { setGroqKey(e.target.value); setGroqValidation(null); setGroqError(''); }} />
              <button 
                onClick={() => validateKey('groq', groqKey, setIsValidatingGroq, setGroqValidation, setGroqError, setHasGroqKey, setGroqKey, /^gsk_/, 'Groq keys should start with "gsk_"')}
                disabled={isValidatingGroq || !groqKey.trim()} className="btn-primary" style={{ background: '#F97316' }}>
                {isValidatingGroq ? 'Validating...' : 'Validate & Save'}
              </button>
            </div>
            {groqValidation === 'error' && (
              <div className="info-box info-box-red" style={{ marginTop: '0.75rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                <div>
                  <p style={{ fontWeight: 600, margin: 0 }}>{groqError}</p>
                </div>
              </div>
            )}
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
              Get your API key from <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" style={{ color: '#F97316', textDecoration: 'none', fontWeight: 600 }}>Groq Console</a>
            </p>
          </>
        )}
      </div>

      {/* OpenAI API Key */}
      <div className="content-card animate-in">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div className="section-header" style={{ marginBottom: 0 }}>
            <h3>OpenAI API Key</h3>
          </div>
          {hasOpenAIKey && (
            <button onClick={() => removeKey('openai', setHasOpenAIKey, setOpenaiValidation)} className="btn-danger" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>Remove Key</button>
          )}
        </div>

        {hasOpenAIKey ? (
          <div className="info-box info-box-green">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <div>
              <p style={{ fontWeight: 600, margin: '0 0 0.25rem 0' }}>OpenAI API key configured and validated</p>
              <p style={{ fontSize: '0.75rem', margin: 0, opacity: 0.8 }}>Validated: {new Date(config.openaiValidatedAt!).toLocaleString()}</p>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input type="password" value={openaiKey} placeholder="sk-..." className="form-input"
                onChange={(e) => { setOpenaiKey(e.target.value); setOpenaiValidation(null); setOpenaiError(''); }} />
              <button 
                onClick={() => validateKey('openai', openaiKey, setIsValidatingOpenAI, setOpenaiValidation, setOpenaiError, setHasOpenAIKey, setOpenaiKey, /^sk-/, 'OpenAI keys should start with "sk-"')}
                disabled={isValidatingOpenAI || !openaiKey.trim()} className="btn-primary" style={{ background: '#10A37F' }}>
                {isValidatingOpenAI ? 'Validating...' : 'Validate & Save'}
              </button>
            </div>
            {openaiValidation === 'error' && (
              <div className="info-box info-box-red" style={{ marginTop: '0.75rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                <div><p style={{ fontWeight: 600, margin: 0 }}>{openaiError}</p></div>
              </div>
            )}
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
              Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" style={{ color: '#10A37F', textDecoration: 'none', fontWeight: 600 }}>OpenAI Platform</a>
            </p>
          </>
        )}
      </div>

      {/* Anthropic API Key */}
      <div className="content-card animate-in">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div className="section-header" style={{ marginBottom: 0 }}>
            <h3>Anthropic API Key</h3>
          </div>
          {hasAnthropicKey && (
            <button onClick={() => removeKey('anthropic', setHasAnthropicKey, setAnthropicValidation)} className="btn-danger" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>Remove Key</button>
          )}
        </div>

        {hasAnthropicKey ? (
          <div className="info-box info-box-green">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <div>
              <p style={{ fontWeight: 600, margin: '0 0 0.25rem 0' }}>Anthropic API key configured and validated</p>
              <p style={{ fontSize: '0.75rem', margin: 0, opacity: 0.8 }}>Validated: {new Date(config.anthropicValidatedAt!).toLocaleString()}</p>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input type="password" value={anthropicKey} placeholder="sk-ant-..." className="form-input"
                onChange={(e) => { setAnthropicKey(e.target.value); setAnthropicValidation(null); setAnthropicError(''); }} />
              <button 
                onClick={() => validateKey('anthropic', anthropicKey, setIsValidatingAnthropic, setAnthropicValidation, setAnthropicError, setHasAnthropicKey, setAnthropicKey, /^sk-ant-/, 'Anthropic keys should start with "sk-ant-"')}
                disabled={isValidatingAnthropic || !anthropicKey.trim()} className="btn-primary" style={{ background: '#7C3AED' }}>
                {isValidatingAnthropic ? 'Validating...' : 'Validate & Save'}
              </button>
            </div>
            {anthropicValidation === 'error' && (
              <div className="info-box info-box-red" style={{ marginTop: '0.75rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                <div><p style={{ fontWeight: 600, margin: 0 }}>{anthropicError}</p></div>
              </div>
            )}
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
              Get your API key from <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer" style={{ color: '#7C3AED', textDecoration: 'none', fontWeight: 600 }}>Anthropic Console</a>
            </p>
          </>
        )}
      </div>

      {/* ── Privacy Notice ───────────────────────────────────── */}
      <div className="privacy-card animate-in">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
        <p>
          <strong>Privacy & Security: </strong>
          Your API keys are stored locally in your browser only. They are never sent to any
          server except directly to your chosen provider when generating answers.
        </p>
      </div>
    </div>
  );
}

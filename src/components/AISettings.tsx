/**
 * AISettings Component — Redesigned with Taylor-inspired layout
 *
 * Clean section cards with accent borders, radio cards for provider selection,
 * and consistent form styling matching the design system.
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
  const [openaiKey, setOpenaiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [isValidatingOpenAI, setIsValidatingOpenAI] = useState(false);
  const [isValidatingAnthropic, setIsValidatingAnthropic] = useState(false);
  const [openaiValidation, setOpenaiValidation] = useState<'success' | 'error' | null>(null);
  const [anthropicValidation, setAnthropicValidation] = useState<'success' | 'error' | null>(null);
  const [openaiError, setOpenaiError] = useState('');
  const [anthropicError, setAnthropicError] = useState('');
  const [hasOpenAIKey, setHasOpenAIKey] = useState(false);
  const [hasAnthropicKey, setHasAnthropicKey] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    const aiConfig = await getAIConfig();
    setConfig(aiConfig);

    const [openaiValid, anthropicValid] = await Promise.all([
      hasValidKey('openai'),
      hasValidKey('anthropic'),
    ]);

    setHasOpenAIKey(openaiValid);
    setHasAnthropicKey(anthropicValid);
  };

  const handleOpenAIValidate = async () => {
    if (!openaiKey.trim()) {
      setOpenaiError('Please enter an API key');
      return;
    }

    if (!openaiKey.startsWith('sk-')) {
      setOpenaiError('OpenAI keys should start with "sk-"');
      return;
    }

    setIsValidatingOpenAI(true);
    setOpenaiValidation(null);
    setOpenaiError('');

    try {
      const provider = await createProviderForValidation('openai', openaiKey);
      const isValid = await provider.validateKey!(openaiKey);

      if (isValid) {
        await saveAPIKey('openai', openaiKey, Date.now());
        setOpenaiValidation('success');
        setOpenaiKey('');
        setHasOpenAIKey(true);

        if (config?.provider === 'mock') {
          await setAIProvider('openai');
          await loadConfig();
        }
      } else {
        setOpenaiValidation('error');
        setOpenaiError('Invalid API key. Please check and try again.');
      }
    } catch (error: unknown) {
      setOpenaiValidation('error');
      setOpenaiError(error instanceof Error ? error.message : 'Validation failed');
    } finally {
      setIsValidatingOpenAI(false);
    }
  };

  const handleAnthropicValidate = async () => {
    if (!anthropicKey.trim()) {
      setAnthropicError('Please enter an API key');
      return;
    }

    if (!anthropicKey.startsWith('sk-ant-')) {
      setAnthropicError('Anthropic keys should start with "sk-ant-"');
      return;
    }

    setIsValidatingAnthropic(true);
    setAnthropicValidation(null);
    setAnthropicError('');

    try {
      const provider = await createProviderForValidation('anthropic', anthropicKey);
      const isValid = await provider.validateKey!(anthropicKey);

      if (isValid) {
        await saveAPIKey('anthropic', anthropicKey, Date.now());
        setAnthropicValidation('success');
        setAnthropicKey('');
        setHasAnthropicKey(true);

        if (config?.provider === 'mock') {
          await setAIProvider('anthropic');
          await loadConfig();
        }
      } else {
        setAnthropicValidation('error');
        setAnthropicError('Invalid API key. Please check and try again.');
      }
    } catch (error: unknown) {
      setAnthropicValidation('error');
      setAnthropicError(error instanceof Error ? error.message : 'Validation failed');
    } finally {
      setIsValidatingAnthropic(false);
    }
  };

  const handleProviderChange = async (provider: AIProvider) => {
    if (provider === 'openai' && !hasOpenAIKey) {
      alert('Please add and validate an OpenAI API key first');
      return;
    }

    if (provider === 'anthropic' && !hasAnthropicKey) {
      alert('Please add and validate an Anthropic API key first');
      return;
    }

    await setAIProvider(provider);
    await loadConfig();
  };

  const handleRemoveOpenAI = async () => {
    if (confirm('Remove OpenAI API key? This will switch to Mock AI mode.')) {
      await clearAPIKey('openai');
      setHasOpenAIKey(false);
      setOpenaiValidation(null);
      await loadConfig();
    }
  };

  const handleRemoveAnthropic = async () => {
    if (confirm('Remove Anthropic API key? This will switch to Mock AI mode.')) {
      await clearAPIKey('anthropic');
      setHasAnthropicKey(false);
      setAnthropicValidation(null);
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
            <input
              type="radio"
              name="provider"
              checked={config.provider === 'mock'}
              onChange={() => handleProviderChange('mock')}
              style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)' }}>Mock AI (Free)</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Template-based suggestions with placeholders
              </div>
            </div>
            <span className="badge badge-free">Free</span>
          </label>

          {/* OpenAI */}
          <label className={`radio-card ${config.provider === 'openai' ? 'selected' : ''}`} style={{ opacity: hasOpenAIKey ? 1 : 0.7 }}>
            <input
              type="radio"
              name="provider"
              checked={config.provider === 'openai'}
              onChange={() => handleProviderChange('openai')}
              disabled={!hasOpenAIKey}
              style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)' }}>OpenAI GPT-4o</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {hasOpenAIKey ? 'API key configured' : 'Requires API key (add below)'}
                {hasOpenAIKey && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth={3}
                    style={{ display: 'inline-block', marginLeft: '4px', verticalAlign: '-2px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </div>
            </div>
            <span className="badge badge-paid">Paid</span>
          </label>

          {/* Anthropic */}
          <label className={`radio-card ${config.provider === 'anthropic' ? 'selected' : ''}`} style={{ opacity: hasAnthropicKey ? 1 : 0.7 }}>
            <input
              type="radio"
              name="provider"
              checked={config.provider === 'anthropic'}
              onChange={() => handleProviderChange('anthropic')}
              disabled={!hasAnthropicKey}
              style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)' }}>Anthropic Claude</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {hasAnthropicKey ? 'API key configured' : 'Requires API key (add below)'}
                {hasAnthropicKey && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth={3}
                    style={{ display: 'inline-block', marginLeft: '4px', verticalAlign: '-2px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </div>
            </div>
            <span className="badge badge-premium">Paid</span>
          </label>
        </div>
      </div>

      {/* ── OpenAI API Key ───────────────────────────────────── */}
      <div className="content-card animate-in">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div className="section-header" style={{ marginBottom: 0 }}>
            <h3>OpenAI API Key</h3>
          </div>
          {hasOpenAIKey && (
            <button onClick={handleRemoveOpenAI} className="btn-danger" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>
              Remove Key
            </button>
          )}
        </div>

        {hasOpenAIKey ? (
          <div className="info-box info-box-green">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p style={{ fontWeight: 600, margin: '0 0 0.25rem 0' }}>OpenAI API key configured and validated</p>
              <p style={{ fontSize: '0.75rem', margin: 0, opacity: 0.8 }}>
                Validated: {new Date(config.openaiValidatedAt!).toLocaleString()}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => {
                  setOpenaiKey(e.target.value);
                  setOpenaiValidation(null);
                  setOpenaiError('');
                }}
                placeholder="sk-..."
                className="form-input"
              />

              <button
                onClick={handleOpenAIValidate}
                disabled={isValidatingOpenAI || !openaiKey.trim()}
                className="btn-primary"
              >
                {isValidatingOpenAI ? 'Validating...' : 'Validate & Save'}
              </button>
            </div>

            {openaiValidation === 'error' && (
              <div className="info-box info-box-red" style={{ marginTop: '0.75rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <div>
                  <p style={{ fontWeight: 600, margin: 0 }}>{openaiError}</p>
                  <p style={{ fontSize: '0.75rem', margin: '0.25rem 0 0 0', opacity: 0.8 }}>
                    Check your key at{' '}
                    <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer"
                      style={{ textDecoration: 'underline' }}>platform.openai.com</a>
                  </p>
                </div>
              </div>
            )}

            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
              Get your API key from{' '}
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer"
                style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                OpenAI Platform
              </a>
            </p>
          </>
        )}
      </div>

      {/* ── Anthropic API Key ────────────────────────────────── */}
      <div className="content-card animate-in">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div className="section-header" style={{ marginBottom: 0 }}>
            <h3>Anthropic API Key</h3>
          </div>
          {hasAnthropicKey && (
            <button onClick={handleRemoveAnthropic} className="btn-danger" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>
              Remove Key
            </button>
          )}
        </div>

        {hasAnthropicKey ? (
          <div className="info-box info-box-green">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p style={{ fontWeight: 600, margin: '0 0 0.25rem 0' }}>Anthropic API key configured and validated</p>
              <p style={{ fontSize: '0.75rem', margin: 0, opacity: 0.8 }}>
                Validated: {new Date(config.anthropicValidatedAt!).toLocaleString()}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input
                type="password"
                value={anthropicKey}
                onChange={(e) => {
                  setAnthropicKey(e.target.value);
                  setAnthropicValidation(null);
                  setAnthropicError('');
                }}
                placeholder="sk-ant-..."
                className="form-input"
              />

              <button
                onClick={handleAnthropicValidate}
                disabled={isValidatingAnthropic || !anthropicKey.trim()}
                className="btn-primary"
                style={{ background: '#7C3AED' }}
              >
                {isValidatingAnthropic ? 'Validating...' : 'Validate & Save'}
              </button>
            </div>

            {anthropicValidation === 'error' && (
              <div className="info-box info-box-red" style={{ marginTop: '0.75rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <div>
                  <p style={{ fontWeight: 600, margin: 0 }}>{anthropicError}</p>
                  <p style={{ fontSize: '0.75rem', margin: '0.25rem 0 0 0', opacity: 0.8 }}>
                    Check your key at{' '}
                    <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer"
                      style={{ textDecoration: 'underline' }}>console.anthropic.com</a>
                  </p>
                </div>
              </div>
            )}

            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
              Get your API key from{' '}
              <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer"
                style={{ color: '#7C3AED', textDecoration: 'none', fontWeight: 600 }}>
                Anthropic Console
              </a>
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
          <strong>Privacy & Security</strong>
          Your API keys are stored locally in your browser only. They are never sent to any
          server except directly to OpenAI/Anthropic when generating answers. You can remove
          them at any time.
        </p>
      </div>
    </div>
  );
}

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

  // Load config on mount
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
        // Save key
        await saveAPIKey('openai', openaiKey, Date.now());
        setOpenaiValidation('success');
        setOpenaiKey(''); // Clear input
        setHasOpenAIKey(true);

        // Auto-select OpenAI if no provider selected
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
    // Check if provider has valid key
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
    return <div className="text-gray-500">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">AI Configuration</h2>
        <p className="text-sm text-gray-600">
          Configure AI providers for answer suggestions. Mock AI is free but uses templates. Add
          your API key for real AI-generated answers.
        </p>
      </div>

      {/* Provider Selection */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Active Provider</h3>

        <div className="space-y-2">
          {/* Mock AI */}
          <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              name="provider"
              value="mock"
              checked={config.provider === 'mock'}
              onChange={() => handleProviderChange('mock')}
              className="h-4 w-4 text-blue-600"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">Mock AI (Free)</div>
              <div className="text-xs text-gray-500">
                Template-based suggestions with placeholders
              </div>
            </div>
            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">Free</span>
          </label>

          {/* OpenAI */}
          <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              name="provider"
              value="openai"
              checked={config.provider === 'openai'}
              onChange={() => handleProviderChange('openai')}
              disabled={!hasOpenAIKey}
              className="h-4 w-4 text-blue-600 disabled:opacity-50"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">OpenAI GPT-4o</div>
              <div className="text-xs text-gray-500">
                {hasOpenAIKey ? 'API key configured ✓' : 'Requires API key (add below)'}
              </div>
            </div>
            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Paid</span>
          </label>

          {/* Anthropic */}
          <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              name="provider"
              value="anthropic"
              checked={config.provider === 'anthropic'}
              onChange={() => handleProviderChange('anthropic')}
              disabled={!hasAnthropicKey}
              className="h-4 w-4 text-blue-600 disabled:opacity-50"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">Anthropic Claude</div>
              <div className="text-xs text-gray-500">
                {hasAnthropicKey ? 'API key configured ✓' : 'Requires API key (add below)'}
              </div>
            </div>
            <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">Paid</span>
          </label>
        </div>
      </div>

      {/* OpenAI API Key */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900">OpenAI API Key</h3>
          {hasOpenAIKey && (
            <button
              onClick={handleRemoveOpenAI}
              className="text-xs text-red-600 hover:text-red-700"
            >
              Remove Key
            </button>
          )}
        </div>

        {hasOpenAIKey ? (
          <div className="bg-green-50 border border-green-200 rounded p-3">
            <p className="text-sm text-green-800">✓ OpenAI API key configured and validated</p>
            <p className="text-xs text-green-600 mt-1">
              Validated: {new Date(config.openaiValidatedAt!).toLocaleString()}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => {
                  setOpenaiKey(e.target.value);
                  setOpenaiValidation(null);
                  setOpenaiError('');
                }}
                placeholder="sk-..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <button
                onClick={handleOpenAIValidate}
                disabled={isValidatingOpenAI || !openaiKey.trim()}
                className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isValidatingOpenAI ? 'Validating...' : 'Validate & Save'}
              </button>
            </div>

            {openaiValidation === 'error' && (
              <div className="mt-2 bg-red-50 border border-red-200 rounded p-3">
                <p className="text-sm text-red-800">✗ {openaiError}</p>
                <p className="text-xs text-red-600 mt-1">
                  Check your key at{' '}
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    platform.openai.com
                  </a>
                </p>
              </div>
            )}

            <p className="text-xs text-gray-500 mt-2">
              Get your API key from{' '}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                OpenAI Platform
              </a>
            </p>
          </>
        )}
      </div>

      {/* Anthropic API Key */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900">Anthropic API Key</h3>
          {hasAnthropicKey && (
            <button
              onClick={handleRemoveAnthropic}
              className="text-xs text-red-600 hover:text-red-700"
            >
              Remove Key
            </button>
          )}
        </div>

        {hasAnthropicKey ? (
          <div className="bg-green-50 border border-green-200 rounded p-3">
            <p className="text-sm text-green-800">✓ Anthropic API key configured and validated</p>
            <p className="text-xs text-green-600 mt-1">
              Validated: {new Date(config.anthropicValidatedAt!).toLocaleString()}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <input
                type="password"
                value={anthropicKey}
                onChange={(e) => {
                  setAnthropicKey(e.target.value);
                  setAnthropicValidation(null);
                  setAnthropicError('');
                }}
                placeholder="sk-ant-..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />

              <button
                onClick={handleAnthropicValidate}
                disabled={isValidatingAnthropic || !anthropicKey.trim()}
                className="w-full px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isValidatingAnthropic ? 'Validating...' : 'Validate & Save'}
              </button>
            </div>

            {anthropicValidation === 'error' && (
              <div className="mt-2 bg-red-50 border border-red-200 rounded p-3">
                <p className="text-sm text-red-800">✗ {anthropicError}</p>
                <p className="text-xs text-red-600 mt-1">
                  Check your key at{' '}
                  <a
                    href="https://console.anthropic.com/settings/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    console.anthropic.com
                  </a>
                </p>
              </div>
            )}

            <p className="text-xs text-gray-500 mt-2">
              Get your API key from{' '}
              <a
                href="https://console.anthropic.com/settings/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Anthropic Console
              </a>
            </p>
          </>
        )}
      </div>

      {/* Privacy Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <svg
            className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Privacy & Security</p>
            <p className="text-blue-800">
              Your API keys are stored locally in your browser only. They are never sent to any
              server except directly to OpenAI/Anthropic when generating answers. You can remove
              them at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

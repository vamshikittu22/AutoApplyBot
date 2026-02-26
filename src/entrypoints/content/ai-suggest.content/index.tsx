/**
 * React Integration for AI Suggest Buttons
 * Mounts React components for each detected question field
 */

import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { SuggestAnswerButton } from '@/components/SuggestAnswerButton';
import { DraftSelector } from '@/components/DraftSelector';
import { getAIProvider, getActiveProvider } from '@/lib/ai';
import type { GenerateResult, AIProvider } from '@/types/ai';
import type { Profile } from '@/types/profile';

interface AIButtonAppProps {
  fieldElement: HTMLTextAreaElement | HTMLInputElement;
  fieldLabel: string;
  isEssay: boolean;
}

function AIButtonApp({ fieldElement, fieldLabel, isEssay }: AIButtonAppProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [activeProvider, setActiveProvider] = useState<AIProvider>('mock');
  const [profile, setProfile] = useState<Profile | null>(null);

  // Load active provider and profile
  useEffect(() => {
    Promise.all([getActiveProvider(), chrome.storage.local.get(['profile'])]).then(
      ([provider, storage]) => {
        setActiveProvider(provider);
        setProfile((storage.profile as Profile | undefined) || null);
      }
    );
  }, []);

  const handleSuggest = async () => {
    if (!profile) {
      alert('Please set up your profile first in the extension settings.');
      return;
    }

    setIsLoading(true);

    try {
      const provider = await getAIProvider();
      const generateResult = await provider.generateAnswer({
        question: fieldLabel,
        questionContext: fieldElement.placeholder,
        userProfile: profile,
        tone: 'professional', // Default tone, user can regenerate with different tone
        essayMode: isEssay,
        role: profile.rolePreference.toLowerCase() as
          | 'tech'
          | 'healthcare'
          | 'finance'
          | 'marketing'
          | 'operations'
          | 'other',
      });

      setResult(generateResult);
    } catch (error) {
      console.error('Failed to generate answer:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to generate answer: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsert = (draft: string) => {
    fieldElement.value = draft;
    fieldElement.dispatchEvent(new Event('input', { bubbles: true }));
    fieldElement.dispatchEvent(new Event('change', { bubbles: true }));
    setResult(null);
  };

  const handleRegenerate = () => {
    setResult(null);
    handleSuggest();
  };

  const handleClose = () => {
    setResult(null);
  };

  return (
    <>
      <SuggestAnswerButton
        onSuggest={handleSuggest}
        isLoading={isLoading}
        isEssay={isEssay}
        activeProvider={activeProvider}
      />

      {result && (
        <DraftSelector
          result={result}
          onInsert={handleInsert}
          onRegenerate={handleRegenerate}
          onClose={handleClose}
        />
      )}
    </>
  );
}

// Mount React app for each button
export function mountAISuggestButton(
  rootElement: HTMLElement,
  fieldElement: HTMLTextAreaElement | HTMLInputElement,
  fieldLabel: string,
  isEssay: boolean
) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <AIButtonApp fieldElement={fieldElement} fieldLabel={fieldLabel} isEssay={isEssay} />
  );
}

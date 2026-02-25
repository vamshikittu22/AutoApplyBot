import { useState } from 'react';
import type { GenerateResult } from '@/types/ai';

interface DraftSelectorProps {
  result: GenerateResult;
  onInsert: (draft: string) => void;
  onRegenerate: () => void;
  onClose: () => void;
}

export function DraftSelector({ result, onInsert, onRegenerate, onClose }: DraftSelectorProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentDraft = result.drafts[currentIndex] ?? '';
  const currentTone = result.tones[currentIndex] ?? 'professional';

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? 2 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === 2 ? 0 : prev + 1));
  };

  const handleInsert = () => {
    onInsert(currentDraft);
  };

  // Highlight placeholders in draft
  const highlightedDraft = highlightPlaceholders(currentDraft);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {result.metadata.essayMode ? 'STAR Outline' : 'Suggested Answer'}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {result.metadata.essayMode
                ? 'Use this outline to structure your answer'
                : 'Review and customize before inserting'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Close"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Draft content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-500 uppercase">
                Tone: {currentTone}
              </span>
              <span className="text-xs text-gray-400">Draft {currentIndex + 1} of 3</span>
            </div>

            <div
              className="text-gray-800 whitespace-pre-wrap leading-relaxed"
              dangerouslySetInnerHTML={{ __html: highlightedDraft }}
            />
          </div>

          {/* Provider info */}
          <div className="flex items-start gap-2 text-xs text-gray-500 bg-blue-50 border border-blue-200 rounded p-3">
            <svg
              className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="font-medium text-blue-900 mb-1">
                {result.provider === 'mock'
                  ? '⚠️ Mock AI Mode'
                  : `✓ Powered by ${result.provider === 'openai' ? 'OpenAI GPT-4o' : 'Anthropic Claude'}`}
              </p>
              <p>
                {result.provider === 'mock'
                  ? 'Template-based suggestions. Add your API key in settings for AI-generated answers.'
                  : 'Replace all [placeholders] with your specific details before submitting.'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation and actions */}
        <div className="border-t p-4 space-y-3">
          {/* Draft navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Previous
            </button>

            <span className="text-sm text-gray-500">{currentIndex + 1} / 3</span>

            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
            >
              Next
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              onClick={onRegenerate}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Regenerate New Drafts
            </button>
            <button
              onClick={handleInsert}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              Insert This Draft
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Highlight placeholders in square brackets
 */
function highlightPlaceholders(text: string): string {
  return text.replace(
    /\[([^\]]+)\]/g,
    '<span class="bg-yellow-100 text-yellow-900 font-medium px-1 rounded">[<span class="underline">$1</span>]</span>'
  );
}

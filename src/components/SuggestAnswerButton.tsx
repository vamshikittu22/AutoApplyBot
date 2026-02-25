import type { AIProvider } from '@/types/ai';

interface SuggestAnswerButtonProps {
  onSuggest: () => void;
  isLoading: boolean;
  isEssay: boolean;
  activeProvider: AIProvider;
}

export function SuggestAnswerButton({
  onSuggest,
  isLoading,
  isEssay,
  activeProvider,
}: SuggestAnswerButtonProps) {
  const providerBadge = {
    mock: { text: 'Mock AI', color: 'bg-gray-500' },
    openai: { text: 'GPT-4o', color: 'bg-green-600' },
    anthropic: { text: 'Claude', color: 'bg-purple-600' },
  }[activeProvider];

  return (
    <button
      onClick={onSuggest}
      disabled={isLoading}
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm transition-colors"
      title={isEssay ? 'Generate STAR outline' : 'Generate answer suggestions'}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Generating...
        </>
      ) : (
        <>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          {isEssay ? 'Suggest Outline' : 'Suggest Answer'}
        </>
      )}

      {/* Provider badge */}
      <span className={`text-xs px-1.5 py-0.5 rounded ${providerBadge.color}`}>
        {providerBadge.text}
      </span>
    </button>
  );
}

import { useState, useEffect } from 'react';
import { AutofillEngine } from '@/lib/autofill/engine';
import { decorateField, clearAllDecorations, clearDecoration } from '@/lib/ui/field-decorator';
import type { Profile } from '@/types/profile';
import type { ATSType } from '@/types/ats';

export interface AutofillButtonProps {
  profile: Profile;
  atsType: ATSType;
  formContainer: HTMLElement;
}

type ButtonState = 'idle' | 'loading' | 'filling' | 'success' | 'error';

export function AutofillButton({ profile, atsType, formContainer }: AutofillButtonProps) {
  const [state, setState] = useState<ButtonState>('idle');
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [filledCount, setFilledCount] = useState(0);
  const [engine] = useState(() => new AutofillEngine());

  useEffect(() => {
    engine.setProfile(profile);
    engine.setATSType(atsType);
  }, [profile, atsType, engine]);

  const handleAutofill = async () => {
    setState('filling');
    clearAllDecorations();

    try {
      const result = await engine.autofill({
        container: formContainer,
        onProgress: (current, total) => {
          setProgress({ current, total });
        },
        onFieldFilled: (mapping) => {
          // Decorate filled field
          decorateField(mapping, () => {
            engine.undoField(mapping.field.element);
            clearDecoration(mapping.field.element);
          });
        },
      });

      setFilledCount(result.filledCount);
      setState('success');

      // Auto-hide success state after 3 seconds
      setTimeout(() => {
        if (result.filledCount > 0) {
          setState('idle');
        }
      }, 3000);
    } catch (error) {
      console.error('[AutofillButton] Error:', error);
      setState('error');

      setTimeout(() => {
        setState('idle');
      }, 3000);
    }
  };

  const handleUndoAll = () => {
    const count = engine.undoAll();
    clearAllDecorations();
    setFilledCount(0);
    setState('idle');
    console.log(`[AutofillButton] Undone ${count} fields`);
  };

  const getButtonText = () => {
    switch (state) {
      case 'loading':
        return 'Loading...';
      case 'filling':
        return `Filling ${progress.current}/${progress.total}...`;
      case 'success':
        return `✓ Filled ${filledCount} fields`;
      case 'error':
        return '✗ Error occurred';
      default:
        return 'Autofill Profile';
    }
  };

  const getButtonClass = () => {
    const baseClass = `
      px-4 py-2 rounded-lg font-semibold text-sm
      transition-all duration-200
      flex items-center gap-2
      shadow-lg hover:shadow-xl
    `;

    switch (state) {
      case 'success':
        return `${baseClass} bg-green-600 text-white`;
      case 'error':
        return `${baseClass} bg-red-600 text-white`;
      case 'filling':
        return `${baseClass} bg-blue-500 text-white cursor-wait`;
      default:
        return `${baseClass} bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer`;
    }
  };

  const canUndo = engine.getUndoCount() > 0;

  return (
    <div className="flex flex-col gap-2 items-start">
      <div className="flex gap-2">
        <button
          onClick={handleAutofill}
          disabled={state === 'filling'}
          className={getButtonClass()}
        >
          {state === 'filling' && (
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
          )}
          <span>{getButtonText()}</span>
        </button>

        {canUndo && state !== 'filling' && (
          <button
            onClick={handleUndoAll}
            className="px-4 py-2 rounded-lg font-semibold text-sm bg-gray-600 text-white hover:bg-gray-700 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Undo All ({engine.getUndoCount()})
          </button>
        )}
      </div>

      {state === 'success' && (
        <div className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded border border-green-200">
          ✓ Review the highlighted fields and edit as needed
        </div>
      )}

      {state === 'error' && (
        <div className="text-sm text-red-700 bg-red-50 px-3 py-2 rounded border border-red-200">
          ✗ Some fields could not be filled. Try manual mode.
        </div>
      )}
    </div>
  );
}

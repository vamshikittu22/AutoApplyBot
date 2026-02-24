export interface FieldIndicatorProps {
  /** Confidence level (0-100) */
  confidence: number;
  /** Is field filled? */
  filled: boolean;
  /** Show numeric confidence? */
  showConfidence?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Visual indicator for field confidence and fill status
 * Green = high confidence, filled
 * Yellow = medium confidence
 * Red = low confidence
 * Gray = not filled
 */
export function FieldIndicator({
  confidence,
  filled,
  showConfidence = false,
  size = 'md',
}: FieldIndicatorProps) {
  const getColor = () => {
    if (!filled) return 'gray';
    if (confidence >= 80) return 'green';
    if (confidence >= 70) return 'yellow';
    return 'red';
  };

  const getIcon = () => {
    if (!filled) return '○';
    if (confidence >= 80) return '✓';
    if (confidence >= 70) return '!';
    return '?';
  };

  const color = getColor();
  const icon = getIcon();

  const sizeClasses = {
    sm: 'w-4 h-4 text-xs',
    md: 'w-6 h-6 text-sm',
    lg: 'w-8 h-8 text-base',
  };

  const colorClasses = {
    green: 'bg-green-100 text-green-700 border-green-300',
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    red: 'bg-red-100 text-red-700 border-red-300',
    gray: 'bg-gray-100 text-gray-500 border-gray-300',
  };

  return (
    <div
      className={`
        inline-flex items-center justify-center
        rounded-full border
        font-semibold
        ${sizeClasses[size]}
        ${colorClasses[color]}
      `}
      title={`Confidence: ${confidence}%`}
    >
      {showConfidence ? confidence : icon}
    </div>
  );
}

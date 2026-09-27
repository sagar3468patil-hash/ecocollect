/**
 * LoadingState — inline spinner + optional label.
 * Uses the `spin` keyframe defined in index.css.
 *
 * @param {string} [text]   Label shown next to spinner
 * @param {'sm'|'md'|'lg'} [size]
 */
const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-[3px]',
}

export default function LoadingState({ text, size = 'md' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-10">
      <span
        className={[
          sizes[size],
          'rounded-full',
          'border-sage-line border-t-forest',
          'animate-spin',
        ].join(' ')}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <span className="text-sm text-ink/60 font-sans">{text}</span>
      )}
    </div>
  )
}

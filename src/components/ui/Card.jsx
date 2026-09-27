/**
 * Card — primary container surface.
 * Corner radius: 12px (--radius-lg), matching container hierarchy rule.
 *
 * @param {string}  [title]     Optional section heading rendered inside card
 * @param {string}  [className] Extra Tailwind classes
 * @param {'white'|'sage'} [surface] Background surface variant
 */
export default function Card({
  title,
  children,
  className = '',
  surface = 'white',
  ...props
}) {
  const surfaceClass = surface === 'sage' ? 'bg-sage' : 'bg-white'

  return (
    <div
      className={[
        surfaceClass,
        'rounded-lg border border-sage-line',
        'p-5',
        className,
      ].join(' ')}
      {...props}
    >
      {title && (
        <h3 className="font-sans font-medium text-ink text-base mb-4 pb-3 border-b border-sage-line">
          {title}
        </h3>
      )}
      {children}
    </div>
  )
}

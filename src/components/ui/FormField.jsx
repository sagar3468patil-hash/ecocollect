/**
 * FormField — label + control + error message.
 *
 * @param {'text'|'email'|'number'|'select'|'textarea'} [type]
 * @param {string[]} [options]  Options for type="select"
 * @param {number}   [rows]     Row count for type="textarea"
 * @param {string}   [error]    Error message text
 * @param {string}   [hint]     Hint text below the field
 */
export default function FormField({
  label,
  id,
  type = 'text',
  error,
  hint,
  options = [],
  rows = 4,
  className = '',
  required,
  ...props
}) {
  const base = [
    'w-full px-3 py-2 rounded-md',
    'text-sm font-sans text-ink',
    'border transition-colors duration-150',
    'placeholder:text-ink/40',
    'focus:outline-none focus:ring-1',
    error
      ? 'border-clay bg-clay-bg/20 focus:border-clay focus:ring-clay/30'
      : 'border-sage-line bg-white focus:border-forest focus:ring-forest/30',
  ].join(' ')

  return (
    <div className={['flex flex-col gap-1', className].join(' ')}>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {required && <span className="text-clay ml-0.5">*</span>}
      </label>

      {type === 'select' ? (
        <select id={id} className={base} {...props}>
          <option value="">Select an option</option>
          {options.map((opt) =>
            typeof opt === 'object' ? (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ) : (
              <option key={opt} value={opt}>{opt}</option>
            )
          )}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          id={id}
          rows={rows}
          className={[base, 'resize-none'].join(' ')}
          {...props}
        />
      ) : (
        <input id={id} type={type} className={base} {...props} />
      )}

      {error && (
        <p className="text-xs text-clay">{error}</p>
      )}
      {hint && !error && (
        <p className="text-xs text-ink/50">{hint}</p>
      )}
    </div>
  )
}

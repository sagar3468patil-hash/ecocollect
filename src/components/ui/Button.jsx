import { forwardRef } from 'react'

const variants = {
  primary:
    'bg-forest text-white hover:bg-forest-dark active:bg-forest-dark ' +
    'disabled:opacity-50',
  secondary:
    'border border-forest text-forest bg-transparent hover:bg-sage ' +
    'active:bg-sage-line disabled:opacity-50',
  ghost:
    'text-forest border border-transparent hover:bg-sage ' +
    'active:bg-sage-line disabled:opacity-50',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2   text-sm gap-2',
  lg: 'px-5 py-2.5 text-base gap-2',
}

/**
 * @param {'primary'|'secondary'|'ghost'} variant
 * @param {'sm'|'md'|'lg'} size
 */
const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', className = '', children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={[
        'inline-flex items-center justify-center',
        'font-sans font-medium rounded-md',
        'transition-colors duration-150',
        'cursor-pointer select-none',
        'disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  )
})

export default Button

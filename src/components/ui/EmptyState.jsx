/**
 * EmptyState — shown when a list or section has no content.
 *
 * @param {React.ComponentType} [icon]    Lucide icon component
 * @param {string}  title
 * @param {string}  [description]
 * @param {React.ReactNode} [action]       Optional button/link
 */
export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {Icon && (
        <div className="w-12 h-12 rounded-lg bg-sage flex items-center justify-center mb-4">
          <Icon size={22} className="text-forest" />
        </div>
      )}
      <p className="font-sans font-medium text-ink text-base mb-1">{title}</p>
      {description && (
        <p className="font-sans text-sm text-ink/60 max-w-sm mb-5">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
}

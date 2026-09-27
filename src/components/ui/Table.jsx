import EmptyState from './EmptyState'
import { FileX } from 'lucide-react'

/**
 * Responsive table.
 * ≥640px — standard <table>.
 * <640px  — each row becomes a stacked key/value card (no horizontal scroll).
 *
 * @param {{ key: string, label: string, render?: (value, row) => React.ReactNode }[]} columns
 * @param {object[]} data
 * @param {string}   [emptyMessage]
 */
export default function Table({
  columns = [],
  data = [],
  emptyMessage = 'No records found.',
}) {
  if (!data.length) {
    return (
      <EmptyState
        icon={FileX}
        title="Nothing here yet"
        description={emptyMessage}
      />
    )
  }

  const cell = (col, row) =>
    col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')

  return (
    <>
      {/* ── Desktop table (sm+) ────────────────────────────── */}
      <div className="hidden sm:block overflow-hidden rounded-lg border border-sage-line">
        <table className="w-full text-sm font-sans">
          <thead>
            <tr className="bg-sage border-b border-sage-line">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-medium text-ink/70 tracking-normal"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-sage-line">
            {data.map((row, i) => (
              <tr
                key={row.id ?? i}
                className="hover:bg-paper transition-colors duration-100"
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 text-ink">
                    {cell(col, row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Mobile stacked cards (<sm) ──────────────────────── */}
      <div className="sm:hidden flex flex-col gap-2.5">
        {data.map((row, i) => (
          <div
            key={row.id ?? i}
            className="bg-white rounded-lg border border-sage-line p-4"
          >
            {columns.map((col) => (
              <div
                key={col.key}
                className="flex justify-between items-center py-1.5 border-b border-sage-line last:border-0"
              >
                <span className="text-xs text-ink/60 font-medium">{col.label}</span>
                <span className="text-sm text-ink">{cell(col, row)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  )
}

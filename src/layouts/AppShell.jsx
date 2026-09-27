import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu, Leaf } from 'lucide-react'

/**
 * SidebarContent is defined as a standalone component (not nested inside AppShell)
 * to avoid React re-creating it on every render.
 */
function SidebarContent({ navItems, onNavClick }) {
  return (
    <div className="flex flex-col h-full bg-paper border-r border-sage-line">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-[18px] border-b border-sage-line shrink-0">
        <div className="w-7 h-7 rounded-md bg-forest flex items-center justify-center shrink-0">
          <Leaf size={14} className="text-white" />
        </div>
        <span
          className="font-display font-semibold text-ink text-[17px] leading-none"
          style={{ fontFamily: "'Fraunces', Georgia, serif" }}
        >
          EcoCollect
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-0.5">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            onClick={onNavClick}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2.5 rounded-lg',
                'text-sm font-sans transition-colors duration-150',
                isActive
                  ? 'bg-sage text-forest font-medium'     // filled sage bg — not a left border
                  : 'text-ink hover:bg-sage/40',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={17}
                  className={isActive ? 'text-forest' : 'text-ink/50'}
                  strokeWidth={isActive ? 2 : 1.75}
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

/**
 * AppShell — left-hand sidebar layout.
 *
 * Desktop (md+): fixed 240px sidebar + scrollable main content.
 * Mobile       : sidebar hidden; hamburger button reveals slide-over overlay.
 *
 * @param {{ path: string, label: string, icon: React.ComponentType }[]} navItems
 * @param {React.ReactNode} children
 * @param {React.ReactNode} [headerRight]  Slot for right-side header content (role badge etc.)
 */
export default function AppShell({ navItems = [], children, headerRight }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-paper">

      {/* ── Desktop sidebar (md+) ─────────────────────────── */}
      <aside className="hidden md:block w-60 shrink-0 fixed inset-y-0 left-0 z-30">
        <SidebarContent navItems={navItems} />
      </aside>

      {/* ── Mobile sidebar overlay (<md) ──────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Scrim */}
          <div
            className="absolute inset-0 bg-ink/30 backdrop-blur-[1px]"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <aside className="absolute left-0 top-0 bottom-0 w-60 z-50">
            <SidebarContent
              navItems={navItems}
              onNavClick={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* ── Main area ─────────────────────────────────────── */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">

        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-20 flex items-center justify-between
          gap-3 px-4 py-3 bg-paper border-b border-sage-line">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-md hover:bg-sage transition-colors"
            aria-label="Open menu"
          >
            <Menu size={19} className="text-ink" />
          </button>
          <span
            className="font-display font-semibold text-ink text-base"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            EcoCollect
          </span>
          <div>{headerRight ?? <span />}</div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

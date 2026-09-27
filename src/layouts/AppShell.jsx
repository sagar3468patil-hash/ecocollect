import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Menu, Leaf, LogOut, User, ShieldCheck } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

/**
 * SidebarContent is defined as a standalone component to avoid React re-creating it on every render.
 */
function SidebarContent({ navItems, onNavClick }) {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const role = profile?.role || 'citizen'
  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User'

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
                  ? 'bg-sage text-forest font-medium'
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

      {/* User profile & Sign out */}
      <div className="p-3 border-t border-sage-line bg-paper/60 shrink-0">
        {user ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-sage flex items-center justify-center shrink-0 text-forest text-xs font-semibold">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-ink truncate">{displayName}</p>
                  <span
                    className={[
                      'inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.2 rounded font-medium',
                      role === 'admin'
                        ? 'bg-forest text-white'
                        : 'bg-sage text-forest',
                    ].join(' ')}
                  >
                    {role === 'admin' ? <ShieldCheck size={9} /> : <User size={9} />}
                    {role.toUpperCase()}
                  </span>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                title="Sign out"
                className="p-1.5 text-ink/50 hover:text-clay hover:bg-clay/10 rounded transition-colors"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        ) : (
          <NavLink
            to="/login"
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-forest text-white text-xs font-medium hover:bg-forest-dark transition-colors"
          >
            Sign in
          </NavLink>
        )}
      </div>
    </div>
  )
}

/**
 * AppShell — left-hand sidebar layout.
 */
export default function AppShell({ navItems = [], children, headerRight }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const role = profile?.role || 'citizen'

  return (
    <div className="flex min-h-screen bg-paper">
      {/* Desktop sidebar (md+) */}
      <aside className="hidden md:block w-60 shrink-0 fixed inset-y-0 left-0 z-30">
        <SidebarContent navItems={navItems} />
      </aside>

      {/* Mobile sidebar overlay (<md) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-ink/30 backdrop-blur-[1px]"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-60 z-50">
            <SidebarContent
              navItems={navItems}
              onNavClick={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">
        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-20 flex items-center justify-between gap-3 px-4 py-3 bg-paper border-b border-sage-line">
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
          <div className="flex items-center gap-2">
            {headerRight ?? (
              user && (
                <button
                  onClick={handleSignOut}
                  title="Sign out"
                  className="p-1 text-ink/60 hover:text-clay"
                >
                  <LogOut size={16} />
                </button>
              )
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}

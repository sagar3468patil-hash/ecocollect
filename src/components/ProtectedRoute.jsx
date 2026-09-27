import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import LoadingState from './ui/LoadingState'
import { useToast } from './ui/Toast'
import { useEffect } from 'react'

/**
 * ProtectedRoute — Guards routes based on Supabase session and user role.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children
 * @param {boolean} [props.adminOnly=false]  Requires profile.role === 'admin'
 */
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()
  const { toast } = useToast()

  const isCitizen = profile?.role === 'citizen'
  const isAdmin = profile?.role === 'admin'

  useEffect(() => {
    if (!loading && user && adminOnly && !isAdmin) {
      toast({
        message: 'Access restricted: Admin privileges required.',
        type: 'warning',
      })
    }
  }, [loading, user, adminOnly, isAdmin, toast])

  // Show design system LoadingState while session or profile resolves
  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <LoadingState text="Authenticating session…" />
      </div>
    )
  }

  // Not logged in -> Redirect to /login with state for return redirect
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Citizen attempting to access an admin-only route -> Redirect to citizen dashboard
  if (adminOnly && !isAdmin) {
    return <Navigate to="/citizen/dashboard" replace />
  }

  return children
}

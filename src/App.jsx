import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './components/ui/Toast'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import LandingPage          from './pages/LandingPage'
import LoginPage            from './pages/LoginPage'
import CitizenDashboardPage from './pages/citizen/DashboardPage'
import NewRequestPage       from './pages/citizen/NewRequestPage'
import MyRequestsPage       from './pages/citizen/MyRequestsPage'
import CitizenRequestDetail from './pages/citizen/RequestDetailPage'
import AdminDashboardPage   from './pages/admin/DashboardPage'
import AdminRequestsPage    from './pages/admin/RequestsPage'
import AdminRequestDetail   from './pages/admin/RequestDetailPage'
import DesignSystemPage     from './pages/DesignSystemPage'

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/"                           element={<LandingPage />} />
            <Route path="/login"                      element={<LoginPage />} />
            <Route path="/design"                     element={<DesignSystemPage />} />

            {/* Citizen Protected Routes */}
            <Route
              path="/citizen/dashboard"
              element={
                <ProtectedRoute>
                  <CitizenDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/citizen/new"
              element={
                <ProtectedRoute>
                  <NewRequestPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/citizen/requests"
              element={
                <ProtectedRoute>
                  <MyRequestsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/citizen/requests/:id"
              element={
                <ProtectedRoute>
                  <CitizenRequestDetail />
                </ProtectedRoute>
              }
            />

            {/* Admin Protected Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute adminOnly>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/requests"
              element={
                <ProtectedRoute adminOnly>
                  <AdminRequestsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/requests/:id"
              element={
                <ProtectedRoute adminOnly>
                  <AdminRequestDetail />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App

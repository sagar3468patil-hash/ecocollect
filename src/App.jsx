import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './components/ui/Toast'
import { RoleProvider } from './contexts/RoleContext'

import LandingPage             from './pages/LandingPage'
import CitizenDashboardPage    from './pages/citizen/DashboardPage'
import NewRequestPage          from './pages/citizen/NewRequestPage'
import MyRequestsPage          from './pages/citizen/MyRequestsPage'
import CitizenRequestDetail    from './pages/citizen/RequestDetailPage'
import AdminDashboardPage      from './pages/admin/DashboardPage'
import AdminRequestsPage       from './pages/admin/RequestsPage'
import AdminRequestDetail      from './pages/admin/RequestDetailPage'
import DesignSystemPage        from './pages/DesignSystemPage'

function App() {
  return (
    <RoleProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Landing */}
            <Route path="/"                           element={<LandingPage />} />

            {/* Citizen */}
            <Route path="/citizen/dashboard"          element={<CitizenDashboardPage />} />
            <Route path="/citizen/new"                element={<NewRequestPage />} />
            <Route path="/citizen/requests"           element={<MyRequestsPage />} />
            <Route path="/citizen/requests/:id"       element={<CitizenRequestDetail />} />

            {/* Admin */}
            <Route path="/admin/dashboard"            element={<AdminDashboardPage />} />
            <Route path="/admin/requests"             element={<AdminRequestsPage />} />
            <Route path="/admin/requests/:id"         element={<AdminRequestDetail />} />

            {/* Design system test */}
            <Route path="/design"                     element={<DesignSystemPage />} />

            {/* Catch-all */}
            <Route path="*"                           element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </RoleProvider>
  )
}

export default App

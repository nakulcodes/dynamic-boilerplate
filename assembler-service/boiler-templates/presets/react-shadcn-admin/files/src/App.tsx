import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AdminLayout } from './layouts/AdminLayout'
import { Dashboard } from './pages/Dashboard'
// IMPORTS_PLACEHOLDER

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          {/* ROUTES_PLACEHOLDER */}
        </Route>
      </Routes>
    </Router>
  )
}

export default App
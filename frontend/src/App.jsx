import { Routes, Route } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import AdminDashboard from './components/AdminDashboard'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  )
}

export default App

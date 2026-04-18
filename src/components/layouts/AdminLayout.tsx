import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router'
import { AdminLogin } from '../AdminLogin'
import { DatabaseSeeder } from '../DatabaseSeeder'
import { Navbar } from '../Navbar'
import { AdminFirstPage } from '../AdminFirstPage'

export type AdminPage = 'tracking' | 'fleet' | 'analytics' | 'reports' | 'lostandfound'

export default function AdminLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('adminAuthenticated') === 'true'
  })
  const navigate = useNavigate()
  const [redirectToLogin, setRedirectToLogin] = useState(false)

  const handleLoginSuccess = () => {
    localStorage.setItem('adminAuthenticated', 'true')
    setIsAuthenticated(true)
  }

  const handleBack = () => {
    navigate('/')
  }

  const handleNavigate = (page: AdminPage) => {
    if (page === 'tracking') {
      navigate('/admin')
    } else {
      navigate(`/admin/${page}`)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated')
    setIsAuthenticated(false)
    navigate('/admin')
  }

  if (!isAuthenticated) {
    if (redirectToLogin) {
      return <AdminLogin onLoginSuccess={handleLoginSuccess} onBack={() => setRedirectToLogin(false)} />;
    }
    return <AdminFirstPage setRedirectToLogin={setRedirectToLogin} />;
  }

  return (
    <>
      <Navbar onNavigate={handleNavigate} userRole="admin" logout={handleLogout} />
      <main className="pt-16">
        <Outlet />
      </main>
      <DatabaseSeeder />
    </>
  )
}

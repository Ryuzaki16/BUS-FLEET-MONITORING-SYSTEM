import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router'
import { AdminLogin } from '../AdminLogin'
import { DatabaseSeeder } from '../DatabaseSeeder'
import { Navbar } from '../Navbar'

export type AdminPage = 'tracking' | 'fleet' | 'analytics' | 'reports' | 'lostandfound'

export default function AdminLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const navigate = useNavigate()

  const handleLoginSuccess = () => {
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
    setIsAuthenticated(false)
    navigate('/')
  }

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} onBack={handleBack} />
  }

  return (
    <>
      <Navbar onNavigate={handleNavigate} userRole="admin" />
      <main className="pt-16">
        <Outlet />
      </main>
      <DatabaseSeeder />
    </>
  )
}

import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { blink } from './lib/blink'
import { User } from './types'
import { initializeDatabase, getUserProfile, createUserProfile, createBusiness } from './lib/database'
import { initializeSampleData } from './lib/sampleData'
import Dashboard from './pages/Dashboard'
import ProjectsBoard from './pages/ProjectsBoard'
import ProjectDetails from './pages/ProjectDetails'
import AdminPanel from './pages/AdminPanel'
import LoadingScreen from './components/LoadingScreen'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<any>(null)

  useEffect(() => {
    // Initialize database on app start
    initializeDatabase()
  }, [])

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged(async (state) => {
      setLoading(state.isLoading)
      
      if (state.user) {
        setUser(state.user)
        
        // Get or create user profile
        try {
          let profile = await getUserProfile(state.user.id)
          
          if (!profile) {
            // First time user - create default business and profile
            const businessId = await createBusiness('Default Organization', 'Default business for new users')
            await createUserProfile(
              state.user.id,
              businessId,
              'admin', // First user becomes admin
              state.user.displayName || state.user.email || 'User'
            )
            profile = await getUserProfile(state.user.id)
            
            // Initialize sample data for new users
            if (profile) {
              await initializeSampleData(state.user.id, businessId)
            }
          }
          
          setUserProfile(profile)
        } catch (error) {
          console.error('Error managing user profile:', error)
        }
      } else {
        setUser(null)
        setUserProfile(null)
      }
    })
    return unsubscribe
  }, [])

  if (loading || !userProfile) {
    return <LoadingScreen />
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Out-of-Band Project Tracker</h1>
          <p className="text-gray-600 mb-8">Please sign in to continue</p>
          <button
            onClick={() => blink.auth.login()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  // Create user object with profile data
  const userWithDefaults = {
    ...user,
    id: user.id,
    email: user.email,
    name: userProfile.name || user.displayName || user.email || 'User',
    role: userProfile.role as 'admin' | 'manager' | 'staff',
    businessId: userProfile.business_id,
    avatarUrl: user.avatarUrl,
    createdAt: userProfile.created_at,
    updatedAt: userProfile.updated_at
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard user={userWithDefaults} />} />
          <Route path="/projects" element={<ProjectsBoard user={userWithDefaults} />} />
          <Route path="/projects/:id" element={<ProjectDetails user={userWithDefaults} />} />
          {userWithDefaults.role === 'admin' && (
            <Route path="/admin" element={<AdminPanel user={userWithDefaults} />} />
          )}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
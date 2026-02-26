import React, { createContext, useContext, useState, useEffect } from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import { api } from './services/ApiService'
import LicenseValidator from './components/LicenseValidator'
import Dashboard from './components/Dashboard'
import PropertyList from './components/PropertyList'
import PropertyForm from './components/PropertyForm'
import InquilinoList from './components/InquilinoList'
import InquilinoForm from './components/InquilinoForm'
import ContractManager from './components/ContractManager'
import FinanceModule from './components/FinanceModule'
import ReportsModule from './components/ReportsModule'
import ContactsModule from './components/ContactsModule'
import PropertyDetail from './components/PropertyDetail'
import InquilinoDetail from './components/InquilinoDetail'
import ContractDetail from './components/ContractDetail'
import FinanceDetail from './components/FinanceDetail'
import ContactDetail from './components/ContactDetail'
import Login from './components/Login'
import LicenseClaim from './components/LicenseClaim'
import CloudBackup from './components/CloudBackup'
import Support from './components/Support'
import AdminConsole from './components/AdminConsole'
import MaintenanceModule from './components/MaintenanceModule'
import { LanguageProvider } from './context/LanguageContext'

// ─── Theme Context ─────────────────────────────────────────────────────────
export const ThemeContext = createContext({})
export const useTheme = () => useContext(ThemeContext)

function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('easyrent-theme') === 'dark'
  })
  useEffect(() => {
    const root = document.documentElement
    dark ? root.classList.add('dark') : root.classList.remove('dark')
    localStorage.setItem('easyrent-theme', dark ? 'dark' : 'light')
  }, [dark])
  return (
    <ThemeContext.Provider value={{ dark, toggleTheme: () => setDark(d => !d) }}>
      {children}
    </ThemeContext.Provider>
  )
}

// ─── License Context ───────────────────────────────────────────────────────
export const LicenseContext = createContext({})
export const useLicense = () => useContext(LicenseContext)

function ProtectedRoute({ licensed, session, children }) {
  const isElectron = Boolean(window.easyrent)

  if (isElectron) {
    if (!licensed) return <Navigate to="/license" replace />
  } else {
    // Web: 1. Must be authenticated
    if (!session) return <Navigate to="/login" replace />
    // Web: 2. If authenticated but NOT licensed, ProtectedRoute will be bypassed by the parent logic in App.jsx rendering LicenseClaim
  }
  return children
}

// ─── Error Boundary ──────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error("App Crash:", error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-2xl">
            <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/20">
              <span className="text-3xl">⚠️</span>
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Algo salió mal</h1>
            <p className="text-slate-400 text-sm mb-6">La aplicación experimentó un error inesperado al intentar renderizar la interfaz.</p>
            <div className="text-left bg-black/30 rounded-xl p-4 mb-6 overflow-auto max-h-40">
              <code className="text-xs text-red-400 block break-all font-mono">{this.state.error?.toString() || 'Error desconocido'}</code>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all"
            >
              Reiniciar Aplicación
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const ADMIN_EMAIL = 'tech.innova.reg@gmail.com'

export default function App() {
  const [session, setSession] = useState(null)
  const [licensed, setLicensed] = useState(false)
  const [checkingLicense, setCheckingLicense] = useState(true)

  const isElectron = Boolean(window.easyrent)

  async function checkLicenseStatus(currentSession) {
    if (isElectron) {
      try {
        const status = await api.license.getStatus()
        if (status && (status.status === 'active' || status.status === 'demo')) {
          const expires = new Date(status.expires_at)
          if (expires > new Date()) setLicensed(true)
        }
      } catch (err) {
        console.error("License check failed:", err)
      }
    } else if (currentSession) {
      // Bypass for Admin
      if (currentSession.user.email === ADMIN_EMAIL) {
        setLicensed(true)
        return
      }

      try {
        const lic = await api.license.getByEmail(currentSession.user.email)
        if (lic && lic.status === 'active') {
          setLicensed(true)
        } else {
          setLicensed(false)
        }
      } catch (err) {
        console.error("Web license check failed:", err)
      }
    }
  }

  useEffect(() => {
    // Global error handler
    window.onerror = (msg, url, lineNo, columnNo, error) => {
      console.error("Global Error:", msg, error);
      return false;
    };

    if (isElectron) {
      checkLicenseStatus().then(() => setCheckingLicense(false))
    } else {
      // Web: Use Auth session
      api.auth.getSession().then(({ session: s }) => {
        setSession(s)
        checkLicenseStatus(s).then(() => setCheckingLicense(false))
      }).catch(() => {
        setCheckingLicense(false)
      })

      // Listen for changes
      const unsubscribe = api.auth.onAuthStateChange((_event, s) => {
        setSession(s)
        checkLicenseStatus(s)
      })
      return () => unsubscribe()
    }
  }, [])

  if (checkingLicense) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-300 text-sm">Cargando EasyRent...</p>
        </div>
      </div>
    )
  }

  // Web Flow: If logged in but NOT licensed, show claim screen
  if (!isElectron && session && !licensed) {
    return <LicenseClaim userEmail={session.user.email} onClaimed={() => checkLicenseStatus(session)} />
  }

  return (
    <ErrorBoundary>
      <LanguageProvider>
        <ThemeProvider>
          <LicenseContext.Provider value={{ licensed, setLicensed }}>
            <Router>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/license" element={<LicenseValidator />} />
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute licensed={licensed} session={session}>
                      <Layout>
                        <Routes>
                          <Route index element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
                          <Route path="propiedades" element={<ErrorBoundary><PropertyList /></ErrorBoundary>} />
                          <Route path="propiedades/nueva" element={<ErrorBoundary><PropertyForm /></ErrorBoundary>} />
                          <Route path="propiedades/:id" element={<ErrorBoundary><PropertyDetail /></ErrorBoundary>} />
                          <Route path="propiedades/:id/editar" element={<ErrorBoundary><PropertyForm /></ErrorBoundary>} />
                          <Route path="inquilinos" element={<ErrorBoundary><InquilinoList /></ErrorBoundary>} />
                          <Route path="inquilinos/nuevo" element={<ErrorBoundary><InquilinoForm /></ErrorBoundary>} />
                          <Route path="inquilinos/:id" element={<ErrorBoundary><InquilinoDetail /></ErrorBoundary>} />
                          <Route path="inquilinos/:id/editar" element={<ErrorBoundary><InquilinoForm /></ErrorBoundary>} />
                          <Route path="contratos" element={<ErrorBoundary><ContractManager /></ErrorBoundary>} />
                          <Route path="contratos/:id" element={<ErrorBoundary><ContractDetail /></ErrorBoundary>} />
                          <Route path="finanzas" element={<ErrorBoundary><FinanceModule /></ErrorBoundary>} />
                          <Route path="finanzas/:id" element={<ErrorBoundary><FinanceDetail /></ErrorBoundary>} />
                          <Route path="mantenimiento" element={<ErrorBoundary><MaintenanceModule /></ErrorBoundary>} />
                          <Route path="reportes" element={<ErrorBoundary><ReportsModule /></ErrorBoundary>} />
                          <Route path="contactos" element={<ErrorBoundary><ContactsModule /></ErrorBoundary>} />
                          <Route path="contactos/:id" element={<ErrorBoundary><ContactDetail /></ErrorBoundary>} />
                          <Route path="nube" element={<ErrorBoundary><CloudBackup /></ErrorBoundary>} />
                          <Route path="soporte" element={<ErrorBoundary><Support /></ErrorBoundary>} />
                          <Route path="admin" element={<ErrorBoundary><AdminConsole /></ErrorBoundary>} />
                          <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
          </LicenseContext.Provider>
        </ThemeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  )
}

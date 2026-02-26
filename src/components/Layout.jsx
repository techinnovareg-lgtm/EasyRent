import React, { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../App'
import { api } from '../services/ApiService'
import { useTranslation } from '../context/LanguageContext'
import {
    LayoutDashboard, Building2, Users, FileText, Wallet,
    BarChart3, Sun, Moon, ChevronLeft, ChevronRight, X, Minus, Maximize2, LogOut,
    Cloud, RefreshCw, LifeBuoy, ShieldCheck, Languages, Wrench, Menu, Loader2
} from 'lucide-react'

const NAV_ITEMS = [
    { to: '/', icon: LayoutDashboard, key: 'dashboard' },
    { to: '/propiedades', icon: Building2, key: 'properties' },
    { to: '/inquilinos', icon: Users, key: 'tenants' },
    { to: '/contratos', icon: FileText, key: 'contracts' },
    { to: '/finanzas', icon: Wallet, key: 'finances' },
    { to: '/mantenimiento', icon: Wrench, key: 'maintenance' },
    { to: '/reportes', icon: BarChart3, key: 'reports' },
    { to: '/contactos', icon: Users, key: 'contacts' },
    { to: '/nube', icon: Cloud, key: 'cloud' },
    { to: '/soporte', icon: LifeBuoy, key: 'support' },
]

const isElectron = Boolean(window.easyrent)

function TitleBar() {
    return (
        <div className="drag-region h-8 flex items-center justify-between px-3 bg-slate-900 text-slate-400 text-xs select-none shrink-0 hidden md:flex">
            <span className="font-semibold text-white/70">EasyRent</span>
            <div className="no-drag flex items-center gap-1">
                <button onClick={() => isElectron && window.easyrent.window.minimize()} className="hover:bg-slate-700 rounded p-1 transition"><Minus size={12} /></button>
                <button onClick={() => isElectron && window.easyrent.window.maximize()} className="hover:bg-slate-700 rounded p-1 transition"><Maximize2 size={12} /></button>
                <button onClick={() => isElectron && window.easyrent.window.close()} className="hover:bg-red-600 hover:text-white rounded p-1 transition"><X size={12} /></button>
            </div>
        </div>
    )
}

function ExitModal({ isOpen, onConfirm, onCancel }) {
    const { t } = useTranslation();
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onCancel}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-slate-700 overflow-hidden"
                    >
                        <div className="p-8 text-center space-y-6">
                            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-3xl flex items-center justify-center mx-auto text-red-500 shadow-inner">
                                <LogOut size={40} strokeWidth={1.5} />
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                                    {t('sidebar.exit')}?
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed px-4">
                                    {t('sidebar.exitReminder')}
                                </p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={onCancel}
                                    className="flex-1 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 font-bold text-sm transition-all active:scale-95"
                                >
                                    {t('common.back')}
                                </button>
                                <button
                                    onClick={async () => {
                                        if (isElectron) {
                                            await api.license.autoBackup();
                                            window.easyrent.window.close();
                                        } else {
                                            await api.auth.signOut();
                                            window.location.href = '#/login';
                                        }
                                    }}
                                    className="flex-1 py-4 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm shadow-lg shadow-red-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    {t('sidebar.exit')}
                                </button>
                            </div>
                        </div>

                        <div className="h-1.5 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 opacity-50" />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

function SyncStatus() {
    const [online, setOnline] = useState(navigator.onLine)
    const [syncing, setSyncing] = useState(false)
    const { t } = useTranslation()

    useEffect(() => {
        const handleOnline = () => setOnline(true)
        const handleOffline = () => setOnline(false)
        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)
        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    return (
        <div className="px-3 py-2 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${online ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`} />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {online ? 'Cloud Online' : 'Cloud Offline'}
            </span>
            {syncing && <Loader2 size={10} className="animate-spin text-blue-500 ml-auto" />}
        </div>
    )
}

export default function Layout({ children }) {
    const { dark, toggleTheme } = useTheme()
    const { t, language, toggleLanguage } = useTranslation()
    const [collapsed, setCollapsed] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [showExitModal, setShowExitModal] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)
    const location = useLocation()

    useEffect(() => {
        if (!isElectron) {
            api.auth.getSession().then(({ session }) => {
                setIsAdmin(session?.user?.email === 'tech.innova.reg@gmail.com')
            })
        }
    }, [])

    // Close mobile menu when navigating
    useEffect(() => {
        setMobileMenuOpen(false)
    }, [location.pathname])

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            {isElectron && <TitleBar />}

            {/* Mobile Header */}
            <header className="md:hidden flex items-center justify-between px-4 h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                        <Building2 size={16} className="text-white" />
                    </div>
                    <span className="font-bold text-slate-800 dark:text-white">EasyRent</span>
                </div>
                <button
                    onClick={() => setMobileMenuOpen(true)}
                    className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                    <Menu size={24} />
                </button>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                {/* Sidebar Overlay for Mobile */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileMenuOpen(false)}
                            className="md:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm"
                        />
                    )}
                </AnimatePresence>

                <motion.aside
                    initial={false}
                    animate={{
                        width: collapsed ? 64 : 220,
                        x: mobileMenuOpen ? 0 : (window.innerWidth < 768 ? -220 : 0)
                    }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className={`
                        fixed md:relative z-50 md:z-0
                        flex flex-col h-full bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 shrink-0 overflow-hidden
                    `}
                >
                    <div className={`flex items-center gap-3 p-4 ${collapsed ? 'justify-center' : ''} hidden md:flex`}>
                        <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
                            <Building2 size={16} className="text-white" />
                        </div>
                        <AnimatePresence>
                            {!collapsed && (
                                <motion.span
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="font-bold text-slate-800 dark:text-white whitespace-nowrap"
                                >
                                    EasyRent
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Mobile Menu Close Button */}
                    <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-700">
                        <span className="font-bold text-slate-800 dark:text-white font-mono tracking-tighter italic">EasyRent</span>
                        <button onClick={() => setMobileMenuOpen(false)}>
                            <X size={20} className="text-slate-400 hover:text-red-500" />
                        </button>
                    </div>

                    <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
                        {NAV_ITEMS.map(({ to, icon: Icon, key }) => (
                            <NavLink
                                key={to}
                                to={to}
                                end={to === '/'}
                                className={({ isActive }) =>
                                    `nav-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center' : ''}`
                                }
                                title={collapsed ? t(`sidebar.${key}`) : undefined}
                            >
                                <Icon size={18} className="shrink-0" />
                                <AnimatePresence>
                                    {!collapsed && (
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="whitespace-nowrap"
                                        >
                                            {t(`sidebar.${key}`)}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </NavLink>
                        ))}
                        {isAdmin && (
                            <NavLink
                                to="/admin"
                                className={({ isActive }) =>
                                    `nav-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center' : ''} text-indigo-600 dark:text-indigo-400 font-bold border-t border-slate-100 dark:border-slate-700 mt-2 pt-2`
                                }
                                title={collapsed ? t('sidebar.admin') : undefined}
                            >
                                <ShieldCheck size={18} className="shrink-0" />
                                <AnimatePresence>
                                    {!collapsed && (
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="whitespace-nowrap"
                                        >
                                            {t('sidebar.admin')}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </NavLink>
                        )}
                    </nav>

                    <div className={`p-2 space-y-1 border-t border-slate-100 dark:border-slate-700`}>
                        <button
                            onClick={toggleLanguage}
                            className={`nav-link w-full ${collapsed ? 'justify-center' : ''}`}
                            title={language === 'es' ? 'English' : 'Español'}
                        >
                            <Languages size={18} className="shrink-0" />
                            <AnimatePresence>
                                {!collapsed && (
                                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                        {language === 'es' ? 'English' : 'Español'}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </button>
                        <button
                            onClick={toggleTheme}
                            className={`nav-link w-full ${collapsed ? 'justify-center' : ''}`}
                            title={dark ? t('common.theme.light') : t('common.theme.dark')}
                        >
                            {dark ? <Sun size={18} className="shrink-0" /> : <Moon size={18} className="shrink-0" />}
                            <AnimatePresence>
                                {!collapsed && (
                                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                        {dark ? t('common.theme.light') : t('common.theme.dark')}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </button>
                        <button
                            onClick={() => setShowExitModal(true)}
                            className={`nav-link w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 ${collapsed ? 'justify-center' : ''}`}
                            title={t('sidebar.exit')}
                        >
                            <LogOut size={18} className="shrink-0" />
                            <AnimatePresence>
                                {!collapsed && (
                                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                        {t('sidebar.exit')}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </button>
                        <button
                            onClick={() => setCollapsed(c => !c)}
                            className={`nav-link w-full hidden md:flex ${collapsed ? 'justify-center' : ''}`}
                            title={collapsed ? t('sidebar.expand') : t('sidebar.collapse')}
                        >
                            {collapsed
                                ? <ChevronRight size={18} className="shrink-0" />
                                : <ChevronLeft size={18} className="shrink-0" />
                            }
                            <AnimatePresence>
                                {!collapsed && (
                                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                        {t('sidebar.collapse')}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </button>
                    </div>

                    {!collapsed && <SyncStatus />}

                    <div className={`border-t border-slate-100 dark:border-slate-700 px-3 py-2.5 flex items-center gap-2.5 ${collapsed ? 'justify-center' : ''}`}>
                        <div
                            className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-white font-bold text-xs select-none shadow-sm"
                            style={{ background: 'linear-gradient(135deg, #660530 0%, #970747 100%)' }}
                            title="Tech Innova"
                        >
                            TI
                        </div>
                        <AnimatePresence>
                            {!collapsed && (
                                <motion.div
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -8 }}
                                    className="min-w-0"
                                >
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">Tech Innova</p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5">{t('sidebar.version')}</p>
                                    <button
                                        className="text-[9px] text-blue-500 dark:text-blue-400 font-bold leading-tight mt-1 flex items-center gap-1 hover:text-blue-600 transition-colors"
                                        onClick={() => {
                                            alert(t('sidebar.updateAlert'))
                                        }}
                                    >
                                        <RefreshCw size={8} /> {t('sidebar.checkUpdates')}
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.aside>

                <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="h-full min-w-0"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>

            <ExitModal
                isOpen={showExitModal}
                onConfirm={() => isElectron && window.easyrent.window.close()}
                onCancel={() => setShowExitModal(false)}
            />
        </div>
    )
}

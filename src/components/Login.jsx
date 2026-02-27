import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Building2, Mail, Lock, Loader2, CheckCircle2, AlertCircle, MessageCircle } from 'lucide-react'
import { api } from '../services/ApiService'
import { useTranslation } from '../context/LanguageContext'
import logo from '../assets/logo.png'

export default function Login() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [form, setForm] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [isRegistering, setIsRegistering] = useState(false)

    async function handleAuth(e) {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            if (isRegistering) {
                await api.auth.signUp(form.email, form.password)
                setError(t('auth.signUpSuccess'))
                setIsRegistering(false)
            } else {
                await api.auth.signIn(form.email, form.password)
                navigate('/', { replace: true })
            }
        } catch (err) {
            console.error("Auth error:", err)
            setError(err.message || t('auth.genericError'))
        } finally {
            setLoading(false)
        }
    }

    const isSuccess = error?.includes('exitoso') || error?.includes('successful')

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <img src={logo} alt="EasyRent" className="w-24 h-24 mx-auto mb-4 object-contain shadow-xl shadow-blue-500/10 rounded-full bg-white p-3" />
                    <h1 className="text-3xl font-bold text-white tracking-tight">EasyRent</h1>
                    <p className="text-slate-400 mt-1">{isRegistering ? t('auth.signUpTitle') : t('auth.signInTitle')}</p>
                </div>

                {/* Card */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl">
                    <form onSubmit={handleAuth} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-300 ml-1">{t('auth.email')}</label>
                            <div className="relative">
                                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-800/50 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-slate-500"
                                    placeholder="usuario@ejemplo.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-300 ml-1">{t('auth.password')}</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="password"
                                    required
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-800/50 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-slate-500"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className={`${isSuccess ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'} p-4 rounded-2xl text-sm flex items-start gap-3`}
                            >
                                {isSuccess ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
                                <p>{error}</p>
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
                        >
                            {loading ? <><Loader2 size={20} className="animate-spin" /> {t('auth.processing')}</> : (isRegistering ? t('auth.signUp') : t('auth.signIn'))}
                        </button>

                        <div className="text-center mt-4 pb-4">
                            <button
                                type="button"
                                onClick={() => setIsRegistering(!isRegistering)}
                                className="text-blue-400 text-sm hover:underline"
                            >
                                {isRegistering ? t('auth.hasAccount') : t('auth.noAccount')}
                            </button>
                        </div>

                        {/* Support Section */}
                        <div className="pt-6 border-t border-white/10 text-center">
                            <p className="text-slate-400 text-[11px] mb-4 font-medium">{t('auth.supportHint')}</p>
                            <div className="flex items-center justify-center gap-4">
                                <a
                                    href={`https://wa.me/51947515529?text=${encodeURIComponent('Hola Tech Innova, necesito ayuda con el acceso a EasyRent.')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold hover:bg-emerald-500/20 transition-all active:scale-95"
                                >
                                    <MessageCircle size={14} /> WhatsApp
                                </a>
                                <a
                                    href={`mailto:tech.innova.reg@gmail.com?subject=${encodeURIComponent('Soporte Técnico EasyRent - Acceso')}&body=${encodeURIComponent('Hola, tengo inconvenientes para ingresar a EasyRent.')}`}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[11px] font-bold hover:bg-blue-500/20 transition-all active:scale-95"
                                >
                                    <Mail size={14} /> Email
                                </a>
                            </div>
                        </div>
                    </form>
                </div>

                <p className="text-center text-slate-500 text-xs mt-8">
                    &copy; 2026 Tech Innova · {t('auth.copyright')}
                </p>
            </motion.div>
        </div>
    )
}

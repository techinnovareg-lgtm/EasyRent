import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Building2, Key, Loader2, CheckCircle2, AlertCircle, Shield } from 'lucide-react'
import { api } from '../services/ApiService'
import { useLicense } from '../App'
import { useTranslation } from '../context/LanguageContext'

const DEMO_KEY = 'EASYRENT-DEMO-0000-0000-XXXX'

export default function LicenseValidator() {
    const { t } = useTranslation()
    const { setLicensed } = useLicense()
    const navigate = useNavigate()
    const [key, setKey] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)

    async function handleActivate(e) {
        e.preventDefault()
        if (!key.trim()) return
        setLoading(true)
        setResult(null)
        try {
            const res = await api.license.validate(key.trim().toUpperCase())
            setResult(res)
            if (res.valid) {
                setTimeout(() => {
                    setLicensed(true)
                    navigate('/', { replace: true })
                }, 1200)
            }
        } finally {
            setLoading(false)
        }
    }

    function useDemo() { setKey(DEMO_KEY) }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full max-w-md"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
                        <Building2 size={36} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">EasyRent</h1>
                    <p className="text-slate-400 mt-1">{t('license.validator.subtitle')}</p>
                </div>

                {/* Card */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl">
                    <div className="flex items-center gap-2 mb-6">
                        <Shield size={18} className="text-blue-400" />
                        <h2 className="text-white font-semibold">{t('license.validator.title')}</h2>
                    </div>

                    <form onSubmit={handleActivate} className="space-y-4">
                        <div>
                            <label className="block text-sm text-slate-300 mb-2">{t('license.validator.label')}</label>
                            <div className="relative">
                                <Key size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={key}
                                    onChange={e => setKey(e.target.value.toUpperCase())}
                                    placeholder={t('license.validator.placeholder')}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition font-mono text-sm"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Result message */}
                        {result && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex items-center gap-2 p-3 rounded-xl text-sm ${result.valid
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                                    }`}
                            >
                                {result.valid
                                    ? <CheckCircle2 size={16} className="shrink-0" />
                                    : <AlertCircle size={16} className="shrink-0" />
                                }
                                {result.message}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !key.trim()}
                            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <><Loader2 size={18} className="animate-spin" /> {t('license.validator.activating')}</> : t('license.validator.submit')}
                        </button>
                    </form>

                    {/* Demo */}
                    <div className="mt-6 pt-6 border-t border-white/10 text-center">
                        <p className="text-slate-400 text-xs mb-2">{t('license.validator.demoPrompt')}</p>
                        <button
                            onClick={useDemo}
                            className="text-blue-400 hover:text-blue-300 text-sm font-medium transition"
                        >
                            {t('license.validator.demoLink')}
                        </button>
                    </div>
                </div>

                <p className="text-center text-slate-600 text-[10px] uppercase font-bold tracking-tighter mt-4">
                    v1.0.0 · HRA Estadística · 2026 · {t('auth.copyright')}
                </p>
            </motion.div>
        </div>
    )
}

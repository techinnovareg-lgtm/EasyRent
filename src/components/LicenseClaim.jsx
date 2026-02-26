import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Key, ShieldCheck, AlertCircle, Loader2, LogOut } from 'lucide-react'
import { api } from '../services/ApiService'
import { useTranslation } from '../context/LanguageContext'

export default function LicenseClaim({ userEmail, onClaimed }) {
    const { t } = useTranslation()
    const [key, setKey] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    async function handleClaim(e) {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            await api.license.claim(key.toUpperCase().trim(), userEmail)
            onClaimed()
        } catch (err) {
            console.error("Claim error:", err)
            setError(err.message || t('license.claim.error'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <div className="card p-8 border-slate-800 shadow-2xl bg-slate-900 text-white text-center">
                    <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center text-indigo-500 mb-6 mx-auto">
                        <Key size={40} />
                    </div>

                    <h2 className="text-2xl font-black mb-2">{t('license.claim.title')}</h2>
                    <p className="text-slate-400 text-sm mb-8">
                        {t('license.claim.hello')} <span className="text-indigo-400 font-bold">{userEmail}</span>.
                        {t('license.claim.noLicense')}
                    </p>

                    <form onSubmit={handleClaim} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block text-left ml-1">{t('license.claim.label')}</label>
                            <input
                                type="text"
                                required
                                value={key}
                                onChange={e => setKey(e.target.value)}
                                className="input w-full text-center text-xl font-mono tracking-widest bg-slate-800 border-slate-700 text-white uppercase"
                                placeholder={t('license.claim.placeholder')}
                                autoFocus
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-xs flex items-start gap-3 text-left">
                                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                <p>{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-4 uppercase tracking-widest font-black flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                            {loading ? t('license.claim.validating') : t('license.claim.submit')}
                        </button>

                        <button
                            type="button"
                            onClick={() => api.auth.signOut().then(() => window.location.reload())}
                            className="text-slate-500 text-xs hover:text-slate-300 flex items-center gap-1 mx-auto"
                        >
                            <LogOut size={12} /> {t('license.claim.logout')}
                        </button>
                    </form>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-slate-600 text-[10px] uppercase font-bold tracking-tighter">
                        {t('license.claim.contactSales')} ventas@techinnova.local
                    </p>
                </div>
            </motion.div>
        </div>
    )
}

import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    ArrowLeft, TrendingUp, TrendingDown, Clock,
    Calendar, Receipt, FileText, Building2,
    User, Eye, Trash2, Edit2, Info, XCircle
} from 'lucide-react'
import { api } from '../services/ApiService'
import { useTranslation } from '../context/LanguageContext'

export default function FinanceDetail() {
    const { t, language, formatCurrency } = useTranslation()
    const { id } = useParams()
    const navigate = useNavigate()
    const [entry, setEntry] = useState(null)
    const [loading, setLoading] = useState(true)

    const fmtDate = d => {
        if (!d) return '—'
        return new Date(d + 'T00:00').toLocaleDateString(language === 'es' ? 'es-PE' : 'en-US', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        })
    }

    useEffect(() => { load() }, [id])

    async function load() {
        setLoading(true)
        try {
            const data = await api.finances.getById(Number(id))
            setEntry(data)
        } catch (err) {
            console.error("FinanceDetail Load Error:", err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
    )

    if (!entry) return (
        <div className="p-10 text-center space-y-4">
            <XCircle size={48} className="mx-auto text-red-400" />
            <h2 className="text-xl font-bold">{t('finance.details.notFound')}</h2>
            <button onClick={() => navigate('/finanzas')} className="btn-secondary">{t('finance.details.backToList')}</button>
        </div>
    )

    const isIncome = entry.type === 'ingreso'

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="btn-secondary !p-2.5">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('finance.details.title')}</h1>
                            <span className={`badge ${entry.status === 'pagado' ? 'badge-green' : 'badge-yellow'}`}>
                                {entry.status === 'pagado' ? t('finance.status.paid') : t('finance.status.pending')}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 font-medium font-mono text-xs uppercase opacity-60">{t('finance.details.reference')}: FIN-{entry.id}</p>
                    </div>
                </div>
            </div>

            {/* Main Financial Card */}
            <div className={`card overflow-hidden border-t-8 ${isIncome ? 'border-emerald-500' : 'border-red-500'}`}>
                <div className="p-8 grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center ${isIncome ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-900/30'}`}>
                                {isIncome ? <TrendingUp size={32} /> : <TrendingDown size={32} />}
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">
                                    {isIncome ? t('finance.details.income') : t('finance.details.expense')} • {entry.category}
                                </p>
                                <p className={`text-3xl font-black ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600'}`}>
                                    {isIncome ? '+' : '-'} {formatCurrency(Number(entry.amount) + Number(entry.late_fee || 0))}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                            {entry.property_id && (
                                <Link to={`/propiedades/${entry.property_id}`} className="flex items-center justify-between group">
                                    <span className="text-sm text-slate-500 flex items-center gap-2"><Building2 size={14} /> {t('finance.details.property')}</span>
                                    <span className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-blue-500 underline decoration-dotted">{entry.property_name || t('property.details.title')}</span>
                                </Link>
                            )}
                            {entry.tenant_id && (
                                <Link to={`/inquilinos/${entry.tenant_id}`} className="flex items-center justify-between group">
                                    <span className="text-sm text-slate-500 flex items-center gap-2"><User size={14} /> {t('finance.details.tenant')}</span>
                                    <span className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-violet-500 underline decoration-dotted">{entry.tenant_name || t('tenant.details.title')}</span>
                                </Link>
                            )}
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-slate-500 flex items-center gap-2"><Calendar size={14} /> {t('finance.details.period')}</span>
                                <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-lg uppercase text-[11px] tracking-widest">{entry.period_month || '—'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 md:border-l border-slate-100 dark:border-slate-800 md:pl-8">
                        <div className="space-y-3">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('finance.details.paymentDate')}</p>
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{fmtDate(entry.payment_date)}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('finance.details.dueDate')}</p>
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{fmtDate(entry.due_date)}</p>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Info size={12} /> {t('finance.details.notesTitle')}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                                {entry.notes || t('finance.details.noNotes')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Receipts Gallery */}
            <div className="card p-6 space-y-4">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Receipt size={18} className="text-blue-500" /> {t('finance.details.receiptsTitle')} ({entry.receipt_paths?.length || 0})
                </h3>
                {entry.receipt_paths && entry.receipt_paths.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {entry.receipt_paths.map((p, i) => (
                            <button
                                key={i}
                                onClick={() => api.files.open(p)}
                                className="aspect-[4/5] bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 relative group transition-all hover:ring-4 hover:ring-blue-500/10"
                            >
                                <div className="absolute inset-0 flex items-center justify-center p-4">
                                    <FileText size={40} className="text-slate-300 dark:text-slate-600 transition-transform group-hover:scale-110" />
                                </div>
                                <div className="absolute inset-x-0 bottom-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm p-2 text-center">
                                    <span className="text-[9px] font-bold text-slate-500 truncate block">{t('finance.details.viewReceipt')} {i + 1}</span>
                                </div>
                                <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors" />
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl text-center space-y-3">
                        <Receipt size={40} className="mx-auto text-slate-200 dark:text-slate-700" />
                        <p className="text-sm text-slate-400">{t('finance.details.noReceipts')}</p>
                    </div>
                )}
            </div>
        </div>
    )
}

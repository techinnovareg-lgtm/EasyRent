import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    ArrowLeft, User, Phone, Mail, MapPin,
    Briefcase, ShieldAlert, FileText, Calendar,
    Edit2, Trash2, CheckCircle2, XCircle, Eye
} from 'lucide-react'
import { api } from '../services/ApiService'
import { useTranslation } from '../context/LanguageContext'

export default function InquilinoDetail() {
    const { t } = useTranslation()
    const { id } = useParams()
    const navigate = useNavigate()
    const [tenant, setTenant] = useState(null)
    const [contracts, setContracts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => { load() }, [id])

    async function load() {
        setLoading(true)
        try {
            const [tnt, allC] = await Promise.all([
                api.tenants.getById(Number(id)),
                api.contracts.getAll()
            ])
            if (tnt) {
                setTenant(tnt)
                setContracts(allC.filter(c => c.tenant_id === tnt.id))
            }
        } catch (err) {
            console.error("InquilinoDetail Load Error:", err)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
    )

    if (!tenant) return (
        <div className="p-10 text-center space-y-4">
            <XCircle size={48} className="mx-auto text-red-400" />
            <h2 className="text-xl font-bold">{t('tenant.details.notFound')}</h2>
            <button onClick={() => navigate('/inquilinos')} className="btn-secondary">{t('tenant.details.backToList')}</button>
        </div>
    )

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header / Actions */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="btn-secondary !p-2.5">
                        <ArrowLeft size={18} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center">
                            <User size={24} className="text-violet-600 dark:text-violet-400" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{tenant.full_name}</h1>
                                <span className={`badge ${tenant.is_active ? 'badge-green' : 'badge-gray'}`}>
                                    {tenant.is_active ? t('tenant.details.active') : t('tenant.details.inactive')}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                                <span className="badge badge-blue">{tenant.doc_type}</span>
                                <span className="font-mono">{tenant.doc_number}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link to={`/inquilinos/${id}/editar`} className="btn-secondary">
                        <Edit2 size={16} /> {t('property.details.edit')}
                    </Link>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left: Info Profile */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card p-6 grid sm:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
                                <Phone size={14} className="text-blue-500" /> {t('tenant.details.contactInfo')}
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex items-center justify-center">
                                        <Phone size={14} className="text-slate-400" />
                                    </div>
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{tenant.phone || t('tenant.details.noPhone')}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex items-center justify-center">
                                        <Mail size={14} className="text-slate-400" />
                                    </div>
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{tenant.email || t('tenant.details.noEmail')}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex items-center justify-center">
                                        <MapPin size={14} className="text-slate-400" />
                                    </div>
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{tenant.address || t('tenant.details.noAddress')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-wider flex items-center gap-2">
                                <Briefcase size={14} className="text-blue-500" /> {t('tenant.details.additionalInfo')}
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex items-center justify-center">
                                        <Briefcase size={14} className="text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{t('tenant.details.occupation')}</p>
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{tenant.occupation || '—'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex items-center justify-center">
                                        <ShieldAlert size={14} className="text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{t('tenant.details.emergencyContact')}</p>
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{tenant.emergency_contact || '—'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Document View */}
                    <div className="card p-6 space-y-4">
                        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <FileText size={18} className="text-blue-500" /> {t('tenant.details.documentTitle')}
                        </h3>
                        {tenant.doc_image_path ? (
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/30 rounded-2xl border border-slate-100 dark:border-slate-700 group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-xl flex items-center justify-center">
                                        <FileText size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{t('tenant.details.docPhoto')} {tenant.doc_type}</p>
                                        <p className="text-xs text-slate-400">{t('tenant.details.docRegistered')}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => api.files.open(tenant.doc_image_path)}
                                    className="btn-primary !px-4"
                                >
                                    <Eye size={16} /> {t('tenant.details.viewDoc')}
                                </button>
                            </div>
                        ) : (
                            <div className="p-10 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl text-center space-y-2">
                                <ShieldAlert size={32} className="mx-auto text-slate-200 dark:text-slate-700" />
                                <p className="text-sm text-slate-400">{t('tenant.details.noDocImage')}</p>
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    <div className="card p-6 space-y-2">
                        <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-wider">{t('tenant.details.notesTitle')}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                            {tenant.notes || t('tenant.details.noNotes')}
                        </p>
                    </div>
                </div>

                {/* Right: Contract History */}
                <div className="space-y-6">
                    <div className="card p-6 space-y-4 border-t-4 border-t-violet-500">
                        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <Calendar size={18} className="text-violet-500" /> {t('tenant.details.historyTitle')}
                        </h3>
                        {contracts.length > 0 ? (
                            <div className="space-y-4">
                                {contracts.map(c => (
                                    <Link key={c.id} to={`/contratos/${c.id}`} className="block p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/30 border border-slate-100 dark:border-slate-700 hover:border-violet-300 transition-all group">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate group-hover:text-violet-600">{c.property_name}</p>
                                                <p className="text-[10px] text-slate-400 uppercase font-black">{c.days_remaining > 0 ? t('tenant.details.inProgress') : t('contract.status.finished')}</p>
                                            </div>
                                            <div className={`p-1.5 rounded-lg ${c.days_remaining > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                <CheckCircle2 size={14} />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                                            <span>{c.start_date}</span>
                                            <span className="w-8 h-px bg-slate-200 dark:bg-slate-600" />
                                            <span>{c.end_date}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Calendar size={20} className="text-slate-300" />
                                </div>
                                <p className="text-xs text-slate-400">{t('tenant.details.noContracts')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

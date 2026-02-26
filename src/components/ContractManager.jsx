import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/ApiService'
import { motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import {
    Plus, FileText, Upload, AlertTriangle, Clock, CheckCircle2,
    Eye, Trash2, Edit2, Calendar, Loader2, X, Search
} from 'lucide-react'
import { useTranslation } from '../context/LanguageContext'

const EMPTY_FORM = {
    property_id: '', tenant_id: '', start_date: '', end_date: '',
    monthly_rent: '', deposit_amount: '', currency: 'PEN', payment_day: 1,
    status: 'activo', contract_file_path: '', notes: '',
}

function ContractStatusBadge({ days }) {
    const { t } = useTranslation()
    if (days < 0) return <span className="badge badge-red"><AlertTriangle size={10} /> {t('contracts.statusColors.vencido')}</span>
    if (days <= 15) return <span className="badge badge-yellow"><Clock size={10} /> {Math.round(days)}{t('contracts.daysRemaining')}</span>
    return <span className="badge badge-green"><CheckCircle2 size={10} /> {t('contracts.statusColors.activo')}</span>
}

function ContractFileZone({ filePath, onUpload, onClear, uploading }) {
    const { t } = useTranslation()
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { 'image/*': [], 'application/pdf': ['.pdf'] },
        maxFiles: 1,
        onDrop: async ([file]) => { if (file) await onUpload(file) },
    })
    if (filePath) return (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
            <FileText size={16} className="text-emerald-500 shrink-0" />
            <span className="text-sm text-emerald-700 dark:text-emerald-400 flex-1 truncate">{t('contracts.attached')}</span>
            <button type="button" onClick={() => api.files.open(filePath)} className="btn-secondary !px-2 !py-1" title={t('common.details')}><Eye size={12} /></button>
            <button type="button" onClick={onClear} className="btn-danger !px-2 !py-1" title={t('common.delete')}><X size={12} /></button>
        </div>
    )
    return (
        <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
            <input {...getInputProps()} />
            {uploading ? <Loader2 size={20} className="animate-spin text-blue-400" /> : <Upload size={20} className="text-slate-400" />}
            <p className="text-sm text-slate-500">{isDragActive ? t('contracts.dropFile') : t('contracts.attachFile')}</p>
        </div>
    )
}

function ContractModal({ contract, props, tenants, onSave, onClose }) {
    const { t, language } = useTranslation()
    const isEdit = Boolean(contract?.id)
    const [form, setForm] = useState(isEdit ? { ...contract } : { ...EMPTY_FORM })
    const [uploadingDoc, setUploadingDoc] = useState(false)
    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    async function handleFileUpload(file) {
        setUploadingDoc(true)
        try {
            const ext = file.name.split('.').pop()
            const filename = `contract_${Date.now()}.${ext}`
            const path = await api.files.saveUpload({ file, subdir: 'contracts', filename })
            set('contract_file_path', path)
        } finally {
            setUploadingDoc(false)
        }
    }

    async function submit(e) {
        e.preventDefault()
        await onSave(form, isEdit ? contract.id : null)
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="font-bold text-lg text-slate-800 dark:text-white">{isEdit ? t('contracts.edit') : t('contracts.new')}</h2>
                        <button onClick={onClose} className="btn-secondary !px-2 !py-2"><X size={16} /></button>
                    </div>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2">
                                <label className="label">{t('contracts.form.property')}</label>
                                <select className="select" value={form.property_id} onChange={e => set('property_id', e.target.value)} required>
                                    <option value="">— {t('common.select')} —</option>
                                    {props.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="label">{t('contracts.form.tenant')}</label>
                                <select className="select" value={form.tenant_id} onChange={e => set('tenant_id', e.target.value)} required>
                                    <option value="">— {t('common.select')} —</option>
                                    {tenants.map(t_obj => <option key={t_obj.id} value={t_obj.id}>{t_obj.full_name} — {t_obj.doc_type} {t_obj.doc_number}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="label">{t('contracts.form.startDate')}</label>
                                <input className="input" type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} required />
                            </div>
                            <div>
                                <label className="label">{t('contracts.form.endDate')}</label>
                                <input className="input" type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)} required />
                            </div>
                            <div>
                                <label className="label">{t('contracts.form.monthlyRent')} ({language === 'es' ? 'S/.' : 'USD'})</label>
                                <input className="input" type="number" step="0.01" value={form.monthly_rent} onChange={e => set('monthly_rent', e.target.value)} required />
                            </div>
                            <div>
                                <label className="label">{t('contracts.form.deposit')} ({language === 'es' ? 'S/.' : 'USD'})</label>
                                <input className="input" type="number" step="0.01" value={form.deposit_amount} onChange={e => set('deposit_amount', e.target.value)} />
                            </div>
                            <div>
                                <label className="label">{t('contracts.form.paymentDay')}</label>
                                <input className="input" type="number" min="1" max="31" value={form.payment_day} onChange={e => set('payment_day', e.target.value)} />
                            </div>
                            <div>
                                <label className="label">Impuesto (%)</label>
                                <input className="input border-blue-200 dark:border-blue-900/30" type="number" step="0.01" value={((form.tax_rate || 0) * 100).toFixed(2)} onChange={e => set('tax_rate', Number(e.target.value) / 100)} />
                            </div>
                            <div>
                                <label className="label text-red-600 font-bold">{t('contracts.form.lateFee')} ({language === 'es' ? 'S/.' : 'USD'})</label>
                                <input className="input text-red-600 font-bold" type="number" step="0.01" min="0" value={form.late_fee ?? 0} onChange={e => set('late_fee', e.target.value)} />
                            </div>
                            <div>
                                <label className="label">{t('common.status')}</label>
                                <select className="select" value={form.status} onChange={e => set('status', e.target.value)}>
                                    {['activo', 'vencido', 'terminado'].map(s => <option key={s} value={s}>{t(`contracts.statusColors.${s}`)}</option>)}
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="label">{t('contracts.form.file')}</label>
                                <ContractFileZone filePath={form.contract_file_path} uploading={uploadingDoc} onUpload={handleFileUpload} onClear={() => set('contract_file_path', '')} />
                            </div>
                            <div className="col-span-2">
                                <label className="label">{t('contracts.form.notes')}</label>
                                <textarea className="input resize-none" rows={2} value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} />
                            </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={onClose} className="btn-secondary flex-1">{t('common.cancel')}</button>
                            <button type="submit" className="btn-primary flex-1"><CheckCircle2 size={15} /> {t('contracts.form.save')}</button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    )
}

export default function ContractManager() {
    const { t, language, formatCurrency } = useTranslation()
    const navigate = useNavigate()
    const [contracts, setContracts] = useState([])
    const [properties, setProperties] = useState([])
    const [tenants, setTenants] = useState([])
    const [loading, setLoading] = useState(true)
    const [modal, setModal] = useState(null)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('todos')

    const fmtDate = useCallback(d => {
        if (!d) return '—'
        return new Date(d + 'T00:00').toLocaleDateString(language === 'es' ? 'es-PE' : 'en-US', {
            day: '2-digit', month: 'short', year: 'numeric'
        })
    }, [language])

    useEffect(() => { load() }, [])

    async function load() {
        try {
            setLoading(true)
            const [c, p, t_list] = await Promise.all([
                api.contracts.getAll(),
                api.properties.getAll(),
                api.tenants.getAll(),
            ])
            setContracts(c || [])
            setProperties(p || [])
            setTenants(t_list || [])
        } catch (err) {
            console.error("ContractManager Load Error:", err)
        } finally {
            setLoading(false)
        }
    }

    async function onSave(form, editId) {
        const payload = {
            property_id: form.property_id ? Number(form.property_id) : null,
            tenant_id: form.tenant_id ? Number(form.tenant_id) : null,
            start_date: form.start_date || null,
            end_date: form.end_date || null,
            monthly_rent: form.monthly_rent ? Number(form.monthly_rent) : 0,
            deposit_amount: form.deposit_amount ? Number(form.deposit_amount) : 0,
            currency: form.currency || 'PEN',
            payment_day: form.payment_day ? Number(form.payment_day) : 1,
            tax_rate: Number(form.tax_rate || 0),
            status: form.status || 'activo',
            contract_file_path: form.contract_file_path || '',
            notes: form.notes || '',
        }
        if (editId) {
            await api.contracts.update(editId, payload)
            await load()
        } else {
            await api.contracts.create(payload)
            await load()
        }
    }

    async function handleDelete(id) {
        if (!confirm(t('common.confirmDelete'))) return
        await api.contracts.delete(id)
        setContracts(c => c.filter(x => x.id !== id))
    }

    const filtered = contracts.filter(c => {
        const matchesSearch = (c.property_name || '').toLowerCase().includes(search.toLowerCase()) ||
            (c.tenant_name || '').toLowerCase().includes(search.toLowerCase())
        const matchesStatus = statusFilter === 'todos' || c.status === statusFilter
        return matchesSearch && matchesStatus
    })

    return (
        <div className="p-6 w-full mx-auto space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('contracts.title')}</h1>
                    <p className="text-sm text-slate-500">{contracts.length} {t('contracts.registered_plural')}</p>
                </div>
                <button onClick={() => setModal('new')} className="btn-primary"><Plus size={16} /> {t('contracts.new')}</button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder={t('contracts.searchPlaceholder')}
                            className="input !pl-10"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex gap-2">
                    {['todos', 'activo', 'vencido', 'terminado'].map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${statusFilter === s
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                                }`}
                        >
                            {s === 'todos' ? t('common.all') : t(`contracts.statusColors.${s}`)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="card overflow-hidden">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="animate-spin text-blue-500" size={40} />
                        <p className="text-slate-400">{t('common.loading')}</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="table fixed-header">
                            <thead>
                                <tr>
                                    <th className="w-[18%]">{t('contracts.table.property')}</th>
                                    <th className="w-[18%]">{t('contracts.table.tenant')}</th>
                                    <th className="w-[15%]">{t('contracts.table.period')}</th>
                                    <th className="w-[12%]">{t('contracts.table.rent')}</th>
                                    <th className="w-[12%] text-center">{t('contracts.table.status')}</th>
                                    <th className="w-[12%]">{t('contracts.table.contract')}</th>
                                    <th className="w-[13%]"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 && (
                                    <tr><td colSpan={7} className="text-center py-10 text-slate-400">{t('contracts.noResults')}</td></tr>
                                )}
                                {filtered.map((c, i) => (
                                    <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.01 }} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="w-[18%] font-medium text-slate-800 dark:text-slate-100 truncate">{c.property_name}</td>
                                        <td className="w-[18%]">
                                            <div className="text-sm truncate">{c.tenant_name}</div>
                                            <div className="text-xs text-slate-400 truncate">{c.tenant_doc}</div>
                                        </td>
                                        <td className="w-[15%] text-sm">
                                            <div className="flex items-center gap-1 text-slate-500"><Calendar size={11} />{fmtDate(c.start_date)}</div>
                                            <div className="flex items-center gap-1 text-slate-500"><Calendar size={11} />{fmtDate(c.end_date)}</div>
                                        </td>
                                        <td className="w-[12%] font-semibold text-slate-800 dark:text-slate-100">{formatCurrency(c.monthly_rent)}</td>
                                        <td className="w-[12%] text-center"><ContractStatusBadge days={c.days_remaining} /></td>
                                        <td className="w-[12%]">
                                            {c.contract_file_path
                                                ? <button onClick={() => api.files.open(c.contract_file_path)} className="badge badge-blue cursor-pointer hover:opacity-80"><FileText size={11} />{t('common.details')}</button>
                                                : <span className="badge badge-gray">{t('common.noPhotos')}</span>
                                            }
                                        </td>
                                        <td className="w-[13%]">
                                            <div className="flex gap-1 justify-end">
                                                <button onClick={() => navigate(`/contratos/${c.id}`)} className="btn-secondary !px-2 !py-1.5 text-blue-500" title={t('common.details')}><Eye size={13} /></button>
                                                <button onClick={() => setModal(c)} className="btn-secondary !px-2 !py-1.5" title={t('common.edit')}><Edit2 size={13} /></button>
                                                <button onClick={() => handleDelete(c.id)} className="btn-danger !px-2 !py-1.5" title={t('common.delete')}><Trash2 size={13} /></button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {modal && (
                <ContractModal
                    contract={modal === 'new' ? null : modal}
                    props={properties}
                    tenants={tenants}
                    onSave={onSave}
                    onClose={() => { setModal(null); load() }}
                />
            )}
        </div>
    )
}

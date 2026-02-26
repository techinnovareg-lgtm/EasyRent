import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../services/ApiService'
import { motion } from 'framer-motion'
import { Plus, Search, User, MoreVertical, Edit2, Trash2, FileText, Phone, Eye } from 'lucide-react'
import { useTranslation } from '../context/LanguageContext'

export default function InquilinoList() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [tenants, setTenants] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('todos')

    useEffect(() => {
        load()
    }, [])

    async function load() {
        try {
            setLoading(true)
            const data = await api.tenants.getAll()
            setTenants(data || [])
        } catch (err) {
            console.error("InquilinoList Load Error:", err)
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete(id) {
        if (!confirm(t('common.confirmDelete'))) return
        await api.tenants.delete(id)
        setTenants(t_list => t_list.filter(x => x.id !== id))
    }

    const filtered = (tenants || []).filter(t_obj => {
        if (!t_obj) return false
        const matchesSearch = `${t_obj.full_name || ''} ${t_obj.doc_number || ''} ${t_obj.email ?? ''}`.toLowerCase().includes((search || '').toLowerCase())
        const matchesStatus = statusFilter === 'todos' ||
            (statusFilter === 'activo' && t_obj.is_active) ||
            (statusFilter === 'inactivo' && !t_obj.is_active)
        return matchesSearch && matchesStatus
    })

    return (
        <div className="p-6 space-y-5 w-full mx-auto">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('tenants.title')}</h1>
                    <p className="text-sm text-slate-500">{filtered.length} {t('tenants.registered_plural')}</p>
                </div>
                <Link to="/inquilinos/nuevo" className="btn-primary">
                    <Plus size={16} /> {t('tenants.new')}
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[280px] max-w-md">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input className="input pl-9" placeholder={t('tenants.searchPlaceholder')} value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="input !w-auto min-w-[150px]" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="todos">{t('tenants.allStatus')}</option>
                    <option value="activo">{t('tenants.onlyActive')}</option>
                    <option value="inactivo">{t('tenants.onlyInactive')}</option>
                </select>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400">{t('common.loading') || 'Cargando...'}</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="card p-12 text-center">
                    <User size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="text-slate-500">
                        {search || statusFilter !== 'todos' ? t('tenants.noResults') : t('tenants.noRecords')}
                    </p>
                </div>
            ) : (
                <div className="card overflow-hidden">
                    <div className="table-wrapper">
                        <table className="table fixed-header">
                            <thead>
                                <tr>
                                    <th className="w-[30%]">{t('tenants.table.tenant')}</th>
                                    <th className="w-[20%]">{t('tenants.table.document')}</th>
                                    <th className="w-[20%]">{t('tenants.table.contact')}</th>
                                    <th className="w-[15%] text-center">{t('tenants.table.status')}</th>
                                    <th className="w-[15%] text-right">{t('common.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((t_obj, i) => (
                                    <motion.tr key={t_obj.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.01 }} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="w-[30%]">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                                                    <User size={14} className="text-violet-600 dark:text-violet-400" />
                                                </div>
                                                <div className="truncate">
                                                    <p className="font-medium text-slate-800 dark:text-slate-100 truncate">{t_obj.full_name}</p>
                                                    {t_obj.email && <p className="text-[11px] text-slate-400 truncate">{t_obj.email}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="w-[20%]">
                                            <div className="flex items-center gap-2">
                                                <span className="badge badge-blue">{t_obj.doc_type}</span>
                                                <span className="font-mono text-sm">{t_obj.doc_number}</span>
                                            </div>
                                        </td>
                                        <td className="w-[20%]">
                                            {t_obj.phone ? (
                                                <span className="text-sm flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                                    <Phone size={12} className="text-slate-400" />
                                                    {t_obj.phone}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-400">—</span>
                                            )}
                                        </td>
                                        <td className="w-[15%] text-center">
                                            <span className={`badge ${t_obj.is_active ? 'badge-green' : 'badge-gray'}`}>
                                                {t_obj.is_active ? t('common.active') : t('common.inactive')}
                                            </span>
                                        </td>
                                        <td className="w-[15%]">
                                            <div className="flex items-center gap-1 justify-end">
                                                <button onClick={() => navigate(`/inquilinos/${t_obj.id}`)} className="btn-secondary !p-1.5 text-blue-500" title={t('common.details')}><Eye size={14} /></button>
                                                <button onClick={() => navigate(`/inquilinos/${t_obj.id}/editar`)} className="btn-secondary !p-1.5" title={t('common.edit')}><Edit2 size={14} /></button>
                                                <button onClick={() => handleDelete(t_obj.id)} className="btn-danger !p-1.5" title={t('common.delete')}><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}

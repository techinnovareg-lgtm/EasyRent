import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Wrench, Plus, Search, Filter, AlertTriangle, Clock, CheckCircle2,
    MoreVertical, Trash2, Edit2, Camera, ExternalLink, Building2,
    DollarSign, ArrowRight, Loader2, X
} from 'lucide-react'
import { api } from '../services/ApiService'
import { useTranslation } from '../context/LanguageContext'

const MaintenanceModule = () => {
    const { t, language, formatCurrency } = useTranslation()
    const [tickets, setTickets] = useState([])
    const [properties, setProperties] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingTicket, setEditingTicket] = useState(null)

    // Form State
    const [formData, setFormData] = useState({
        property_id: '',
        title: '',
        description: '',
        priority: 'medium',
        status: 'open',
        estimated_cost: 0,
        actual_cost: 0,
        photos: []
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const [ticketsData, propsData] = await Promise.all([
                api.maintenance.getAll(),
                api.properties.getAll()
            ])
            setTickets(ticketsData || [])
            setProperties(propsData || [])
        } catch (error) {
            console.error('Error loading maintenance data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (editingTicket) {
                await api.maintenance.update(editingTicket.id, formData)
            } else {
                await api.maintenance.create(formData)
            }
            setIsFormOpen(false)
            setEditingTicket(null)
            loadData()
        } catch (error) {
            console.error('Error saving ticket:', error)
            alert('Error al guardar el ticket.')
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este ticket?')) return
        try {
            await api.maintenance.delete(id)
            loadData()
        } catch (error) {
            console.error('Error deleting ticket:', error)
        }
    }

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        try {
            const filename = `${Date.now()}-${file.name}`
            const publicUrl = await api.files.saveUpload({
                file,
                subdir: 'photos',
                filename
            })
            setFormData(prev => ({ ...prev, photos: [...prev.photos, publicUrl] }))
        } catch (error) {
            console.error('Error uploading photo:', error)
        }
    }

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'bg-red-500/10 text-red-400 border-red-500/20'
            case 'medium': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            case 'low': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'open': return <Clock size={14} className="text-blue-400" />
            case 'in_progress': return <Wrench size={14} className="text-amber-400 animate-pulse" />
            case 'resolved': return <CheckCircle2 size={14} className="text-emerald-400" />
            case 'closed': return <CheckCircle2 size={14} className="text-slate-400" />
            default: return <Clock size={14} />
        }
    }

    const filteredTickets = (tickets || []).filter(t => {
        if (!t) return false
        const title = (t.title || '').toLowerCase()
        const propName = (t.property_name || '').toLowerCase()
        const search = (searchTerm || '').toLowerCase()

        const matchesSearch = title.includes(search) || propName.includes(search)
        const matchesStatus = filterStatus === 'all' || t.status === filterStatus
        return matchesSearch && matchesStatus
    })

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <Wrench className="text-blue-500" />
                        {t('maintenance.title')}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{t('maintenance.subtitle')}</p>
                </div>
                <button
                    onClick={() => {
                        setEditingTicket(null)
                        setFormData({
                            property_id: '', title: '', description: '', priority: 'medium',
                            status: 'open', estimated_cost: 0, actual_cost: 0, photos: []
                        })
                        setIsFormOpen(true)
                    }}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition-all shadow-lg shadow-blue-900/20 font-medium"
                >
                    <Plus size={20} /> {t('maintenance.new')}
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder={t('maintenance.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors shadow-sm dark:shadow-none"
                    />
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 shadow-sm dark:shadow-none">
                    <Filter size={18} className="text-slate-400 dark:text-slate-500" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-transparent text-slate-700 dark:text-slate-300 py-2 focus:outline-none text-sm"
                    >
                        <option value="all">{t('common.all')}</option>
                        <option value="open">{t('maintenance.status.open')}</option>
                        <option value="in_progress">{t('maintenance.status.in_progress')}</option>
                        <option value="resolved">{t('maintenance.status.resolved')}</option>
                        <option value="closed">{t('maintenance.status.closed')}</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="animate-spin text-blue-500" size={40} />
                    <p className="text-slate-500 dark:text-slate-400">{t('maintenance.loading')}</p>
                </div>
            ) : filteredTickets.length === 0 ? (
                <div className="bg-slate-50 dark:bg-slate-800/20 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl py-20 text-center">
                    <div className="bg-white dark:bg-slate-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm dark:shadow-none">
                        <Wrench className="text-slate-400 dark:text-slate-600" size={30} />
                    </div>
                    <p className="text-slate-500">{t('maintenance.noResults')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTickets.map((ticket) => (
                        <motion.div
                            key={ticket.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-5 hover:border-blue-500/50 dark:hover:border-slate-500/50 transition-all group shadow-sm dark:shadow-none"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getPriorityColor(ticket.priority)}`}>
                                    {t(`maintenance.priority.${ticket.priority}`)}
                                </span>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => {
                                            setEditingTicket(ticket)
                                            setFormData(ticket)
                                            setIsFormOpen(true)
                                        }}
                                        className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-500/20 text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 rounded-lg transition-colors"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(ticket.id)}
                                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-500/20 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-slate-800 dark:text-white font-semibold mb-1 line-clamp-1">{ticket.title}</h3>
                            <p className="text-slate-500 text-xs mb-4 flex items-center gap-1">
                                <Building2 size={12} /> {ticket.property_name}
                            </p>

                            <div className="space-y-3 mb-4">
                                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center gap-2">
                                        {getStatusIcon(ticket.status)}
                                        {t(`maintenance.status.${ticket.status}`)}
                                    </span>
                                    <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${ticket.status === 'resolved' || ticket.status === 'closed' ? 'bg-emerald-500 w-full' :
                                            ticket.status === 'in_progress' ? 'bg-amber-500 w-1/2' : 'bg-blue-500 w-1/4'
                                            }`}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5 mt-4">
                                <div>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold">{t('maintenance.form.actualCost')}</p>
                                    <p className="text-slate-800 dark:text-white font-bold">{formatCurrency(ticket.actual_cost)}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {ticket.status === 'resolved' && !ticket.finance_id && (
                                        <button
                                            onClick={async () => {
                                                if (!confirm('¿Deseas registrar este gasto en el módulo de Finanzas?')) return
                                                try {
                                                    const f = await api.finances.create({
                                                        type: 'egreso',
                                                        category: 'mantenimiento',
                                                        amount: ticket.actual_cost,
                                                        property_id: ticket.property_id,
                                                        status: 'pagado',
                                                        payment_date: new Date().toISOString().split('T')[0],
                                                        notes: `Gasto de mantenimiento: ${ticket.title}`
                                                    })
                                                    // Update ticket with finance_id
                                                    const fid = f?.id
                                                    await api.maintenance.update(ticket.id, { ...ticket, finance_id: fid })
                                                    loadData()
                                                } catch (err) {
                                                    console.error(err)
                                                    alert('Error al convertir a egreso')
                                                }
                                            }}
                                            className="text-[10px] h-8 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-3 rounded-lg transition-all flex items-center gap-1.5"
                                        >
                                            <DollarSign size={10} /> {t('finances.new')} {t('finances.types.egreso')}
                                        </button>
                                    )}
                                    {ticket.finance_id && (
                                        <span className="text-[10px] h-8 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 font-bold px-3 rounded-lg flex items-center gap-1.5 opacity-80 dark:opacity-60">
                                            <CheckCircle2 size={10} /> {t('finances.types.egreso')} {t('finances.status.pagado')}
                                        </span>
                                    )}
                                    {ticket.photos && ticket.photos.length > 0 && (
                                        <div className="flex -space-x-2">
                                            {ticket.photos.slice(0, 3).map((photo, i) => (
                                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-700 shadow-sm">
                                                    <img src={photo} alt="" className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Modal Form */}
            <AnimatePresence>
                {isFormOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsFormOpen(false)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl"
                        >
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                                    {editingTicket ? t('maintenance.edit') : t('maintenance.new')}
                                </h2>
                                <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-2">{t('maintenance.form.property')}</label>
                                        <select
                                            required
                                            value={formData.property_id}
                                            onChange={(e) => setFormData({ ...formData, property_id: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="">— {t('common.select')} —</option>
                                            {properties.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-2">{t('maintenance.form.title')}</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            placeholder={t('maintenance.form.titlePlaceholder')}
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                                        />
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-2">{t('maintenance.form.description')}</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            rows={3}
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-2">{t('maintenance.form.priority')}</label>
                                        <select
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="low">{t('maintenance.priority.low')}</option>
                                            <option value="medium">{t('maintenance.priority.medium')}</option>
                                            <option value="high">{t('maintenance.priority.high')}</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-2">{t('maintenance.form.status')}</label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                                        >
                                            <option value="open">{t('maintenance.status.open')}</option>
                                            <option value="in_progress">{t('maintenance.status.in_progress')}</option>
                                            <option value="resolved">{t('maintenance.status.resolved')}</option>
                                            <option value="closed">{t('maintenance.status.closed')}</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-2">
                                            {t('maintenance.form.estimatedCost')} ({language === 'es' ? 'S/.' : 'USD'})
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={formData.estimated_cost}
                                                onChange={(e) => setFormData({ ...formData, estimated_cost: parseFloat(e.target.value) })}
                                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-2">
                                            {t('maintenance.form.actualCost')} ({language === 'es' ? 'S/.' : 'USD'})
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={formData.actual_cost}
                                                onChange={(e) => setFormData({ ...formData, actual_cost: parseFloat(e.target.value) })}
                                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-slate-500 dark:text-slate-400 text-xs font-bold uppercase mb-2">{t('maintenance.form.photos')}</label>
                                        <div className="flex flex-wrap gap-2">
                                            {formData.photos.map((url, i) => (
                                                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden group border border-slate-200 dark:border-slate-700">
                                                    <img src={url} alt="" className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, photos: prev.photos.filter((_, idx) => idx !== i) }))}
                                                        className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <Trash2 size={20} className="text-white" />
                                                    </button>
                                                </div>
                                            ))}
                                            <label className="w-20 h-20 rounded-xl border border-dashed border-slate-600 flex flex-col items-center justify-center cursor-pointer hover:border-slate-400 transition-colors">
                                                <Camera size={24} className="text-slate-500" />
                                                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsFormOpen(false)}
                                        className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-white font-bold py-3 px-6 rounded-xl transition-all"
                                    >
                                        {t('common.cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-blue-500/30 dark:shadow-blue-900/20"
                                    >
                                        {editingTicket ? t('maintenance.form.save') : t('maintenance.new')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default MaintenanceModule

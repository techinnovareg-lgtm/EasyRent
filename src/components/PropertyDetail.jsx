import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ArrowLeft, MapPin, Building2, Home, Maximize2,
    Edit2, Trash2, Calendar, CheckCircle2, XCircle,
    ChevronRight, LayoutGrid, Info
} from 'lucide-react'
import { api } from '../services/ApiService'
import { useTranslation } from '../context/LanguageContext'

export default function PropertyDetail() {
    const { t } = useTranslation()
    const { id } = useParams()
    const navigate = useNavigate()
    const [property, setProperty] = useState(null)
    const [units, setUnits] = useState([])
    const [contracts, setContracts] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeImg, setActiveImg] = useState(0)

    const TYPES_LABEL = {
        casa: t('property.types.house'),
        departamento: t('property.types.apartment'),
        tienda: t('property.types.shop'),
        terreno: t('property.types.land'),
        local: t('property.types.local'),
        oficina: t('property.types.office'),
        otro: t('property.types.other')
    }

    const STATUS_ATTR = {
        disponible: { text: t('property.status.available'), badge: 'badge-green' },
        alquilado: { text: t('property.status.rented'), badge: 'badge-blue' },
        'en mantenimiento': { text: t('property.status.maintenance'), badge: 'badge-yellow' },
        reservado: { text: t('property.status.reserved'), badge: 'badge-gray' }
    }

    useEffect(() => { load() }, [id])

    async function load() {
        setLoading(true)
        try {
            const [p, allP, allC] = await Promise.all([
                api.properties.getById(Number(id)),
                api.properties.getAll(),
                api.contracts.getAll()
            ])
            if (p) {
                setProperty(p)
                setUnits(allP.filter(x => x.parent_id === p.id))
                setContracts(allC.filter(c => c.property_id === p.id))
            }
        } catch (err) {
            console.error("PropertyDetail Load Error:", err)
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete() {
        if (!confirm(t('common.confirmDelete'))) return
        try {
            await api.properties.delete(Number(id))
            navigate('/propiedades')
        } catch (err) {
            console.error("PropertyDetail Delete Error:", err)
            alert(t('common.deleteError') || 'Error al eliminar')
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
    )

    if (!property) return (
        <div className="p-10 text-center space-y-4">
            <XCircle size={48} className="mx-auto text-red-400" />
            <h2 className="text-xl font-bold">{t('property.details.notFound')}</h2>
            <button onClick={() => navigate('/propiedades')} className="btn-secondary">{t('property.details.backToList')}</button>
        </div>
    )

    const hasPhotos = property.photos && property.photos.length > 0
    const photos = hasPhotos ? property.photos : []
    const statusInfo = STATUS_ATTR[property.status] || { text: property.status, badge: 'badge-gray' }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header / Actions */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="btn-secondary !p-2.5">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{property.name}</h1>
                            <span className={`badge ${statusInfo.badge}`}>{statusInfo.text}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-slate-500 font-medium">
                            <MapPin size={14} className="text-blue-500" />
                            {property.district}, {property.city}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link to={`/propiedades/${id}/editar`} className="btn-secondary">
                        <Edit2 size={16} /> {t('property.details.edit')}
                    </Link>
                    <button onClick={handleDelete} className="btn-danger">
                        <Trash2 size={16} /> {t('property.details.delete')}
                    </button>
                </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-6">
                {/* Left: Photos & Gallery */}
                <div className="lg:col-span-7 space-y-4">
                    <div className="card overflow-hidden bg-slate-100 dark:bg-slate-800 aspect-video relative group">
                        {hasPhotos ? (
                            <img
                                src={photos[activeImg]}
                                className="w-full h-full object-cover"
                                alt={property.name}
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                <Building2 size={64} className="mb-2 opacity-20" />
                                <span className="text-sm font-medium">{t('property.details.noPhotos')}</span>
                            </div>
                        )}
                        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-bold uppercase tracking-widest">
                            {t(`properties.types.${property.type}`) || property.type}
                        </div>
                    </div>

                    {photos.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                            {photos.map((p, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveImg(i)}
                                    className={`w-20 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${activeImg === i ? 'border-blue-500 scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                >
                                    <img src={p} className="w-full h-full object-cover" alt="" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Features Grid */}
                    <div className="card p-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                                <Maximize2 size={18} />
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{t('property.details.area')}</p>
                            <p className="font-bold text-slate-800 dark:text-white">{property.area_m2 || 0} m²</p>
                        </div>
                        <div className="text-center">
                            <div className="w-10 h-10 bg-violet-50 dark:bg-violet-900/20 text-violet-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                                <LayoutGrid size={18} />
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{t('property.details.levels')}</p>
                            <p className="font-bold text-slate-800 dark:text-white">{property.levels || 1}</p>
                        </div>
                        {property.floor && (
                            <div className="text-center">
                                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                                    <Home size={18} />
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{t('property.details.floor')}</p>
                                <p className="font-bold text-slate-800 dark:text-white">{property.floor}</p>
                            </div>
                        )}
                        {property.unit_number && (
                            <div className="text-center">
                                <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                                    <Info size={18} />
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{t('property.details.unit')}</p>
                                <p className="font-bold text-slate-800 dark:text-white">{property.unit_number}</p>
                            </div>
                        )}
                    </div>

                    <div className="card p-6 space-y-4">
                        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <Info size={18} className="text-blue-500" /> {t('property.details.descriptionTitle')}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            {property.description || t('property.details.noDescription')}
                        </p>
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            {[
                                { id: 'has_kitchen', label: t('property.features.kitchen'), icon: '🍳' },
                                { id: 'has_dining_room', label: t('property.features.dining'), icon: '🍽️' },
                                { id: 'has_laundry', label: t('property.features.laundry'), icon: '🧺' },
                                { id: 'has_living_room', label: t('property.features.living'), icon: '🛋️' },
                                { id: 'has_elevator', label: t('property.features.elevator'), icon: '🛗' },
                                { id: 'has_stairs', label: t('property.features.stairs'), icon: '🪜' },
                                { id: 'has_terrace', label: t('property.features.terrace'), icon: '🌅' },
                                { id: 'has_rooftop', label: t('property.features.rooftop'), icon: '🗼' },
                                { id: 'has_parking', label: t('property.features.parking'), icon: '🚗' },
                                { id: 'has_garden', label: t('property.features.garden'), icon: '🌳' },
                            ].filter(f => property[f.id]).map(f => (
                                <div key={f.id} className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700 animate-in zoom-in-95">
                                    <span className="text-lg">{f.icon}</span>
                                    <span className="text-[11px] font-bold uppercase tracking-tight text-slate-600 dark:text-slate-300">{f.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Units & Contracts */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Location Detail */}
                    <div className="card p-6 space-y-4">
                        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <MapPin size={18} className="text-blue-500" /> {t('property.details.locationTitle')}
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm py-2 border-b border-slate-50 dark:border-slate-700">
                                <span className="text-slate-500 italic">{t('property.details.address')}</span>
                                <span className="font-semibold text-slate-800 dark:text-white">{property.address || '—'}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm py-2 border-b border-slate-50 dark:border-slate-700">
                                <span className="text-slate-500 italic">{t('property.details.district')}</span>
                                <span className="font-semibold text-slate-800 dark:text-white">{property.district || '—'}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm py-2">
                                <span className="text-slate-500 italic">{t('property.details.city')}</span>
                                <span className="font-semibold text-slate-800 dark:text-white">{property.city || '—'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Grouped Units (if this is a parent property) */}
                    {units.length > 0 && (
                        <div className="card p-6 space-y-4">
                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <LayoutGrid size={18} className="text-blue-500" /> {t('property.details.unitsTitle')}
                            </h3>
                            <div className="space-y-2">
                                {units.map(u => (
                                    <Link key={u.id} to={`/propiedades/${u.id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-all border border-slate-50 dark:border-slate-700 group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xs">
                                                {u.unit_number || u.id}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{u.name}</p>
                                                <p className="text-[10px] text-slate-400 uppercase font-black">{t(`properties.types.${u.type}`) || u.type} · {u.area_m2}m²</p>
                                            </div>
                                        </div>
                                        <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Active Contract info */}
                    <div className="card p-6 space-y-4 relative overflow-hidden backdrop-blur-xl border-t-4 border-t-blue-500">
                        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <Calendar size={18} className="text-blue-500" /> {t('property.details.contractsTitle')}
                        </h3>
                        {contracts.length > 0 ? (
                            <div className="space-y-3">
                                {contracts.map(c => (
                                    <Link key={c.id} to={`/contratos/${c.id}`} className="block border-l-2 border-slate-200 dark:border-slate-700 pl-4 py-1 hover:border-blue-500 transition-all group">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-blue-600">{c.tenant_name}</p>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{c.days_remaining > 0 ? t('contract.status.active') : t('contract.status.finished')}</span>
                                        </div>
                                        <p className="text-xs text-slate-500">Del {c.start_date} al {c.end_date}</p>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <Calendar size={32} className="mx-auto text-slate-200 mb-2 opacity-20" />
                                <p className="text-xs text-slate-400 italic">{t('property.details.noContracts')}</p>
                            </div>
                        )}
                        <Link to="/contratos" className="btn-secondary w-full justify-center !text-blue-500 text-xs font-bold pt-2 mt-2">
                            {t('property.details.viewAllContracts')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

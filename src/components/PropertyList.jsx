import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Building2, Plus, Search, MapPin, Edit2, Trash2, Home, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/ApiService'
import { useTranslation } from '../context/LanguageContext'

const FALLBACK_IMAGES = {
    'departamento': 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80',
    'casa': 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=400&q=80',
    'oficina': 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80',
    'terreno': 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80',
    'local': 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=400&q=80',
    'tienda': 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?auto=format&fit=crop&w=400&q=80',
    'comercial': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80',
    'default': 'https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=400&q=80'
}

const PropertyCard = React.memo(({ p, navigate, del }) => {
    const { t } = useTranslation()
    const [imgError, setImgError] = useState(false)
    const hasPhoto = p.photos && p.photos.length > 0
    const photoUrl = hasPhoto ? p.photos[0] : (FALLBACK_IMAGES[p.type?.toLowerCase()] || FALLBACK_IMAGES.default)

    const FallbackPlaceholder = () => (
        <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex flex-col items-center justify-center gap-2">
            <span className="text-4xl filter grayscale group-hover:grayscale-0 transition-all duration-300">
                {TYPES_LABEL[p.type] ?? '🏗️'}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t('common.noPhotos')}</span>
        </div>
    )

    return (
        <div className="flex flex-col sm:flex-row group transition-all duration-300">
            {/* Image section */}
            <div className="w-full sm:w-48 h-40 sm:h-auto overflow-hidden shrink-0 relative bg-slate-50 dark:bg-slate-800/50">
                {!imgError ? (
                    <img
                        src={photoUrl}
                        alt={p.name}
                        className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${!hasPhoto ? 'grayscale group-hover:grayscale-0' : ''}`}
                        loading="lazy"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <FallbackPlaceholder />
                )}

                {!hasPhoto && !imgError && <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-300" />}

                {/* Status overlay */}
                <div className="absolute top-3 left-3 flex">
                    <span className={`badge ${STATUS_BADGES[p.status] ?? 'badge-gray'} !py-1.5 !px-3 shadow-xl backdrop-blur-xl border border-white/30 dark:border-white/10 font-black tracking-tight uppercase text-[10px]`}>
                        {t(`properties.status.${p.status}`) || p.status}
                    </span>
                </div>
            </div>

            {/* Content section */}
            <div className="p-5 flex-1 flex flex-col justify-between min-w-0">
                <div className="space-y-2">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white truncate leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {p.name}
                                </h3>
                                {!p.is_active && (
                                    <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-black uppercase rounded tracking-tighter">
                                        {t('common.inactive')}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                                <MapPin size={12} className="text-blue-500" />
                                <span className="truncate">{p.district}{p.province ? `, ${p.province}` : ''}{p.city ? ` (${p.city})` : ''}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700/50 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tighter">
                            {t(`properties.types.${p.type}`) || p.type}
                        </span>
                        {p.area_m2 && (
                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700/50 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tighter">
                                {p.area_m2} m²
                            </span>
                        )}
                        {(p.floor || p.unit_number) && (
                            <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-tighter">
                                {p.floor ? `${t('common.floor')} ${p.floor}` : ''} {p.unit_number ? `· ${t('common.unitNumber')} ${p.unit_number}` : ''}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-slate-50 dark:border-slate-700/30">
                    <button
                        onClick={() => navigate(`/propiedades/${p.id}`)}
                        className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 dark:bg-slate-700/50 dark:hover:bg-blue-900/30 text-blue-500 transition-all border border-transparent hover:border-blue-100 dark:hover:border-blue-800"
                        title={t('common.details')}
                    >
                        <Eye size={15} />
                    </button>
                    <button
                        onClick={() => navigate(`/propiedades/${p.id}/editar`)}
                        className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-700/50 dark:hover:bg-slate-600/50 text-slate-600 transition-all border border-transparent"
                        title={t('common.edit')}
                    >
                        <Edit2 size={15} />
                    </button>
                    <button
                        onClick={() => del(p.id)}
                        className="p-2.5 rounded-xl bg-slate-50 hover:bg-red-50 dark:bg-slate-700/50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 transition-all border border-transparent"
                        title={t('common.delete')}
                    >
                        <Trash2 size={15} />
                    </button>
                </div>
            </div>
        </div>
    )
})

const STATUS_BADGES = {
    disponible: 'badge-green', alquilado: 'badge-blue',
    'en mantenimiento': 'badge-yellow', reservado: 'badge-gray',
}
const TYPES_LABEL = { casa: '🏠', departamento: '🏢', tienda: '🛍️', terreno: '🌳', local: '🏪', oficina: '🏛️', otro: '🏗️' }

export default function PropertyList() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [props, setProps] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [typeFilter, setTypeFilter] = useState('todos')

    useEffect(() => { load() }, [])

    async function load() {
        try {
            setLoading(true)
            setProps(await api.properties.getAll() || [])
        } catch (err) {
            console.error("PropertyList Load Error:", err)
        } finally {
            setLoading(false)
        }
    }

    async function del(id) {
        if (!confirm(t('common.confirmDelete'))) return
        await api.properties.delete(id)
        setProps(p => p.filter(x => x.id !== id))
    }

    const filtered = props.filter(p => {
        const matchesSearch = `${p.name} ${p.city} ${p.district} ${p.province}`.toLowerCase().includes(search.toLowerCase())
        const matchesType = typeFilter === 'todos' || p.type === typeFilter
        return matchesSearch && matchesType
    })

    const mainProps = filtered.filter(p => !p.parent_id)
    const children = filtered.filter(p => p.parent_id)

    const types = ['todos', ...Object.keys(TYPES_LABEL)]

    return (
        <div className="p-6 w-full mx-auto space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('properties.title')}</h1>
                    <p className="text-sm text-slate-500">{props.length} {t('common.registered')}</p>
                </div>
                <Link to="/propiedades/nueva" className="btn-primary"><Plus size={16} /> {t('properties.new')}</Link>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="relative w-full max-w-sm">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input className="input pl-9" placeholder={t('properties.searchPlaceholder')} value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="flex flex-wrap gap-2">
                    {types.map(t_key => (
                        <button
                            key={t_key}
                            onClick={() => setTypeFilter(t_key)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${typeFilter === t_key
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700 hover:bg-slate-50'
                                }`}
                        >
                            {t_key === 'todos' ? t('properties.types.all') : `${TYPES_LABEL[t_key]} ${t(`properties.types.${t_key}`)}`}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400">{t('common.loading')}</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="card p-12 text-center">
                    <Building2 size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="text-slate-500">{search ? t('common.noResults') : t('common.noRecords')}</p>
                    {!search && <Link to="/propiedades/nueva" className="btn-primary mt-4 inline-flex">{t('common.addFirst')} {t('properties.title').toLowerCase()}</Link>}
                </div>
            ) : (
                <div className="space-y-6">
                    {mainProps.map((p, i) => (
                        <div key={p.id} className="space-y-3">
                            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.005, duration: 0.15 }} className="card overflow-hidden border-l-4 border-l-blue-500">
                                <PropertyCard p={p} navigate={navigate} del={del} />
                            </motion.div>

                            {children.filter(c => c.parent_id === p.id).map((c, j) => (
                                <motion.div key={c.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: (i + j) * 0.005, duration: 0.15 }} className="ml-8 card overflow-hidden border-l-4 border-l-slate-300 dark:border-l-slate-600 scale-95 opacity-90">
                                    <PropertyCard p={c} navigate={navigate} del={del} />
                                </motion.div>
                            ))}
                        </div>
                    ))}

                    {children.filter(c => !mainProps.some(m => m.id === c.parent_id)).map((c, i) => (
                        <motion.div key={c.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.005, duration: 0.15 }} className="card overflow-hidden opacity-80 border-dashed border-2">
                            <PropertyCard p={c} navigate={navigate} del={del} />
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}

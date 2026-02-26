import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { ArrowLeft, ArrowRight, Save, Building2, MapPin, Image, Check, X, Loader2 } from 'lucide-react'
import { api } from '../services/ApiService'
import { useTranslation } from '../context/LanguageContext'

const TYPES = ['casa', 'departamento', 'tienda', 'terreno', 'local', 'oficina', 'edificio', 'depósito', 'otro']
const STATUS_OPTS = ['disponible', 'alquilado', 'en mantenimiento', 'reservado']

function StepIndicator({ current, total }) {
    return (
        <div className="flex items-center gap-0 mb-8">
            {Array.from({ length: total }).map((_, i) => (
                <React.Fragment key={i}>
                    <div className={i < current ? 'step-done' : i === current ? 'step-active' : 'step-inactive'}>
                        {i < current ? <Check size={14} /> : i + 1}
                    </div>
                    {i < total - 1 && (
                        <div className={`flex-1 h-0.5 mx-1 rounded transition-all duration-500 ${i < current ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-slate-700'}`} />
                    )}
                </React.Fragment>
            ))}
        </div>
    )
}

function PhotoGrid({ photos, onRemove }) {
    return (
        <div className="grid grid-cols-3 gap-2 mt-3">
            {photos.map((p, i) => (
                <div key={i} className="relative group aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700">
                    <img src={p.preview ?? p} alt="" className="w-full h-full object-cover" />
                    <button
                        type="button"
                        onClick={() => onRemove(i)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                    >
                        <X size={12} />
                    </button>
                </div>
            ))}
        </div>
    )
}

function NumericInput({ label, value, onChange, placeholder, min = 0, step = "1", icon: Icon }) {
    const { t } = useTranslation()
    const isInvalid = value && isNaN(value);
    return (
        <div className="space-y-1">
            <label className="label flex items-center gap-1.5">
                {Icon && <Icon size={13} className="text-slate-400" />}
                {label}
            </label>
            <div className="relative">
                <input
                    type="text"
                    inputMode="decimal"
                    className={`input ${isInvalid ? 'border-red-500 ring-red-500/20 ring-4' : ''}`}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                />
                <AnimatePresence>
                    {isInvalid && (
                        <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] text-red-500 font-bold absolute -bottom-5 left-0">
                            ⚠ {t('common.onlyNumbers')}
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

function FeatureToggle({ label, checked, onChange, icon: Icon }) {
    return (
        <label className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all cursor-pointer select-none ${checked
            ? 'bg-blue-50 border-blue-500 dark:bg-blue-900/20 dark:border-blue-500'
            : 'bg-white border-slate-100 dark:bg-slate-800 dark:border-slate-700 hover:border-slate-200'
            }`}>
            <div className={`w-4 h-4 rounded-md flex items-center justify-center border transition-colors ${checked ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-300 dark:border-slate-600'
                }`}>
                {checked && <Check size={10} strokeWidth={4} />}
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
                {Icon && <Icon size={12} className={checked ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'} />}
                <span className={`text-[10px] font-bold uppercase tracking-tight truncate ${checked ? 'text-blue-700 dark:text-blue-300' : 'text-slate-500 dark:text-slate-400'}`}>
                    {label}
                </span>
            </div>
            <input type="checkbox" className="hidden" checked={checked} onChange={e => onChange(e.target.checked)} />
        </label>
    )
}

function PhotoDropzone({ photos, setPhotos }) {
    const { t } = useTranslation()
    const onDrop = useCallback(async (files) => {
        const newPhotos = []
        for (const file of files) {
            const ext = file.name.split('.').pop()
            const filename = `prop_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
            const path = await api.files.saveUpload({ file, subdir: 'photos', filename })
            newPhotos.push(path)
        }
        setPhotos(p => [...p, ...newPhotos])
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { 'image/*': [] },
        onDrop,
        maxFiles: 20,
    })

    return (
        <div>
            <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
                <input {...getInputProps()} />
                <Image size={28} className="text-slate-400" />
                <p className="text-sm text-slate-500 text-center">
                    {isDragActive ? t('properties.form.dropzone.active') : t('properties.form.dropzone.idle')}
                </p>
                <p className="text-xs text-slate-400">{t('properties.form.dropzone.hint')}</p>
            </div>
            {photos.length > 0 && (
                <PhotoGrid photos={photos} onRemove={i => setPhotos(p => p.filter((_, j) => j !== i))} />
            )}
        </div>
    )
}

export default function PropertyForm() {
    const { t } = useTranslation()
    const { id } = useParams()
    const navigate = useNavigate()
    const isEdit = Boolean(id)
    const [step, setStep] = useState(0)
    const [saving, setSaving] = useState(false)
    const [photos, setPhotos] = useState([])
    const [form, setForm] = useState({
        name: '', type: 'departamento', custom_type: '', status: 'disponible', description: '',
        address: '', city: '', province: '', district: '',
        area_m2: '', levels: 1, bedrooms: '', bathrooms: '',
        floor: '', unit_number: '',
        has_elevator: false, has_stairs: false,
        has_terrace: false, has_rooftop: false,
        has_parking: false, has_garden: false,
        has_kitchen: false, has_dining_room: false,
        has_laundry: false, has_living_room: false,
        shared_amenities: [],
        is_active: true, parent_id: '',
    })
    const [allProperties, setAllProperties] = useState([])

    const STEPS = useMemo(() => [
        t('properties.form.steps.basic'),
        t('properties.form.steps.location'),
        t('properties.form.steps.photos')
    ], [t])

    useEffect(() => {
        api.properties.getAll().then(list => setAllProperties(list || []))

        if (isEdit) {
            api.properties.getById(Number(id)).then(p => {
                if (p) {
                    const { photos: ph, ...rest } = p
                    setForm(f => {
                        const isCommonType = TYPES.includes(p.type)
                        return {
                            ...f,
                            ...rest,
                            is_active: Boolean(p.is_active),
                            type: isCommonType ? p.type : 'otro',
                            custom_type: isCommonType ? '' : p.type
                        }
                    })
                    setPhotos(ph || [])
                }
            })
        }
    }, [id])

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    async function handleSubmit() {
        setSaving(true)
        try {
            const finalType = form.type === 'otro' ? form.custom_type : form.type
            if (!finalType) {
                alert(t('properties.form.errors.typeRequired'))
                setStep(0)
                return
            }
            const { custom_type, id: _id, ...formData } = form
            const payload = {
                ...formData,
                type: finalType,
                photos: JSON.stringify(photos),
                shared_amenities: JSON.stringify(form.shared_amenities || []),
                has_elevator: form.has_elevator ? 1 : 0,
                has_stairs: form.has_stairs ? 1 : 0,
                has_terrace: form.has_terrace ? 1 : 0,
                has_rooftop: form.has_rooftop ? 1 : 0,
                has_parking: form.has_parking ? 1 : 0,
                has_garden: form.has_garden ? 1 : 0,
                has_kitchen: form.has_kitchen ? 1 : 0,
                has_dining_room: form.has_dining_room ? 1 : 0,
                has_laundry: form.has_laundry ? 1 : 0,
                has_living_room: form.has_living_room ? 1 : 0,
                area_m2: form.area_m2 ? Number(form.area_m2) : 0,
                levels: form.levels ? Number(form.levels) : 1,
                bedrooms: form.bedrooms ? Number(form.bedrooms) : 0,
                bathrooms: form.bathrooms ? Number(form.bathrooms) : 0,
                floor: form.floor ? Number(form.floor) : null,
                parent_id: form.parent_id ? Number(form.parent_id) : null,
                is_active: form.is_active ? 1 : 0,
            }
            if (isEdit) {
                await api.properties.update(Number(id), payload)
            } else {
                await api.properties.create(payload)
            }
            navigate('/propiedades')
        } catch (err) {
            console.error("Property Save Error:", err)
            alert(`${t('common.error')} ${t('common.save').toLowerCase()}: ${err.message || 'Error'}`)
        } finally {
            setSaving(false)
        }
    }

    const stepContent = [
        // Step 0: Basic Info
        <div className="space-y-4" key="s0">
            <div>
                <label className="label">{t('properties.form.name')} *</label>
                <input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder={t('properties.form.namePlaceholder')} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="label">{t('properties.form.type')}</label>
                    <div className="space-y-2">
                        <select className="select" value={form.type} onChange={e => set('type', e.target.value)}>
                            {TYPES.map(t_type => <option key={t_type} value={t_type}>{t(`properties.types.${t_type}`)}</option>)}
                        </select>
                        {form.type === 'otro' && (
                            <input className="input" placeholder="..." value={form.custom_type} onChange={e => set('custom_type', e.target.value)} required />
                        )}
                    </div>
                </div>
                <div>
                    <label className="label">{t('properties.form.status')}</label>
                    <div className="flex flex-col gap-2">
                        <select className="select" value={form.status} onChange={e => set('status', e.target.value)}>
                            {STATUS_OPTS.map(s => <option key={s} value={s}>{t(`properties.status.${s}`)}</option>)}
                        </select>
                        <label className="flex items-center gap-2 cursor-pointer mt-1">
                            <div onClick={() => set('is_active', !form.is_active)} className={`w-10 h-5 rounded-full transition-all relative ${form.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${form.is_active ? 'left-6' : 'left-1'}`} />
                            </div>
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{t('properties.form.isActive')}</span>
                        </label>
                    </div>
                </div>
            </div>
            <div>
                <label className="label">{t('common.description')}</label>
                <textarea className="input resize-none" rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder={t('properties.form.descriptionPlaceholder')} />
            </div>
        </div>,

        // Step 1: Location + Dimensions
        <div className="space-y-4" key="s1">
            <div>
                <label className="label">{t('properties.form.address')}</label>
                <input className="input" value={form.address} onChange={e => set('address', e.target.value)} placeholder={t('properties.form.addressPlaceholder')} />
            </div>
            <div className="grid grid-cols-3 gap-3">
                <div>
                    <label className="label">{t('properties.form.city')}</label>
                    <input className="input" value={form.city} onChange={e => set('city', e.target.value)} placeholder={t('properties.form.cityPlaceholder')} />
                </div>
                <div>
                    <label className="label">{t('properties.form.province')}</label>
                    <input className="input" value={form.province} onChange={e => set('province', e.target.value)} placeholder={t('properties.form.province')} />
                </div>
                <div>
                    <label className="label">{t('properties.form.district')}</label>
                    <input className="input" value={form.district} onChange={e => set('district', e.target.value)} placeholder={t('properties.form.district')} />
                </div>
            </div>
            <div>
                <label className="label">{t('properties.form.parent')}</label>
                <select className="select font-medium text-slate-700 dark:text-slate-200" value={form.parent_id} onChange={e => set('parent_id', e.target.value)}>
                    <option value="">{t('properties.form.noParent')}</option>
                    {allProperties.filter(p => p.id !== Number(id)).map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({t(`properties.types.${p.type}`) || p.type})</option>
                    ))}
                </select>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <NumericInput label={t('properties.form.area')} value={form.area_m2} onChange={e => set('area_m2', e.target.value)} placeholder="0" step="0.5" />
                <NumericInput label={t('properties.form.bedrooms')} value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)} placeholder="0" />
                <NumericInput label={t('properties.form.bathrooms')} value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)} placeholder="0" />
                <NumericInput label={t('properties.form.levels')} value={form.levels} onChange={e => set('levels', e.target.value)} placeholder="1" />
            </div>

            {(form.type === 'casa' || form.type === 'departamento' || form.type === 'tienda') && (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-700 animate-in fade-in slide-in-from-top-2">
                    <FeatureToggle icon={Check} label={t('properties.form.featuresList.kitchen')} checked={form.has_kitchen} onChange={v => set('has_kitchen', v)} />
                    <FeatureToggle icon={Check} label={t('properties.form.featuresList.diningRoom')} checked={form.has_dining_room} onChange={v => set('has_dining_room', v)} />
                    <FeatureToggle icon={Check} label={t('properties.form.featuresList.laundry')} checked={form.has_laundry} onChange={v => set('has_laundry', v)} />
                    <FeatureToggle icon={Check} label={t('properties.form.featuresList.livingRoom')} checked={form.has_living_room} onChange={v => set('has_living_room', v)} />
                    <FeatureToggle icon={Check} label={t('properties.form.featuresList.parking')} checked={form.has_parking} onChange={v => set('has_parking', v)} />
                    <FeatureToggle icon={Check} label={t('properties.form.featuresList.garden')} checked={form.has_garden} onChange={v => set('has_garden', v)} />
                </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <FeatureToggle icon={Check} label={t('properties.form.featuresList.terrace')} checked={form.has_terrace} onChange={v => set('has_terrace', v)} />
                <FeatureToggle icon={Check} label={t('properties.form.featuresList.rooftop')} checked={form.has_rooftop} onChange={v => set('has_rooftop', v)} />
            </div>

            {/* Apartment specific fields */}
            {form.type === 'departamento' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="grid grid-cols-2 gap-3">
                        <NumericInput label={t('common.floor')} value={form.floor} onChange={e => set('floor', e.target.value)} placeholder="Ej: 3" />
                        <div>
                            <label className="label text-blue-600 dark:text-blue-400">{t('properties.form.unitNumber')}</label>
                            <input className="input" value={form.unit_number ?? ''} onChange={e => set('unit_number', e.target.value)} placeholder={t('properties.form.unitNumberPlaceholder')} />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="label">{t('properties.form.features')}</label>
                        <div className="flex flex-wrap gap-4">
                            {[
                                { id: 'has_elevator', label: t('properties.form.featuresList.elevator') },
                                { id: 'has_stairs', label: t('properties.form.featuresList.stairs') },
                                { id: 'has_terrace', label: t('properties.form.featuresList.terrace') },
                                { id: 'has_rooftop', label: t('properties.form.featuresList.rooftop') },
                            ].map(opt => (
                                <label key={opt.id} className="flex items-center gap-2 cursor-pointer group">
                                    <div
                                        onClick={() => set(opt.id, !form[opt.id])}
                                        className={`w-10 h-5 rounded-full transition-all relative ${form[opt.id] ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                                    >
                                        <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${form[opt.id] ? 'left-6' : 'left-1'}`} />
                                    </div>
                                    <span className="text-sm text-slate-600 dark:text-slate-400">{opt.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="label">{t('properties.form.amenities')}</label>
                        <div className="flex flex-wrap gap-2">
                            {['pool', 'gym', 'grill', 'cinema', 'coworking', 'laundry'].map(item_key => {
                                const item_label = t(`properties.form.amenitiesList.${item_key}`);
                                const selected = (form.shared_amenities || []).includes(item_label);
                                return (
                                    <button
                                        key={item_key}
                                        type="button"
                                        onClick={() => {
                                            const current = form.shared_amenities || [];
                                            set('shared_amenities', selected ? current.filter(x => x !== item_label) : [...current, item_label]);
                                        }}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${selected
                                            ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400'
                                            : 'border-slate-100 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                            }`}
                                    >
                                        {item_label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>
            )}
        </div>,

        // Step 2: Photos
        <div key="s2">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{t('properties.form.photosSubtitle')}</p>
            <PhotoDropzone photos={photos} setPhotos={setPhotos} />
        </div>,
    ]

    const canNext = step === 0 ? form.name.trim().length > 0 : true

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="btn-secondary !px-2.5 !py-2.5" title={t('common.back')}><ArrowLeft size={16} /></button>
                <div>
                    <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                        {isEdit ? t('properties.edit') : t('properties.new')}
                    </h1>
                    <p className="text-sm text-slate-500">{t('common.step')} {step + 1} {t('common.of')} {STEPS.length}: {STEPS[step]}</p>
                </div>
            </div>

            <div className="card p-6">
                <StepIndicator current={step} total={STEPS.length} />

                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {stepContent[step]}
                    </motion.div>
                </AnimatePresence>

                <div className="flex justify-between mt-8">
                    <button
                        type="button"
                        disabled={step === 0}
                        onClick={() => setStep(s => s - 1)}
                        className="btn-secondary disabled:opacity-40"
                    >
                        <ArrowLeft size={15} /> {t('common.previous')}
                    </button>

                    {step < STEPS.length - 1 ? (
                        <button type="button" disabled={!canNext} onClick={() => setStep(s => s + 1)} className="btn-primary disabled:opacity-40">
                            {t('common.next')} <ArrowRight size={15} />
                        </button>
                    ) : (
                        <button type="button" disabled={saving} onClick={handleSubmit} className="btn-primary min-w-[130px]">
                            {saving ? <><Loader2 size={15} className="animate-spin" /> {t('common.saving')}</> : <><Save size={15} /> {t('common.save')}</>}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

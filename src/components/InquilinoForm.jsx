import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { ArrowLeft, User, Save, Upload, X, Eye, ImageIcon, Loader2 } from 'lucide-react'
import { api } from '../services/ApiService'
import { useTranslation } from '../context/LanguageContext'

const DOC_TYPES = ['DNI', 'RUC', 'CE', 'Pasaporte', 'Otro']

function DocUploadZone({ imagePath, onUpload, onClear, loading }) {
    const { t } = useTranslation()
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'], 'application/pdf': ['.pdf'] },
        maxFiles: 1,
        onDrop: async (accepted) => {
            if (!accepted.length) return
            await onUpload(accepted[0])
        },
    })

    return (
        <div className="space-y-2">
            <label className="label">{t('tenants.form.docImage') || 'Documento de identidad (foto o PDF)'}</label>
            {imagePath ? (
                <div className="relative flex items-center gap-3 p-3 border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                    <ImageIcon size={28} className="text-emerald-500 shrink-0" />
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">{t('tenants.form.docUploaded') || 'Documento cargado'}</p>
                        <p className="text-xs text-slate-500 truncate">{imagePath.split(/[\\/]/).pop()}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                        <button
                            type="button"
                            onClick={() => api.files.open(imagePath)}
                            className="btn-secondary !px-2 !py-1.5"
                            title={t('common.details')}
                        >
                            <Eye size={14} />
                        </button>
                        <button type="button" onClick={onClear} className="btn-danger !px-2 !py-1.5" title={t('common.delete')}>
                            <X size={14} />
                        </button>
                    </div>
                </div>
            ) : (
                <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''} ${loading ? 'opacity-60' : ''}`}>
                    <input {...getInputProps()} />
                    {loading ? (
                        <Loader2 size={24} className="text-blue-400 animate-spin" />
                    ) : (
                        <Upload size={24} className="text-slate-400" />
                    )}
                    <p className="text-sm text-slate-500 text-center">
                        {isDragActive ? t('common.dropHere') || 'Suelta aquí...' : t('tenants.form.dropzoneIdle') || 'Arrastra la foto del documento o haz clic para seleccionar'}
                    </p>
                    <p className="text-xs text-slate-400">JPG, PNG, PDF — máx. 10 MB</p>
                </div>
            )}
        </div>
    )
}

function NumericInput({ label, value, onChange, placeholder, isInvalid, errorMsg }) {
    const { t } = useTranslation()
    return (
        <div className="space-y-1">
            <label className="label">{label}</label>
            <div className="relative">
                <input
                    type="text"
                    className={`input ${isInvalid ? 'border-red-500 ring-red-500/20 ring-4' : ''}`}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                />
                <AnimatePresence>
                    {isInvalid && (
                        <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] text-red-500 font-bold absolute -bottom-5 left-0">
                            {errorMsg || t('common.onlyNumbers')}
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

export default function InquilinoForm() {
    const { t } = useTranslation()
    const { id } = useParams()
    const navigate = useNavigate()
    const isEdit = Boolean(id)
    const [saving, setSaving] = useState(false)
    const [uploadingDoc, setUploadingDoc] = useState(false)
    const [form, setForm] = useState({
        full_name: '', doc_type: 'DNI', custom_doc_type: '', doc_number: '', doc_image_path: '',
        phone: '', email: '', address: '', occupation: '', emergency_contact: '', notes: '',
        is_active: true,
    })

    useEffect(() => {
        if (isEdit) {
            api.tenants.getById(Number(id)).then(tenant_obj => {
                if (tenant_obj) {
                    const isCommonDoc = DOC_TYPES.includes(tenant_obj.doc_type)
                    setForm(f => ({
                        ...f,
                        ...tenant_obj,
                        is_active: Boolean(tenant_obj.is_active),
                        doc_type: isCommonDoc ? tenant_obj.doc_type : 'Otro',
                        custom_doc_type: isCommonDoc ? '' : tenant_obj.doc_type
                    }))
                }
            })
        }
    }, [id])

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    async function handleDocUpload(file) {
        setUploadingDoc(true)
        try {
            const ext = file.name.split('.').pop()
            const filename = `doc_${Date.now()}.${ext}`
            const path = await api.files.saveUpload({ file, subdir: 'documents', filename })
            set('doc_image_path', path)
        } finally {
            setUploadingDoc(false)
        }
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setSaving(true)
        try {
            const finalDocType = form.doc_type === 'Otro' ? form.custom_doc_type : form.doc_type
            if (!finalDocType) {
                alert(t('tenants.form.docTypeRequired') || 'El tipo de documento es obligatorio')
                return
            }
            const { custom_doc_type, id: _id, ...formData } = form
            const payload = { ...formData, doc_type: finalDocType, is_active: form.is_active ? 1 : 0 }
            if (isEdit) {
                await api.tenants.update(Number(id), payload)
            } else {
                await api.tenants.create(payload)
            }
            navigate('/inquilinos')
        } catch (err) {
            console.error("Tenant Save Error:", err)
            alert(`${t('common.error')} ${t('common.save').toLowerCase()}: ${err.message || 'Error'}`)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="btn-secondary !px-2.5 !py-2.5" title={t('common.back')}>
                    <ArrowLeft size={16} />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                        {isEdit ? t('tenants.edit') : t('tenants.new')}
                    </h1>
                    <p className="text-sm text-slate-500">{t('tenants.form.subtitle') || 'Completa los datos del inquilino'}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal data */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-5 space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-7 h-7 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
                            <User size={14} className="text-violet-600 dark:text-violet-400" />
                        </div>
                        <h2 className="font-semibold text-slate-700 dark:text-slate-200">{t('tenants.form.personalData') || 'Datos personales'}</h2>
                    </div>

                    <div>
                        <label className="label">{t('tenants.form.fullName')} *</label>
                        <input className="input" value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Ej: Juan Pérez García" required />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="label">{t('tenants.form.docType')}</label>
                            <div className="space-y-2">
                                <select className="select" value={form.doc_type} onChange={e => set('doc_type', e.target.value)}>
                                    {DOC_TYPES.map(t_type => <option key={t_type} value={t_type}>{t_type}</option>)}
                                </select>
                                {form.doc_type === 'Otro' && (
                                    <input className="input" placeholder="..." value={form.custom_doc_type} onChange={e => set('custom_doc_type', e.target.value)} required />
                                )}
                            </div>
                        </div>
                        <NumericInput
                            label={`${t('tenants.form.docNumber')} (${form.doc_type}) *`}
                            value={form.doc_number}
                            onChange={e => set('doc_number', e.target.value)}
                            placeholder={form.doc_type === 'RUC' ? '20xxxxxxxxx' : '12345678'}
                            isInvalid={['DNI', 'RUC'].includes(form.doc_type) && form.doc_number && isNaN(form.doc_number)}
                            errorMsg={t('tenants.form.docNumberNumericError') || "⚠ Solo números permitidos para este tipo de documento"}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <NumericInput
                            label={t('tenants.form.phone')}
                            value={form.phone ?? ''}
                            onChange={e => set('phone', e.target.value)}
                            placeholder="999 999 999"
                            isInvalid={form.phone && isNaN(form.phone.replace(/\s/g, ''))}
                        />
                        <div>
                            <label className="label">{t('tenants.form.email')}</label>
                            <input className="input" type="email" value={form.email ?? ''} onChange={e => set('email', e.target.value)} placeholder="correo@ejemplo.com" />
                        </div>
                    </div>

                    <div>
                        <label className="label">{t('tenants.form.address') || 'Dirección actual'}</label>
                        <input className="input" value={form.address ?? ''} onChange={e => set('address', e.target.value)} placeholder="Jr. Los Pinos 123, Lima" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="label">{t('tenants.form.occupation') || 'Ocupación / Trabajo'}</label>
                            <input className="input" value={form.occupation ?? ''} onChange={e => set('occupation', e.target.value)} placeholder="Ej: Comerciante" />
                        </div>
                        <div>
                            <label className="label">{t('tenants.form.emergencyContact')}</label>
                            <input className="input" value={form.emergency_contact ?? ''} onChange={e => set('emergency_contact', e.target.value)} placeholder="Nombre — Telf." />
                        </div>
                    </div>

                    <div>
                        <label className="label">{t('tenants.form.notes')}</label>
                        <textarea className="input resize-none" rows={2} value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} placeholder="..." />
                    </div>

                    <div className="pt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <div onClick={() => set('is_active', !form.is_active)} className={`w-10 h-5 rounded-full transition-all relative ${form.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${form.is_active ? 'left-6' : 'left-1'}`} />
                            </div>
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t('tenants.form.isActive')}</span>
                        </label>
                    </div>
                </motion.div>

                {/* Document upload */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-5">
                    <DocUploadZone
                        imagePath={form.doc_image_path}
                        loading={uploadingDoc}
                        onUpload={handleDocUpload}
                        onClear={() => set('doc_image_path', '')}
                    />
                </motion.div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <button type="button" onClick={() => navigate(-1)} className="btn-secondary">{t('common.cancel')}</button>
                    <button type="submit" disabled={saving} className="btn-primary min-w-[120px]">
                        {saving ? <><Loader2 size={15} className="animate-spin" /> {t('common.saving')}</> : <><Save size={15} /> {t('common.save')}</>}
                    </button>
                </div>
            </form>
        </div>
    )
}

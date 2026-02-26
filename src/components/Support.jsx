import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
    LifeBuoy, Copy, Check, MessageCircle, ExternalLink,
    ShieldCheck, Cpu, HardDrive, ShoppingCart, Mail,
    Eye, EyeOff
} from 'lucide-react'
import { api } from '../services/ApiService'
import { useTranslation } from '../context/LanguageContext'

export default function Support() {
    const { t, language } = useTranslation()
    const [hwid, setHwid] = useState(t('common.loading'))
    const [license, setLicense] = useState(null)
    const [user, setUser] = useState(null)
    const [copiedHwid, setCopiedHwid] = useState(false)
    const [copiedLicense, setCopiedLicense] = useState(false)
    const [showHwid, setShowHwid] = useState(false)
    const [showLicense, setShowLicense] = useState(false)

    useEffect(() => {
        api.license.getHardwareId().then(setHwid).catch(() => setHwid('N/A'))
        api.license.getLicense().then(setLicense).catch(() => setLicense(null))
        api.auth.getSession().then(s => setUser(s?.session?.user)).catch(() => setUser(null))
    }, [])

    const copyToClipboard = (text, setCopied) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const maskValue = (val) => {
        if (!val || val === t('common.loading')) return val;
        return val.substring(0, 4) + ' •••• •••• ' + val.substring(val.length - 4);
    }

    const supportDetails = useMemo(() => {
        const expiresStr = license?.expires_at ? new Date(license.expires_at).toLocaleDateString(language === 'es' ? 'es-PE' : 'en-US') : 'N/A'
        return `\n\n${t('common.contact')}: ${user?.email || 'N/A'}\nHWID: ${hwid}\n${t('support.license')}: ${license?.license_key || t('support.noLicense')}\nPlan: ${license?.plan_type || 'Desktop'}\nExp: ${expiresStr}`
    }, [license, user, hwid, t, language])

    const whatsappMsg = `${t('support.whatsappMsg')}${supportDetails}`
    const whatsappLink = `https://wa.me/51947515529?text=${encodeURIComponent(whatsappMsg)}`

    const emailSubject = `${t('support.emailSubject')} - ${user?.email || t('common.noResults')}`
    const emailBody = `${t('support.emailBody')}${supportDetails}`
    const emailLink = `mailto:tech.innova.reg@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`

    return (
        <div className="p-6 w-full mx-auto space-y-6 text-slate-800 dark:text-white">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
                        <LifeBuoy className="text-blue-500" /> {t('support.title')}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        {t('support.subtitle')}
                    </p>
                </div>
            </header>

            <div className="grid md:grid-cols-2 gap-6">
                {/* ID section */}
                <div className="space-y-6">
                    <div className="card p-6 space-y-4">
                        <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                            <Cpu size={16} className="text-blue-500" /> {t('support.systemId')}
                        </h2>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            {t('support.systemIdHint')}
                        </p>

                        <div className="relative group">
                            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-sm break-all pr-24 transition-all">
                                <span className="text-slate-400 text-xs mr-2">{t('support.hwid')}:</span>
                                <span className={`${showHwid ? 'text-slate-700 dark:text-blue-400 font-bold' : 'text-slate-400 font-medium'}`}>
                                    {showHwid ? hwid : maskValue(hwid)}
                                </span>
                            </div>
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                <button
                                    onClick={() => setShowHwid(!showHwid)}
                                    className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-blue-500"
                                    title={showHwid ? t('support.hide') : t('support.show')}
                                >
                                    {showHwid ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                                <button
                                    onClick={() => copyToClipboard(hwid, setCopiedHwid)}
                                    className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-blue-500"
                                    title={`${t('support.copy')} ${t('support.hwid')}`}
                                >
                                    {copiedHwid ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                                </button>
                            </div>
                        </div>

                        {license && (
                            <div className="relative group animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-sm break-all pr-24 transition-all">
                                    <span className="text-slate-400 text-xs mr-2">{t('support.license')}:</span>
                                    <span className={`${showLicense ? 'text-slate-700 dark:text-emerald-500 font-bold' : 'text-slate-400 font-medium'}`}>
                                        {showLicense ? license.license_key : maskValue(license.license_key)}
                                    </span>
                                </div>
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                    <button
                                        onClick={() => setShowLicense(!showLicense)}
                                        className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-blue-500"
                                        title={showLicense ? t('support.hide') : t('support.show')}
                                    >
                                        {showLicense ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                    <button
                                        onClick={() => copyToClipboard(license.license_key, setCopiedLicense)}
                                        className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-blue-500"
                                        title={`${t('support.copy')} ${t('support.license')}`}
                                    >
                                        {copiedLicense ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="card p-6 bg-blue-600 text-white border-none shadow-xl shadow-blue-600/20">
                        <div className="flex gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                                <ShoppingCart size={24} />
                            </div>
                            <div className="space-y-3">
                                <h3 className="font-bold text-lg">{t('support.renewTitle')}</h3>
                                <p className="text-blue-50 text-xs leading-relaxed">
                                    {t('support.renewSubtitle')}
                                </p>
                                <a
                                    href="https://tech-innova.vercel.app/tienda"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-white text-blue-600 px-5 py-2.5 rounded-xl text-xs font-black shadow-lg hover:bg-slate-100 transition-all active:scale-95"
                                >
                                    {t('support.goToStore')} <ExternalLink size={14} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact section */}
                <div className="space-y-6">
                    <div className="card p-6 space-y-6">
                        <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                            <ShieldCheck size={16} className="text-blue-500" /> {t('support.directSupport')}
                        </h2>

                        <div className="space-y-4">
                            <a
                                href={whatsappLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-start gap-4 p-4 rounded-xl border border-transparent hover:border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all group"
                            >
                                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 shrink-0 group-hover:scale-110 transition-transform">
                                    <MessageCircle size={20} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold">{t('support.whatsappTitle')}</p>
                                    <p className="text-xs text-slate-500">{t('support.whatsappSubtitle')}</p>
                                    <span className="text-xs text-blue-500 font-bold block pt-1 group-hover:underline">+51 947 515 529</span>
                                </div>
                            </a>

                            <a
                                href={emailLink}
                                className="flex items-start gap-4 p-4 rounded-xl border border-transparent hover:border-blue-500/30 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group"
                            >
                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 shrink-0 group-hover:scale-110 transition-transform">
                                    <Mail size={20} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold">{t('support.emailTitle')}</p>
                                    <p className="text-xs text-slate-500">{t('support.emailSubtitle')}</p>
                                    <span className="text-xs text-blue-500 font-bold block pt-1 group-hover:underline">tech.innova.reg@gmail.com</span>
                                </div>
                            </a>
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{t('support.faqTitle')}</h4>
                            <div className="space-y-3">
                                {Array.isArray(t('support.faqs')) && t('support.faqs').map((faq, idx) => (
                                    <details key={idx} className="group">
                                        <summary className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer list-none flex justify-between items-center hover:text-blue-500 transition-colors">
                                            {faq.q}
                                            <div className="group-open:rotate-180 transition-transform text-slate-400">▼</div>
                                        </summary>
                                        <p className="text-[11px] text-slate-500 mt-2 pl-3 border-l-2 border-blue-500/30 leading-relaxed">
                                            {faq.a}
                                        </p>
                                    </details>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

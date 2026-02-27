import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, Download, FileSpreadsheet, FileText, Filter, Loader2 } from 'lucide-react'
import { api } from '../services/ApiService'
import { useTranslation } from '../context/LanguageContext'

async function exportExcel(rows, t, filename = 'EasyRent_Report') {
    const ExcelJS = (await import('exceljs')).default
    const wb = new ExcelJS.Workbook()
    wb.creator = 'EasyRent'
    wb.created = new Date()
    const ws = wb.addWorksheet(t('finances.title'))

    const currencySymbol = rows[0]?.language === 'en' ? '$' : 'S/.'
    const currencySuffix = rows[0]?.language === 'en' ? ' (USD)' : ' (S/.)'

    ws.columns = [
        { header: t('finances.form.type'), key: 'type', width: 12 },
        { header: t('finances.form.category'), key: 'category', width: 18 },
        { header: t('properties.title'), key: 'property_name', width: 24 },
        { header: t('tenants.title'), key: 'tenant_name', width: 24 },
        { header: t('common.document'), key: 'tenant_doc', width: 16 },
        { header: `${t('finances.form.amount')}${currencySuffix}`, key: 'amount', width: 16 },
        { header: `${t('finances.form.lateFee')}${currencySuffix}`, key: 'late_fee', width: 14 },
        { header: `${t('finances.table.totalAmount')}${currencySuffix}`, key: 'total_amount', width: 16 },
        { header: t('common.status'), key: 'status', width: 14 },
        { header: t('finances.form.dueDate'), key: 'due_date', width: 16 },
        { header: t('finances.form.paymentDate'), key: 'payment_date', width: 16 },
        { header: t('finances.form.periodMonth'), key: 'period_month', width: 12 },
        { header: t('common.description') || t('common.notes'), key: 'notes', width: 30 },
    ]

    // Style header
    ws.getRow(1).eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } }
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 }
        cell.alignment = { vertical: 'middle', horizontal: 'center' }
    })
    ws.getRow(1).height = 20

    rows.forEach(r => {
        const isEgreso = r.type === 'egreso'
        const amt = isEgreso ? -Number(r.converted_amount) : Number(r.converted_amount)
        const late = isEgreso ? -Number(r.converted_late_fee || 0) : Number(r.converted_late_fee || 0)

        const rowData = {
            ...r,
            type: t(`finances.types.${r.type}`) || r.type,
            category: t(`finances.categories.${r.category}`) || r.category,
            status: t(`finances.status.${r.status}`) || r.status,
            amount: amt,
            late_fee: late,
            total_amount: amt + late
        }
        const row = ws.addRow(rowData)
        const format = `"${currencySymbol}"#,##0.00`
        row.getCell('amount').numFmt = format
        row.getCell('late_fee').numFmt = format
        row.getCell('total_amount').numFmt = format

        if (isEgreso) {
            row.getCell('type').font = { color: { argb: 'FFdc2626' }, bold: true }
            row.getCell('amount').font = { color: { argb: 'FFdc2626' } }
            row.getCell('late_fee').font = { color: { argb: 'FFdc2626' } }
            row.getCell('total_amount').font = { color: { argb: 'FFdc2626' }, bold: true }
        } else {
            row.getCell('type').font = { color: { argb: 'FF059669' }, bold: true }
        }
    })

    // Totals — exclude 'pendiente' records (not yet realized)
    const effectiveRows = rows.filter(r => r.status !== 'pendiente')
    ws.addRow([])

    // Pending info row
    const pendingRows = rows.filter(r => r.status === 'pendiente')
    if (pendingRows.length > 0) {
        const pendingTxt = ws.addRow({ type: `(*) ${pendingRows.length} registro(s) pendiente(s) no incluido(s) en el balance` })
        pendingTxt.getCell('type').font = { italic: true, color: { argb: 'FFd97706' }, size: 9 }
        ws.mergeCells(`A${pendingTxt.number}:H${pendingTxt.number}`)
        ws.addRow([])
    }

    const totalRow = ws.addRow({
        type: 'BALANCE FINAL',
        amount: effectiveRows.reduce((a, r) => a + (r.type === 'ingreso' ? Number(r.converted_amount) : -Number(r.converted_amount)), 0),
        late_fee: effectiveRows.reduce((a, r) => a + (r.type === 'ingreso' ? Number(r.converted_late_fee || 0) : -Number(r.converted_late_fee || 0)), 0),
        total_amount: effectiveRows.reduce((a, r) => a + (r.type === 'ingreso' ? (Number(r.converted_amount) + Number(r.converted_late_fee || 0)) : -(Number(r.converted_amount) + Number(r.converted_late_fee || 0))), 0),
    })
    totalRow.getCell('type').font = { bold: true }
    const totalFormat = `"${currencySymbol}"#,##0.00`
    totalRow.getCell('amount').numFmt = totalFormat
    totalRow.getCell('late_fee').numFmt = totalFormat
    totalRow.getCell('total_amount').numFmt = totalFormat
    totalRow.font = { bold: true }

    const buf = await wb.xlsx.writeBuffer()
    const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `${filename}.xlsx`; a.click()
    URL.revokeObjectURL(url)
}

async function exportPDF(rows, filters, t, language, formatCurrency, filename = 'EasyRent_Report') {
    const { default: jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
    const pageW = doc.internal.pageSize.getWidth()

    const fmt = v => formatCurrency(v)
    const fmtDate = d => d ? new Date(d + 'T00:00').toLocaleDateString(language === 'es' ? 'es-PE' : 'en-US') : '—'

    // Header branding
    doc.setFillColor(37, 99, 235)
    doc.rect(0, 0, pageW, 22, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.setTextColor(255, 255, 255)
    doc.text(`EasyRent — ${t('reports.title')}`, 14, 13)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`${t('common.registered')}: ${new Date().toLocaleDateString(language === 'es' ? 'es-PE' : 'en-US')}`, pageW - 14, 13, { align: 'right' })

    // Filter summary
    if (filters.tenant || filters.property || filters.month) {
        doc.setTextColor(80, 80, 80)
        doc.setFontSize(9)
        const filterText = [
            filters.tenant && `${t('tenants.table.tenant')}: ${filters.tenant}`,
            filters.property && `${t('properties.title')}: ${filters.property}`,
            filters.month && `${t('reports.filters.period')}: ${filters.month}`,
        ].filter(Boolean).join('   |   ')
        doc.text(filterText, 14, 30)
    }

    // Exclude 'pendiente' records from totals — not yet realized transactions
    const effectivePDF = rows.filter(r => r.status !== 'pendiente')
    const pendingPDF = rows.filter(r => r.status === 'pendiente')
    const totalIngresos = effectivePDF.filter(r => r.type === 'ingreso').reduce((a, r) => a + (Number(r.amount) || 0) + (Number(r.late_fee) || 0), 0)
    const totalEgresos = effectivePDF.filter(r => r.type === 'egreso').reduce((a, r) => a + (Number(r.amount) || 0) + (Number(r.late_fee) || 0), 0)
    const balance = totalIngresos - totalEgresos

    autoTable(doc, {
        startY: filters.tenant || filters.property || filters.month ? 35 : 28,
        head: [[
            t('finances.form.type'), t('finances.form.category'), t('properties.title'), t('tenants.title'),
            t('reports.distribution'), t('finances.form.lateFee'), t('finances.form.periodMonth'),
            t('common.status'), t('finances.form.paymentDate')
        ]],
        body: rows.map(r => {
            const isEgreso = r.type === 'egreso'
            const rawAmt = (Number(r.amount) || 0) + (Number(r.late_fee) || 0)
            return [
                isEgreso ? `${t('finances.types.egreso')} ▼` : `${t('finances.types.ingreso')} ▲`,
                t(`finances.categories.${r.category}`) || r.category,
                r.property_name || '—', r.tenant_name || '—',
                isEgreso ? `- ${fmt(rawAmt)}` : fmt(rawAmt),
                r.late_fee > 0 ? fmt(r.late_fee) : '—',
                r.period_month || '—',
                t(`finances.status.${r.status}`) || r.status,
                fmtDate(r.payment_date),
            ]
        }),
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        didParseCell: (d) => {
            if (d.section === 'body') {
                const isEgreso = d.row.raw[0]?.includes('▼')
                if (d.column.index === 0) {
                    d.cell.styles.textColor = isEgreso ? [220, 38, 38] : [5, 150, 105]
                    d.cell.styles.fontStyle = 'bold'
                }
                if (isEgreso && d.column.index === 4) {
                    d.cell.styles.textColor = [220, 38, 38]
                }
            }
        },
        foot: [
            ['', '', '', '', `▲ ${t('finances.types.ingreso')}`, fmt(totalIngresos), '', '', ''],
            ['', '', '', '', `▼ ${t('finances.types.egreso')}`, `- ${fmt(totalEgresos)}`, '', '', ''],
            ['', '', '', '', 'BALANCE NETO', balance >= 0 ? fmt(balance) : `- ${fmt(Math.abs(balance))}`, '', '', ''],
            ...(pendingPDF.length > 0 ? [['', '', '', '', `(*) ${pendingPDF.length} pendiente(s) excluido(s)`, '', '', '', '']] : []),
        ],
        footStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold' },
        didParseCell: (d) => {
            if (d.section === 'foot') {
                const isEgresoRow = d.row.raw[4]?.includes('▼')
                const isBalanceRow = d.row.raw[4] === 'BALANCE NETO'
                if (isEgresoRow) d.cell.styles.fillColor = [220, 38, 38]
                else if (isBalanceRow) d.cell.styles.fillColor = balance >= 0 ? [5, 150, 105] : [185, 28, 28]
                else d.cell.styles.fillColor = [37, 99, 235]
            }
        },
    })

    doc.save(`${filename}.pdf`)
}

export default function ReportsModule() {
    const { t, language, formatCurrency, exchangeRate } = useTranslation()
    const [entries, setEntries] = useState([])
    const [tenants, setTenants] = useState([])
    const [properties, setProperties] = useState([])
    const [filters, setFilters] = useState({
        tenant_id: '', property_id: '', type: '', status: '',
        date_mode: 'all', // 'all', 'month', 'year', 'range'
        month: new Date().toISOString().substring(0, 7),
        year: new Date().getFullYear().toString(),
        month_start: new Date().toISOString().substring(0, 7),
        month_end: new Date().toISOString().substring(0, 7),
    })
    const [loading, setLoading] = useState(false)
    const [exporting, setExporting] = useState('')
    const [activeTab, setActiveTab] = useState('finances') // 'finances', 'projections'
    const [projections, setProjections] = useState([])
    const [loadingProjections, setLoadingProjections] = useState(false)

    const fmt = useCallback(v => formatCurrency(v), [formatCurrency])

    const fmtDate = useCallback(d => {
        if (!d) return '—'
        return new Date(d + 'T00:00').toLocaleDateString(language === 'es' ? 'es-PE' : 'en-US')
    }, [language])

    useEffect(() => { loadAll() }, [])

    async function loadAll() {
        setLoading(true)
        try {
            const [fin, ten, props] = await Promise.all([
                api.finances.getAll().catch(() => []),
                api.tenants.getAll().catch(() => []),
                api.properties.getAll().catch(() => []),
            ])
            setEntries(fin || [])
            setTenants(ten || [])
            setProperties(props || [])
        } catch (err) {
            console.error("Reports Load Error:", err)
        } finally { setLoading(false) }
    }

    async function loadProjections() {
        setLoadingProjections(true)
        try {
            const data = await api.contracts.getProjections()
            setProjections(data || [])
        } catch (err) {
            console.error("Projections Load Error:", err)
        } finally { setLoadingProjections(false) }
    }

    useEffect(() => {
        if (activeTab === 'projections' && projections.length === 0) {
            loadProjections()
        }
    }, [activeTab])

    const filtered = (entries || []).filter(e => {
        if (!e) return false
        if (filters.tenant_id && String(e.tenant_id) !== filters.tenant_id) return false
        if (filters.property_id && String(e.property_id) !== filters.property_id) return false
        if (filters.type && e.type !== filters.type) return false
        if (filters.status && e.status !== filters.status) return false

        // Use either due_date or payment_date for filtering
        const date = e.payment_date || e.due_date || ''
        if (!date) return filters.date_mode === 'all' // Only show if explicitly asking for all

        if (filters.date_mode === 'month') {
            if (filters.month && !date.startsWith(filters.month)) return false
        } else if (filters.date_mode === 'year') {
            if (filters.year && !date.startsWith(filters.year)) return false
        } else if (filters.date_mode === 'range') {
            const m = date.substring(0, 7)
            if (filters.month_start && m < filters.month_start) return false
            if (filters.month_end && m > filters.month_end) return false
        }
        return true
    })

    const totalIn = (filtered || [])
        .filter(e => e?.type === 'ingreso' && e?.status === 'pagado')
        .reduce((a, b) => a + (Number(b?.amount || 0) + Number(b?.late_fee || 0)), 0)

    const totalOut = (filtered || [])
        .filter(e => e?.type === 'egreso' && e?.status === 'pagado')
        .reduce((a, b) => a + (Number(b?.amount || 0) + Number(b?.late_fee || 0)), 0)

    const pendingIn = (filtered || [])
        .filter(e => e?.type === 'ingreso' && (e?.status === 'pendiente' || e?.status === 'vencido'))
        .reduce((a, b) => a + (Number(b?.amount || 0) + Number(b?.late_fee || 0)), 0)

    const pendingOut = (filtered || [])
        .filter(e => e?.type === 'egreso' && (e?.status === 'pendiente' || e?.status === 'vencido'))
        .reduce((a, b) => a + (Number(b?.amount || 0) + Number(b?.late_fee || 0)), 0)

    async function doExcel() {
        setExporting('excel')
        const ER = exchangeRate || 3.8
        const preppedRows = filtered.map(r => ({
            ...r,
            converted_amount: language === 'en' ? (Number(r.amount) / ER) : Number(r.amount),
            converted_late_fee: language === 'en' ? (Number(r.late_fee || 0) / ER) : Number(r.late_fee || 0),
            language // Pass language to the exporter
        }))
        try { await exportExcel(preppedRows, t, `EasyRent_Report_${filters.month || 'full'}`) }
        finally { setExporting('') }
    }
    async function doPDF() {
        setExporting('pdf')
        try {
            const fLabel = {
                tenant: tenants.find(t_obj => String(t_obj.id) === filters.tenant_id)?.full_name,
                property: properties.find(p => String(p.id) === filters.property_id)?.name,
                month: filters.date_mode === 'month' ? filters.month : filters.date_mode === 'year' ? filters.year : `${filters.month_start} - ${filters.month_end}`,
            }
            await exportPDF(filtered, fLabel, t, language, formatCurrency, `EasyRent_Report_${fLabel.month}`)
        } finally { setExporting('') }
    }

    const set = (k, v) => setFilters(f => ({ ...f, [k]: v }))

    return (
        <div className="p-6 w-full mx-auto space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('reports.title')}</h1>
                    <p className="text-sm text-slate-500">{activeTab === 'finances' ? `${filtered.length} ${t('finances.registered_plural')}` : 'Proyección próximos 12 meses'}</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={doExcel} disabled={exporting !== '' || filtered.length === 0} className="btn-success min-w-[140px]">
                        {exporting === 'excel' ? <Loader2 size={15} className="animate-spin" /> : <FileSpreadsheet size={15} />}
                        {t('reports.export')} Excel
                    </button>
                    <button onClick={doPDF} disabled={exporting !== '' || filtered.length === 0} className="btn-danger min-w-[140px]">
                        {exporting === 'pdf' ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                        {t('reports.export')} PDF
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-700">
                <button onClick={() => setActiveTab('finances')} className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${activeTab === 'finances' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                    {t('finances.title')}
                </button>
                <button onClick={() => setActiveTab('projections')} className={`px-6 py-3 font-bold text-sm transition-all border-b-2 ${activeTab === 'projections' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                    Proyecciones
                </button>
            </div>

            {activeTab === 'finances' ? (
                <>
                    {/* Filters */}
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Filter size={15} className="text-slate-400" />
                            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('reports.filters.period')}</h2>
                            <button onClick={() => setFilters({ tenant_id: '', property_id: '', type: '', status: '', date_mode: 'month', month: '', year: '', month_start: '', month_end: '' })} className="ml-auto text-xs text-blue-500 hover:text-blue-600">{t('sidebar.cloud')}</button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-7 gap-4 items-end">
                            <div>
                                <label className="label">{t('tenants.table.tenant')}</label>
                                <select className="select text-sm" value={filters.tenant_id} onChange={e => set('tenant_id', e.target.value)}>
                                    <option value="">{t('common.all')}</option>
                                    {tenants.map(t_obj => <option key={t_obj.id} value={t_obj.id}>{t_obj.full_name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="label">{t('properties.title')}</label>
                                <select className="select text-sm" value={filters.property_id} onChange={e => set('property_id', e.target.value)}>
                                    <option value="">{t('common.all')}</option>
                                    {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="label">{t('finances.form.type')}</label>
                                <select className="select text-sm" value={filters.type} onChange={e => set('type', e.target.value)}>
                                    <option value="">{t('common.all')}</option>
                                    <option value="ingreso">{t('finances.types.ingreso')}</option>
                                    <option value="egreso">{t('finances.types.egreso')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">{t('common.status')}</label>
                                <select className="select text-sm" value={filters.status} onChange={e => set('status', e.target.value)}>
                                    <option value="">{t('common.all')}</option>
                                    {['pagado', 'pendiente', 'vencido', 'anulado'].map(s => <option key={s} value={s}>{t(`finances.status.${s}`) || s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="label">{t('reports.filters.period')}</label>
                                <select className="select text-sm" value={filters.date_mode} onChange={e => set('date_mode', e.target.value)}>
                                    <option value="all">{t('common.all')}</option>
                                    <option value="month">{t('dashboard.filters.thisMonth')}</option>
                                    <option value="year">{t('dashboard.filters.thisYear')}</option>
                                    <option value="range">{t('dashboard.filters.custom')}</option>
                                </select>
                            </div>
                            {filters.date_mode === 'month' && (
                                <div>
                                    <label className="label">{t('dashboard.filters.thisMonth')}</label>
                                    <input className="input text-sm" type="month" value={filters.month} onChange={e => set('month', e.target.value)} />
                                </div>
                            )}
                            {filters.date_mode === 'year' && (
                                <div>
                                    <label className="label">{t('dashboard.filters.thisYear')}</label>
                                    <input className="input text-sm" type="number" placeholder="2025" value={filters.year} onChange={e => set('year', e.target.value)} />
                                </div>
                            )}
                            {filters.date_mode === 'range' && (
                                <>
                                    <div>
                                        <label className="label">{t('common.previous')}</label>
                                        <input className="input text-sm" type="month" value={filters.month_start} onChange={e => set('month_start', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="label">{t('common.next')}</label>
                                        <input className="input text-sm" type="month" value={filters.month_end} onChange={e => set('month_end', e.target.value)} />
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>

                    {/* Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="card p-4 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center"><Download size={15} className="text-white" /></div>
                            <div>
                                <p className="text-sm font-bold text-slate-800 dark:text-white">{fmt(totalIn)}</p>
                                <p className="text-xs text-slate-400">{t('finances.stats.realizedIncome')}</p>
                                <p className="text-[10px] text-slate-500">{t('finances.stats.pendingIncome')}: {fmt(pendingIn)}</p>
                            </div>
                        </div>
                        <div className="card p-4 flex items-center gap-3 border-2 border-blue-200 dark:border-blue-900/30">
                            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center"><FileText size={15} className="text-white" /></div>
                            <div><p className="text-sm font-bold text-slate-800 dark:text-white">{fmt((filtered || []).reduce((a, b) => a + Number(b?.tax_amount || 0), 0))}</p><p className="text-xs text-slate-400">Total Impuestos</p></div>
                        </div>
                        <div className="card p-4 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center"><Download size={15} className="text-white" /></div>
                            <div>
                                <p className="text-sm font-bold text-slate-800 dark:text-white">{fmt(totalOut)}</p>
                                <p className="text-xs text-slate-400">{t('finances.stats.realizedExpense')}</p>
                                <p className="text-[10px] text-slate-500">{t('finances.stats.pendingExpense')}: {fmt(pendingOut)}</p>
                            </div>
                        </div>
                        <div className={`card p-4 flex items-center gap-3 border-2 ${totalIn - totalOut >= 0 ? 'border-emerald-200 dark:border-emerald-800' : 'border-red-200 dark:border-red-800'}`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${totalIn - totalOut >= 0 ? 'bg-green-600' : 'bg-red-500'}`}><BarChart3 size={15} className="text-white" /></div>
                            <div><p className="text-sm font-bold text-slate-800 dark:text-white">{fmt(totalIn - totalOut)}</p><p className="text-xs text-slate-400">{t('dashboard.stats.netProfit')}</p></div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="card overflow-hidden">
                        <div className="table-wrapper max-h-[75vh] overflow-y-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>{t('finances.form.type')}</th>
                                        <th>{t('finances.form.category')}</th>
                                        <th>{t('properties.title')}</th>
                                        <th>{t('tenants.title')}</th>
                                        <th className="text-right">{t('finances.table.totalAmount')}</th>
                                        <th className="text-center">{t('common.status')}</th>
                                        <th>{t('finances.form.dueDate')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length === 0 && <tr><td colSpan={7} className="text-center py-10 text-slate-400">{t('reports.noData')}</td></tr>}
                                    {filtered.map(r => (
                                        <tr key={r.id}>
                                            <td><span className={`badge ${r.type === 'ingreso' ? 'badge-green' : 'badge-red'}`}>{t(`finances.types.${r.type}`) || r.type}</span></td>
                                            <td>{t(`finances.categories.${r.category}`) || r.category}</td>
                                            <td>{r.property_name || '—'}</td>
                                            <td>{r.tenant_name || '—'}</td>
                                            <td className="text-right font-bold">{fmt(Number(r.amount) + Number(r.late_fee || 0))}</td>
                                            <td className="text-center"><span className={`badge badge-${r.status === 'pagado' ? 'green' : 'yellow'}`}>{t(`finances.status.${r.status}`) || r.status}</span></td>
                                            <td>{fmtDate(r.due_date)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div className="space-y-6">
                    {loadingProjections ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="animate-spin text-blue-500" size={30} />
                            <p className="text-sm text-slate-400">Calculando proyección financiera...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            <div className="card p-6 bg-slate-50 dark:bg-slate-800/50 border-2 border-blue-100 dark:border-blue-900/30">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Ingresos Estimados (12 Meses)</h3>
                                <div className="space-y-5">
                                    {projections.map((p, i) => {
                                        if (!p || !p.month) return null
                                        const values = (projections || []).map(x => (Number(x?.PEN || 0) + (Number(x?.USD || 0) * 3.7)))
                                        const maxAmount = Math.max(...values, 1)
                                        const currentVal = (Number(p?.PEN || 0) + (Number(p?.USD || 0) * 3.7))
                                        const percent = (currentVal / maxAmount) * 100
                                        return (
                                            <div key={p.month} className="space-y-1.5 text-xs">
                                                <div className="flex justify-between font-bold">
                                                    <span className="text-slate-500 uppercase">{new Date(p.month + '-02').toLocaleDateString(language === 'es' ? 'es-PE' : 'en-US', { month: 'long', year: 'numeric' })}</span>
                                                    <span className="text-blue-600">{fmt(p.PEN || 0)} {p.USD > 0 && `+ ${formatCurrency(p.USD, 'USD')}`}</span>
                                                </div>
                                                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                                                    <motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }} transition={{ delay: i * 0.05 }} className="h-full bg-blue-500" />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="card p-6 flex flex-col items-center justify-center text-center">
                                    <p className="text-slate-500 text-xs font-bold uppercase mb-1">Total Estimado PEN</p>
                                    <h2 className="text-2xl font-black text-slate-800 dark:text-white">{fmt((projections || []).reduce((a, b) => a + (b?.PEN || 0), 0))}</h2>
                                </div>
                                <div className="card p-6 flex flex-col items-center justify-center text-center border-2 border-blue-500/20">
                                    <p className="text-slate-500 text-xs font-bold uppercase mb-1">Total Estimado USD</p>
                                    <h2 className="text-2xl font-black text-blue-600">{formatCurrency((projections || []).reduce((a, b) => a + (b?.USD || 0), 0), 'USD')}</h2>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

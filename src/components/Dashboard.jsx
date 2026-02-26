import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Building2, Users, FileText, TrendingUp, TrendingDown,
    AlertTriangle, Plus, Clock, CheckCircle2
} from 'lucide-react'
import { api } from '../services/ApiService'
import { useTranslation } from '../context/LanguageContext'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

function StatCard({ icon: Icon, label, value, sub, color, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.35 }}
            className="stat-card"
        >
            <div className="flex items-start justify-between">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${color}`}>
                    <Icon size={20} className="text-white" />
                </div>
            </div>
            <div>
                <p className="text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
                {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>}
            </div>
        </motion.div>
    )
}

function ContractAlert({ contract, fmtDate }) {
    const { t } = useTranslation();
    const days = Math.round(contract.days_remaining)
    const isExpired = days < 0
    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex items-start gap-3 p-3 rounded-xl border ${isExpired
                ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                : 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800'
                }`}
        >
            <AlertTriangle size={16} className={`mt-0.5 shrink-0 ${isExpired ? 'text-red-500' : 'text-amber-500'}`} />
            <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{contract.tenant_name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{contract.property_name}</p>
                <p className={`text-xs font-semibold mt-0.5 ${isExpired ? 'text-red-600' : 'text-amber-600'}`}>
                    {isExpired
                        ? t('dashboard.alerts.expiredDaysAgo', { days: Math.abs(days) })
                        : t('dashboard.alerts.expiresInDays', { days })}
                    {' · '}{fmtDate(contract.end_date)}
                </p>
            </div>
        </motion.div>
    )
}

function OverduePayment({ finance, formatCurrency, fmtDate }) {
    const { t } = useTranslation()
    return (
        <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <div className="min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{finance.tenant_name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t('finances.table.due')}: {fmtDate(finance.due_date)}</p>
            </div>
            <span className="badge badge-red shrink-0 ml-2">{formatCurrency(Number(finance.amount) + Number(finance.late_fee || 0))}</span>
        </div>
    )
}

export default function Dashboard() {
    const { t, language, formatCurrency } = useTranslation()
    const [loading, setLoading] = useState(true)
    const [contracts, setContracts] = useState([])
    const [overdue, setOverdue] = useState([])
    const [finances, setFinances] = useState([])
    const [properties, setProperties] = useState([])
    const [tenants, setTenants] = useState([])
    const [typeFilter, setTypeFilter] = useState('todos')
    const [timeRange, setTimeRange] = useState('month') // 'month', 'year', 'total', 'custom'
    const [customRange, setCustomRange] = useState({ start: '', end: '' })

    const fmtDate = (d) => {
        if (!d) return '—'
        return new Date(d + 'T00:00').toLocaleDateString(language === 'es' ? 'es-PE' : 'en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    useEffect(() => {
        setLoading(true)
        Promise.all([
            api.properties.getAll().catch(() => []),
            api.tenants.getAll().catch(() => []),
            api.contracts.getAll().catch(() => []),
            api.finances.getAll().catch(() => []),
        ]).then(([props, tens, conts, fins]) => {
            setProperties(props || [])
            setTenants(tens || [])
            setContracts(conts || [])
            setFinances(fins || [])
        }).catch(err => {
            console.error("Dashboard Load Error:", err)
        }).finally(() => setLoading(false))
    }, [])

    const matchesFilter = (propertyId) => {
        if (typeFilter === 'todos') return true
        if (!properties || properties.length === 0) return true // Resilience: show all if props haven't loaded
        const p = properties.find(x => x.id === propertyId)
        return p && p.type === typeFilter
    }

    const filteredProperties = typeFilter === 'todos' ? properties : properties.filter(p => p.type === typeFilter)

    const contractsList = (contracts || []).filter(c => matchesFilter(c.property_id))
    const activeContracts = contractsList.filter(c => c.status === 'activo')

    const alertContracts = contractsList.filter(c => c.days_remaining <= 15)

    const overdueList = (finances || []).filter(f => {
        if (f.type !== 'ingreso') return false
        if (f.status !== 'pendiente' && f.status !== 'vencido') return false
        if (!f.due_date) return false

        // Use normalized date for comparison
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const due = new Date(f.due_date + 'T00:00')

        // Include if explicitly marked 'vencido' OR if 'pendiente' and date passed
        const shouldShow = f.status === 'vencido' || due < today

        return shouldShow && matchesFilter(f.property_id)
    })

    // Filter finances by date range
    const filteredByTimeFinances = (finances || []).filter(f => {
        if (!matchesFilter(f.property_id)) return false
        const dateStr = f.payment_date || f.due_date || ''
        if (!dateStr) return false

        const date = new Date(dateStr + 'T00:00')
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (timeRange === 'month') {
            return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear()
        }
        if (timeRange === 'year') {
            return date.getFullYear() === today.getFullYear()
        }
        if (timeRange === 'custom' && customRange.start && customRange.end) {
            const start = new Date(customRange.start + 'T00:00')
            const end = new Date(customRange.end + 'T23:59:59')
            return date >= start && date <= end
        }
        return true // 'total' or fallback
    })

    const incomeFiltered = (filteredByTimeFinances || [])
        .filter(f => f && f.type === 'ingreso' && f.status === 'pagado')
        .reduce((sum, f) => sum + (Number(f?.amount) || 0) + (Number(f?.late_fee) || 0), 0)

    const incomePending = (filteredByTimeFinances || [])
        .filter(f => f && f.type === 'ingreso' && (f.status === 'pendiente' || f.status === 'vencido'))
        .reduce((sum, f) => sum + (Number(f?.amount) || 0) + (Number(f?.late_fee) || 0), 0)

    const expensesFiltered = (filteredByTimeFinances || [])
        .filter(f => f && f.type === 'egreso' && f.status === 'pagado')
        .reduce((sum, f) => sum + (Number(f?.amount) || 0) + (Number(f?.late_fee) || 0), 0)

    const expensesPending = (filteredByTimeFinances || [])
        .filter(f => f && f.type === 'egreso' && (f.status === 'pendiente' || f.status === 'vencido'))
        .reduce((sum, f) => sum + (Number(f?.amount) || 0) + (Number(f?.late_fee) || 0), 0)

    const netProfit = incomeFiltered - expensesFiltered

    const totalTenantsCount = tenants?.length || 0
    const filteredTenantsCount = typeFilter === 'todos'
        ? totalTenantsCount
        : new Set((activeContracts || []).map(c => c.tenant_id)).size

    const propTypes = ['casa', 'departamento', 'tienda', 'terreno', 'local', 'oficina', 'edificio', 'depósito', 'otro']
    const typeLabel = { casa: '🏠', departamento: '🏢', tienda: '🛍️', terreno: '🌳', local: '🏪', oficina: '🏛️', edificio: '🏢', 'depósito': '📦', otro: '🏢' }

    const timeRanges = [
        { id: 'month', label: t('dashboard.filters.thisMonth') },
        { id: 'year', label: t('dashboard.filters.thisYear') },
        { id: 'total', label: t('dashboard.filters.total') },
        { id: 'custom', label: t('dashboard.filters.custom') },
    ]

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 font-medium animate-pulse">{t('common.loading')}</p>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6 w-full mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('dashboard.title')}</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{t('dashboard.subtitle')}</p>
                </div>
                <Link to="/propiedades/nueva" className="btn-primary">
                    <Plus size={16} /> {t('dashboard.newProperty')}
                </Link>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between pb-2">
                {/* Type Filter Chips */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setTypeFilter('todos')}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${typeFilter === 'todos' ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700 hover:bg-slate-50'}`}
                    >
                        {t('common.all')}
                    </button>
                    {propTypes.map(type => (
                        <button
                            key={type}
                            onClick={() => setTypeFilter(type)}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${typeFilter === type ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-700 hover:bg-slate-50'}`}
                        >
                            {typeLabel[type]} {t(`properties.types.${type}`)} ({properties.filter(p => p.type === type).length})
                        </button>
                    ))}
                </div>

                {/* Time Range Filter */}
                <div className="flex flex-wrap items-center gap-2 bg-slate-100/50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
                    {timeRanges.map(r => (
                        <button
                            key={r.id}
                            onClick={() => setTimeRange(r.id)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${timeRange === r.id
                                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Custom Range Inputs */}
            <AnimatePresence>
                {timeRange === 'custom' && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="flex items-center gap-4 p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest">{t('dashboard.filters.from')}</span>
                                <input
                                    type="date"
                                    className="input !py-1.5 !px-3 text-sm !bg-white dark:!bg-slate-800 border-blue-100"
                                    value={customRange.start}
                                    onChange={e => setCustomRange(r => ({ ...r, start: e.target.value }))}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest">{t('dashboard.filters.to')}</span>
                                <input
                                    type="date"
                                    className="input !py-1.5 !px-3 text-sm !bg-white dark:!bg-slate-800 border-blue-100"
                                    value={customRange.end}
                                    onChange={e => setCustomRange(r => ({ ...r, end: e.target.value }))}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <StatCard icon={Building2} label={t('dashboard.stats.properties')} value={filteredProperties.length} color="bg-blue-500" delay={0} />
                <StatCard icon={Users} label={t('dashboard.stats.tenants')} value={filteredTenantsCount} color="bg-violet-500" delay={0.05} />
                <StatCard icon={FileText} label={t('dashboard.stats.contracts')} value={activeContracts.length} color="bg-emerald-500" delay={0.1} />
                <StatCard
                    icon={TrendingUp}
                    label={t('finances.stats.realizedIncome')}
                    value={formatCurrency(incomeFiltered)}
                    sub={`${t('finances.stats.pendingIncome')}: ${formatCurrency(incomePending)}`}
                    color="bg-teal-500"
                    delay={0.15}
                />
                <StatCard
                    icon={TrendingDown}
                    label={t('finances.stats.realizedExpense')}
                    value={formatCurrency(expensesFiltered)}
                    sub={`${t('finances.stats.pendingExpense')}: ${formatCurrency(expensesPending)}`}
                    color="bg-orange-500"
                    delay={0.2}
                />
                <StatCard
                    icon={netProfit >= 0 ? TrendingUp : TrendingDown}
                    label={t('dashboard.stats.netProfit')}
                    value={formatCurrency(netProfit)}
                    color={netProfit >= 0 ? 'bg-green-600' : 'bg-red-500'}
                    delay={0.25}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 card p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('dashboard.charts.financialSummary')}</h2>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                            {timeRange === 'month' ? t('dashboard.charts.dailyView') : t('dashboard.charts.monthlyView')}
                        </span>
                    </div>
                    <ChartSection finances={filteredByTimeFinances} rangeType={timeRange === 'month' ? 'daily' : 'monthly'} formatCurrency={formatCurrency} />
                </div>

                {/* Alerts panel */}
                <div className="space-y-4">
                    {/* Contract alerts */}
                    <div className="card p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Clock size={15} className="text-amber-500" />
                            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('dashboard.alerts.contractsExpiring')}</h2>
                            {alertContracts.length > 0 && (
                                <span className="ml-auto badge badge-yellow">{alertContracts.length}</span>
                            )}
                        </div>
                        {alertContracts.length === 0 ? (
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm">
                                <CheckCircle2 size={15} /> {t('dashboard.alerts.noAlerts')}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {alertContracts.slice(0, 4).map(c => <ContractAlert key={c.id} contract={c} fmtDate={fmtDate} />)}
                            </div>
                        )}
                    </div>

                    {/* Overdue */}
                    <div className="card p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle size={15} className="text-red-500" />
                            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('dashboard.alerts.overduePayments')}</h2>
                            {overdueList.length > 0 && (
                                <span className="ml-auto badge badge-red">{overdueList.length}</span>
                            )}
                        </div>
                        {overdueList.length === 0 ? (
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm">
                                <CheckCircle2 size={15} /> {t('dashboard.alerts.upToDate')}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {overdueList.map(f => <OverduePayment key={f.id} finance={f} formatCurrency={formatCurrency} fmtDate={fmtDate} />)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function ChartSection({ finances, rangeType, formatCurrency }) {
    const { t, language } = useTranslation();
    const groups = {}
    finances.forEach(f => {
        let key = ''
        const dateStr = (f.payment_date || f.due_date || '').substring(0, 10)
        if (!dateStr) return

        if (rangeType === 'daily') {
            key = dateStr
        } else {
            // Group by Year-Month
            key = dateStr.substring(0, 7)
        }

        if (!groups[key]) groups[key] = { key, ingreso: 0, egreso: 0 }
        groups[key][f.type] = (groups[key][f.type] || 0) + f.amount
    })

    const data = Object.values(groups).sort((a, b) => a.key.localeCompare(b.key))

    if (data.length === 0) {
        return <div className="h-40 flex items-center justify-center text-slate-400 text-sm italic">{t('common.noData')}</div>
    }

    // Fallback if chart doesn't render well or needs table view
    return (
        <div className="space-y-4">
            <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={data} margin={{ left: 0, right: 0, top: 4, bottom: 0 }}>
                    <defs>
                        <linearGradient id="gIn" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gOut" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                    <XAxis
                        dataKey="key"
                        tick={{ fontSize: 10, fontWeight: 600 }}
                        tickFormatter={d => {
                            if (rangeType === 'daily') return d.substring(8)
                            const [y, m] = d.split('-')
                            const monthNames = language === 'es'
                                ? ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
                                : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                            return monthNames[parseInt(m) - 1]
                        }}
                    />
                    <YAxis tick={{ fontSize: 10, fontWeight: 600 }} width={40} />
                    <Tooltip
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        formatter={(v, n) => [formatCurrency(v), n === 'ingreso' ? t('finance.details.income') : t('finance.details.expense')]}
                    />
                    <Area type="monotone" dataKey="ingreso" stroke="#10b981" fill="url(#gIn)" strokeWidth={3} />
                    <Area type="monotone" dataKey="egreso" stroke="#f97316" fill="url(#gOut)" strokeWidth={3} />
                </AreaChart>
            </ResponsiveContainer>

            {/* Hidden Table Fallback (for accessibility or if needed) */}
            <div className="sr-only">
                <table>
                    <thead>
                        <tr><th>{t('finance.period')}</th><th>{t('finance.details.income')}</th><th>{t('finance.details.expense')}</th></tr>
                    </thead>
                    <tbody>
                        {data.map(d => (
                            <tr key={d.key}><td>{d.key}</td><td>{d.ingreso}</td><td>{d.egreso}</td></tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

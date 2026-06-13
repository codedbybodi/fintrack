import { useState, useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import { getMonthly, getTransactions, getMe } from '../services/api'
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts'
import { TrendingUp, TrendingDown, Wallet, Plus, ArrowUpDown } from 'lucide-react'
import AddTransactionModal from '../components/AddTransactionsModal'

const PERIODS = ['This month', 'Last month', 'This year']

const CATEGORY_COLORS = {
    Food: '#00d084',
    Transport: '#4d9fff',
    Rent: '#ff5555',
    Shopping: '#f5a623',
    Entertainment: '#a855f7',
    Health: '#06b6d4',
    Education: '#84cc16',
    Salary: '#00d084',
    Freelance: '#4d9fff',
    Other: '#6b7280',
}

const formatEGP = (val) =>
    new Intl.NumberFormat('en-EG', { maximumFractionDigits: 0 }).format(val)

const formatCompact = (val) => {
    if (val >= 1000) return `${(val / 1000).toFixed(1).replace(/\.0$/, '')}k`
    return formatEGP(val)
}

const formatTxDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en', { month: 'short', day: 'numeric' })

function getCategoryColor(category) {
    return CATEGORY_COLORS[category] || '#6b7280'
}

function getPeriodRange(period) {
    const now = new Date()
    if (period === 'Last month') {
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const end = new Date(now.getFullYear(), now.getMonth(), 0)
        return { start, end }
    }
    if (period === 'This year') {
        return {
            start: new Date(now.getFullYear(), 0, 1),
            end: new Date(now.getFullYear(), 11, 31),
        }
    }
    return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 0),
    }
}

function getPreviousPeriodRange(period) {
    const now = new Date()
    if (period === 'Last month') {
        const start = new Date(now.getFullYear(), now.getMonth() - 2, 1)
        const end = new Date(now.getFullYear(), now.getMonth() - 1, 0)
        return { start, end }
    }
    if (period === 'This year') {
        return {
            start: new Date(now.getFullYear() - 1, 0, 1),
            end: new Date(now.getFullYear() - 1, 11, 31),
        }
    }
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const end = new Date(now.getFullYear(), now.getMonth(), 0)
    return { start, end }
}

function getComparisonLabel(period) {
    if (period === 'This year') return 'vs last year'
    if (period === 'Last month') return 'vs prior month'
    return 'vs last month'
}

function filterByRange(transactions, start, end) {
    return transactions.filter(t => {
        const d = new Date(t.date)
        return d >= start && d <= end
    })
}

function computeSummary(transactions) {
    const total_income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
    const total_expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)
    return {
        balance: total_income - total_expenses,
        total_income,
        total_expenses,
    }
}

function computeCategories(transactions) {
    const totals = {}
    transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            totals[t.category] = (totals[t.category] || 0) + t.amount
        })
    return Object.entries(totals)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount)
}

function pctChange(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
}

function formatChangeText(pct, label) {
    const sign = pct >= 0 ? '+' : ''
    return `${sign}${pct.toFixed(1)}% ${label}`
}

function StatCard({ label, value, icon, color, change, positive, showSign, stable }) {
    let displayValue = formatEGP(Math.abs(value))
    if (showSign) {
        displayValue = value >= 0
            ? `+${formatEGP(value)}`
            : `-${formatEGP(Math.abs(value))}`
    }

    return (
        <div className="bg-[#0d0d14] border border-[#1a1a28] rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-[10px] text-[#8888aa] uppercase tracking-wider mb-2">
                {icon} {label}
            </div>
            <div className={`font-mono text-xl font-medium tracking-tight ${color}`}>
                {displayValue}
                <span className="text-xs ml-1 opacity-50">EGP</span>
            </div>
            {stable ? (
                <div className="text-xs mt-1.5 flex items-center gap-1 text-brand-green">
                    <ArrowUpDown size={11} />
                    — Stable
                </div>
            ) : (
                <div className={`text-xs mt-1.5 flex items-center gap-1
                    ${positive ? 'text-brand-green' : 'text-brand-red'}`}>
                    {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                    {change}
                </div>
            )}
        </div>
    )
}

function TransactionRow({ tx }) {
    const catColor = getCategoryColor(tx.category)
    const isIncome = tx.type === 'income'

    return (
        <div className="flex items-center gap-3 py-3">
            <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: catColor + '20' }}
            >
                <span className="text-sm font-semibold" style={{ color: catColor }}>
                    {tx.category?.[0] ?? '?'}
                </span>
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#d0d0e8] truncate">{tx.title}</p>
                <p className="text-xs text-[#555570]">{tx.category}</p>
            </div>
            <p className="text-xs text-[#444460] hidden sm:block">{formatTxDate(tx.date)}</p>
            <p className={`font-mono text-sm font-medium ${isIncome ? 'text-brand-green' : 'text-brand-red'}`}>
                {isIncome ? '+' : '-'}{formatEGP(tx.amount)} EGP
            </p>
        </div>
    )
}

export default function Dashboard() {
    const [rawTransactions, setRawTransactions] = useState([])
    const [allMonthly, setAllMonthly] = useState([])
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [timeFilter, setTimeFilter] = useState('This month')

    const fetchAll = async () => {
        setLoading(true)
        try {
            const [m, t, u] = await Promise.all([
                getMonthly(), getTransactions(), getMe()
            ])
            setAllMonthly(m.data)
            setRawTransactions(t.data)
            setUser(u.data)
        } catch (err) {
            if (err.response?.status === 401) {
                localStorage.removeItem('token')
                window.location.href = '/login'
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchAll() }, [])

    const { start, end } = getPeriodRange(timeFilter)
    const prevRange = getPreviousPeriodRange(timeFilter)
    const comparisonLabel = getComparisonLabel(timeFilter)

    const filteredTransactions = useMemo(
        () => filterByRange(rawTransactions, start, end),
        [rawTransactions, start, end]
    )

    const previousTransactions = useMemo(
        () => filterByRange(rawTransactions, prevRange.start, prevRange.end),
        [rawTransactions, prevRange.start, prevRange.end]
    )

    const summary = useMemo(
        () => computeSummary(filteredTransactions),
        [filteredTransactions]
    )

    const prevSummary = useMemo(
        () => computeSummary(previousTransactions),
        [previousTransactions]
    )

    const categories = useMemo(
        () => computeCategories(filteredTransactions),
        [filteredTransactions]
    )

    const monthly = useMemo(() => allMonthly.slice(-6), [allMonthly])

    const recentTransactions = useMemo(() => {
        return [...filteredTransactions]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5)
    }, [filteredTransactions])

    const totalSpent = categories.reduce((sum, c) => sum + c.amount, 0)

    const balanceChange = pctChange(summary.balance, prevSummary.balance)
    const incomeChange = pctChange(summary.total_income, prevSummary.total_income)
    const expenseChange = pctChange(summary.total_expenses, prevSummary.total_expenses)

    const incomeStable = Math.abs(incomeChange) < 1

    const now = new Date()
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-6 h-6 border-2 border-brand-green border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    const today = new Date().toLocaleDateString('en-EN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })

    const formatMonthTick = (v) => {
        const [y, m] = v.split('-')
        return new Date(y, m - 1).toLocaleDateString('en', { month: 'short' })
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-xl font-semibold text-white">
                        Good morning, {user?.name?.split(' ')[0]}
                    </h1>
                    <p className="text-sm text-[#555570] mt-0.5">{today}</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-brand-green text-[#0a0a0f] font-semibold px-4 py-2.5 rounded-lg text-sm hover:bg-[#00b873] transition-colors"
                >
                    <Plus size={15} />
                    Add transaction
                </button>
            </div>

            <div className="flex gap-1 mb-5">
                {PERIODS.map(period => (
                    <button
                        key={period}
                        type="button"
                        onClick={() => setTimeFilter(period)}
                        className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors
                            ${timeFilter === period
                                ? 'bg-[#0f2a1e] text-brand-green'
                                : 'text-[#555570] hover:text-[#8888aa]'
                            }`}
                    >
                        {period}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
                <StatCard
                    label="Net Balance"
                    value={summary.balance}
                    icon={<Wallet size={13} />}
                    color={summary.balance >= 0 ? 'text-brand-green' : 'text-brand-red'}
                    change={formatChangeText(balanceChange, comparisonLabel)}
                    positive={balanceChange >= 0}
                    showSign
                />
                <StatCard
                    label="Total Income"
                    value={summary.total_income}
                    icon={<TrendingUp size={13} className="text-brand-green" />}
                    color="text-white"
                    stable={incomeStable}
                    change={formatChangeText(incomeChange, comparisonLabel)}
                    positive={incomeChange >= 0}
                />
                <StatCard
                    label="Total Expenses"
                    value={summary.total_expenses}
                    icon={<TrendingUp size={13} className="text-brand-red" />}
                    color="text-brand-red"
                    change={formatChangeText(expenseChange, comparisonLabel)}
                    positive={expenseChange <= 0}
                />
            </div>

            <div className="grid grid-cols-5 gap-3 mb-5">
                <div className="col-span-2 bg-[#0d0d14] border border-[#1a1a28] rounded-xl p-4">
                    <p className="text-xs font-semibold text-[#8888aa] uppercase tracking-wider mb-4">
                        Spending by category
                    </p>
                    {categories.length === 0 ? (
                        <div className="flex items-center justify-center h-32 text-[#555570] text-sm">
                            No data yet
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <div className="relative w-28 h-28 flex-shrink-0">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categories}
                                            dataKey="amount"
                                            nameKey="category"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={32}
                                            outerRadius={50}
                                            strokeWidth={0}
                                        >
                                            {categories.map(entry => (
                                                <Cell
                                                    key={entry.category}
                                                    fill={getCategoryColor(entry.category)}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(v) => [`${formatEGP(v)} EGP`]}
                                            contentStyle={{
                                                background: '#0d0d14',
                                                border: '1px solid #1a1a28',
                                                borderRadius: '8px',
                                                fontSize: '12px',
                                                color: '#e8e8f0',
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <span className="text-[10px] text-[#8888aa] text-center leading-tight">
                                        {formatCompact(totalSpent)}<br />spent
                                    </span>
                                </div>
                            </div>
                            <div className="flex-1 space-y-2.5">
                                {categories.slice(0, 5).map(item => (
                                    <div
                                        key={item.category}
                                        className="flex items-center justify-between gap-2"
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div
                                                className="w-2 h-2 rounded-full flex-shrink-0"
                                                style={{ background: getCategoryColor(item.category) }}
                                            />
                                            <span className="text-xs text-[#9090b0] truncate">
                                                {item.category}
                                            </span>
                                        </div>
                                        <span className="text-sm font-mono text-[#c0c0d8] flex-shrink-0">
                                            {formatEGP(item.amount)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="col-span-3 bg-[#0d0d14] border border-[#1a1a28] rounded-xl p-4">
                    <p className="text-xs font-semibold text-[#8888aa] uppercase tracking-wider mb-4">
                        Monthly overview
                    </p>
                    {monthly.length === 0 ? (
                        <div className="flex items-center justify-center h-32 text-[#555570] text-sm">
                            No data yet
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height={160}>
                            <BarChart data={monthly} barCategoryGap="30%" barGap={4}>
                                <CartesianGrid vertical={false} stroke="#1a1a28" />
                                <XAxis
                                    dataKey="month"
                                    tickFormatter={formatMonthTick}
                                    tick={({ x, y, payload }) => {
                                        const isCurrent = payload.value === currentMonthKey
                                        return (
                                            <text
                                                x={x}
                                                y={y + 12}
                                                textAnchor="middle"
                                                fill={isCurrent ? '#00d084' : '#444460'}
                                                fontSize={11}
                                            >
                                                {formatMonthTick(payload.value)}
                                            </text>
                                        )
                                    }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis hide />
                                <Tooltip
                                    formatter={(v, n) => [`${formatEGP(v)} EGP`, n]}
                                    contentStyle={{
                                        background: '#0d0d14',
                                        border: '1px solid #1a1a28',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                        color: '#e8e8f0',
                                    }}
                                />
                                <Legend
                                    wrapperStyle={{ fontSize: '11px', color: '#6b6b8a' }}
                                />
                                <Bar
                                    dataKey="income"
                                    fill="#00d084"
                                    name="Income"
                                    radius={[4, 4, 0, 0]}
                                />
                                <Bar
                                    dataKey="expenses"
                                    fill="#ff5555"
                                    name="Expenses"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            <div className="bg-[#0d0d14] border border-[#1a1a28] rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-semibold text-[#8888aa] uppercase tracking-wider">
                        Recent transactions
                    </p>
                    <Link to="/transactions" className="text-xs text-brand-green hover:underline">
                        View all
                    </Link>
                </div>
                {recentTransactions.length === 0 ? (
                    <div className="text-center py-8 text-[#555570] text-sm">
                        No transactions yet.{' '}
                        <button
                            onClick={() => setShowModal(true)}
                            className="text-brand-green hover:underline"
                        >
                            Add your first one
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-[#12121e]">
                        {recentTransactions.map(tx => (
                            <TransactionRow key={tx.id} tx={tx} />
                        ))}
                    </div>
                )}
            </div>

            {showModal && (
                <AddTransactionModal
                    onClose={() => setShowModal(false)}
                    onSuccess={() => { setShowModal(false); fetchAll() }}
                />
            )}
        </div>
    )
}

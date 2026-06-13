import { useState, useEffect } from 'react'
import { getBudgets, createBudget, getTransactions } from '../services/api'
import { Plus, Target, X } from 'lucide-react'

const CATEGORIES = [
    'Food', 'Transport', 'Rent', 'Shopping', 'Entertainment',
    'Health', 'Education', 'Other'
]

const CATEGORY_COLORS = {
    Food: '#00d084',
    Transport: '#4d9fff',
    Rent: '#ff5555',
    Shopping: '#f5a623',
    Entertainment: '#a855f7',
    Health: '#06b6d4',
    Education: '#84cc16',
    Other: '#6b7280',
}

const INPUT_CLASS =
    'w-full bg-[#0a0a0f] border border-[#1a1a28] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#333350] focus:outline-none focus:border-brand-green transition-colors'

const SELECT_CLASS =
    'w-full bg-[#0a0a0f] border border-[#1a1a28] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-green transition-colors appearance-none cursor-pointer'

const formatEGP = (val) =>
    new Intl.NumberFormat('en-EG', { maximumFractionDigits: 0 }).format(val)

function getCategoryColor(category) {
    return CATEGORY_COLORS[category] || '#6b7280'
}

export default function Budgets() {
    const [budgets, setBudgets] = useState([])
    const [transactions, setTransactions] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)

    const fetchData = async () => {
        setLoading(true)
        try {
            const [b, t] = await Promise.all([getBudgets(), getTransactions()])
            setBudgets(b.data)
            setTransactions(t.data)
        } catch (err) {
            if (err.response?.status === 401) {
                localStorage.removeItem('token')
                window.location.href = '/login'
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [])

    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    const getSpent = (category) =>
        transactions
            .filter(t =>
                t.type === 'expense' &&
                t.category === category &&
                new Date(t.date).getMonth() + 1 === currentMonth &&
                new Date(t.date).getFullYear() === currentYear
            )
            .reduce((sum, t) => sum + t.amount, 0)

    const getStatusColor = (pct) => {
        if (pct >= 100) return '#ff5555'
        if (pct >= 75) return '#f5a623'
        return '#00d084'
    }

    const currentBudgets = budgets.filter(
        b => b.month === currentMonth && b.year === currentYear
    )

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-semibold text-white">Budgets</h1>
                    <p className="text-sm text-[#555570] mt-0.5">
                        {now.toLocaleDateString('en', { month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-brand-green text-[#0a0a0f] font-semibold px-4 py-2.5 rounded-lg text-sm hover:bg-[#00b873] transition-colors"
                >
                    <Plus size={15} />
                    Set budget
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-40">
                    <div className="w-6 h-6 border-2 border-brand-green border-t-transparent rounded-full animate-spin" />
                </div>
            ) : currentBudgets.length === 0 ? (
                <div className="bg-[#0d0d14] border border-[#1a1a28] rounded-xl p-12 text-center">
                    <Target size={36} className="text-[#333350] mx-auto mb-3" />
                    <p className="text-[#555570] text-sm mb-4">No budgets set for this month</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="text-brand-green text-sm hover:underline"
                    >
                        Set your first budget
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentBudgets.map(budget => {
                        const spent = getSpent(budget.category)
                        const limit = budget.monthly_limit
                        const pct = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0
                        const remaining = limit - spent
                        const color = getCategoryColor(budget.category)
                        const barColor = getStatusColor(pct)

                        return (
                            <div
                                key={budget.id}
                                className="bg-[#0d0d14] border border-[#1a1a28] rounded-xl p-5"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2.5">
                                        <div
                                            className="w-9 h-9 rounded-lg flex items-center justify-center"
                                            style={{ background: color + '20' }}
                                        >
                                            <span className="text-sm font-semibold" style={{ color }}>
                                                {budget.category[0]}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">{budget.category}</p>
                                            <p className="text-xs text-[#555570]">Monthly budget</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-[#9090b0]">
                                        Spent {Math.round(pct)}%
                                    </span>
                                </div>

                                <div className="mb-4">
                                    <div className="h-1.5 rounded-full bg-[#1a1a28] overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{ width: `${pct}%`, background: barColor }}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-xs text-[#555570] mb-0.5">Spent</p>
                                        <p className="font-mono text-sm font-medium text-white">
                                            {formatEGP(spent)} EGP
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-[#555570] mb-0.5">
                                            {remaining >= 0 ? 'Remaining' : 'Over by'}
                                        </p>
                                        <p className={`font-mono text-sm font-medium ${remaining >= 0 ? 'text-brand-green' : 'text-brand-red'}`}>
                                            {formatEGP(Math.abs(remaining))} EGP
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-[#555570] mb-0.5">Limit</p>
                                        <p className="font-mono text-sm font-medium text-[#9090b0]">
                                            {formatEGP(limit)} EGP
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {showModal && (
                <AddBudgetModal
                    onClose={() => setShowModal(false)}
                    onSuccess={() => { setShowModal(false); fetchData() }}
                    currentMonth={currentMonth}
                    currentYear={currentYear}
                />
            )}
        </div>
    )
}

function AddBudgetModal({ onClose, onSuccess, currentMonth, currentYear }) {
    const [form, setForm] = useState({
        category: 'Food',
        monthly_limit: '',
        month: currentMonth,
        year: currentYear,
    })
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await createBudget({ ...form, monthly_limit: parseFloat(form.monthly_limit) })
            onSuccess()
        } catch {
            alert('Failed to create budget')
        } finally {
            setLoading(false)
        }
    }

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose()
    }

    return (
        <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={handleBackdropClick}
        >
            <div
                className="bg-[#0d0d14] border border-[#1a1a28] rounded-2xl p-6 w-full max-w-sm shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-semibold text-white">Set monthly budget</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-[#555570] hover:text-white transition-colors p-1 rounded-lg hover:bg-[#1a1a28]"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs text-[#555570] uppercase tracking-wider mb-1.5 block">
                            Category
                        </label>
                        <select
                            value={form.category}
                            onChange={e => setForm({ ...form, category: e.target.value })}
                            className={SELECT_CLASS}
                        >
                            {CATEGORIES.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs text-[#555570] uppercase tracking-wider mb-1.5 block">
                            Monthly limit (EGP)
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="100"
                            value={form.monthly_limit}
                            onChange={e => setForm({ ...form, monthly_limit: e.target.value })}
                            placeholder="e.g. 5000"
                            className={INPUT_CLASS}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-green text-[#0a0a0f] font-semibold py-2.5 rounded-lg text-sm hover:bg-[#00b873] transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Set budget'}
                    </button>
                </form>
            </div>
        </div>
    )
}

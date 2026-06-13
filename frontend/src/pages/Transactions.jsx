import { useState, useEffect } from "react"
import { getTransactions, deleteTransaction } from '../services/api'
import { Plus, Trash2, Pencil, Search } from 'lucide-react'
import AddTransactionModal from '../components/AddTransactionsModal'
import EditTransactionModal from '../components/EditTransactionsModal'

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
    personal: '#a855f7',
    'life expenses': '#f5a623',
}

const formatEGP = (val) =>
    new Intl.NumberFormat('en-EG', { maximumFractionDigits: 0 }).format(val)

const formatTxDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })

function getCategoryColor(category) {
    return CATEGORY_COLORS[category] || '#6b7280'
}

export default function Transactions() {
    const [transactions, setTransactions] = useState([])
    const [filtered, setFiltered] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [typeFilter, setTypeFilter] = useState('all')
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [showAdd, setShowAdd] = useState(false)
    const [editTx, setEditTx] = useState(null)

    const fetchTransactions = async () => {
        setLoading(true)
        try {
            const res = await getTransactions()
            setTransactions(res.data)
        } catch (err) {
            if (err.response?.status === 401) {
                localStorage.removeItem('token')
                window.location.href = '/login'
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchTransactions() }, [])

    useEffect(() => {
        let result = [...transactions]
        if (search) {
            const q = search.toLowerCase()
            result = result.filter(t =>
                t.title.toLowerCase().includes(q) ||
                t.category.toLowerCase().includes(q)
            )
        }
        if (typeFilter !== 'all') result = result.filter(t => t.type === typeFilter)
        if (categoryFilter !== 'all') result = result.filter(t => t.category === categoryFilter)
        setFiltered(result)
    }, [transactions, search, typeFilter, categoryFilter])

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this transaction?')) return
        try {
            await deleteTransaction(id)
            fetchTransactions()
        } catch {
            alert('Failed to delete transaction')
        }
    }

    const categories = [...new Set(transactions.map(t => t.category))]

    const totalIncome = filtered
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = filtered
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-semibold text-white">Transactions</h1>
                    <p className="text-sm text-[#555570] mt-0.5">
                        {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <button
                    onClick={() => setShowAdd(true)}
                    className="flex items-center gap-2 bg-brand-green text-[#0a0a0f] font-semibold px-4 py-2.5 rounded-lg text-sm hover:bg-[#00b873] transition-colors"
                >
                    <Plus size={15} />
                    Add transaction
                </button>
            </div>

            <div className="flex gap-3 mb-5 flex-wrap">
                <div className="bg-[#0d0d14] border border-[#1a1a28] rounded-lg px-4 py-2.5 flex items-center gap-2">
                    <span className="text-xs text-[#555570]">Income</span>
                    <span className="font-mono text-sm text-brand-green font-medium">
                        +{formatEGP(totalIncome)} EGP
                    </span>
                </div>
                <div className="bg-[#0d0d14] border border-[#1a1a28] rounded-lg px-4 py-2.5 flex items-center gap-2">
                    <span className="text-xs text-[#555570]">Expenses</span>
                    <span className="font-mono text-sm text-brand-red font-medium">
                        -{formatEGP(totalExpenses)} EGP
                    </span>
                </div>
                <div className="bg-[#0d0d14] border border-[#1a1a28] rounded-lg px-4 py-2.5 flex items-center gap-2">
                    <span className="text-xs text-[#555570]">Net</span>
                    <span className={`font-mono text-sm font-medium ${totalIncome - totalExpenses >= 0 ? 'text-brand-green' : 'text-brand-red'}`}>
                        {formatEGP(Math.abs(totalIncome - totalExpenses))} EGP
                    </span>
                </div>
            </div>

            <div className="flex gap-3 mb-4 flex-wrap">
                <div className="flex items-center gap-2 bg-[#0d0d14] border border-[#1a1a28] rounded-lg px-3 py-2 flex-1 min-w-48">
                    <Search size={14} className="text-[#555570] flex-shrink-0" />
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="bg-transparent text-sm text-white placeholder-[#333350] focus:outline-none w-full"
                    />
                </div>

                <select
                    value={typeFilter}
                    onChange={e => setTypeFilter(e.target.value)}
                    className="bg-[#0a0a0f] border border-[#1a1a28] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-green transition-colors"
                >
                    <option value="all">All types</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                </select>

                <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    className="bg-[#0a0a0f] border border-[#1a1a28] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-green transition-colors"
                >
                    <option value="all">All categories</option>
                    {categories.map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>

            <div className="bg-[#0d0d14] border border-[#1a1a28] rounded-xl overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center p-16">
                        <div className="w-6 h-6 border-2 border-brand-green border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 text-[#555570] text-sm">
                        No transactions found.{' '}
                        <button onClick={() => setShowAdd(true)} className="text-brand-green hover:underline">
                            Add one
                        </button>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#1a1a28]">
                                {['Transaction', 'Category', 'Type', 'Date', 'Amount', ''].map(h => (
                                    <th
                                        key={h}
                                        className={`text-xs text-[#555570] uppercase tracking-wider px-4 py-3 font-medium
                                            ${h === '' ? 'text-right' : 'text-left'}`}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#12121e]">
                            {filtered.map(tx => {
                                const color = getCategoryColor(tx.category)
                                const isIncome = tx.type === 'income'
                                return (
                                    <tr key={tx.id} className="hover:bg-[#0f0f18] transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                                    style={{ background: color + '20' }}
                                                >
                                                    <span className="text-xs font-semibold" style={{ color }}>
                                                        {tx.category?.[0]?.toUpperCase() ?? '?'}
                                                    </span>
                                                </div>
                                                <span className="text-sm text-[#d0d0e8] font-medium">{tx.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className="text-xs px-2 py-1 rounded-md capitalize"
                                                style={{ background: color + '20', color }}
                                            >
                                                {tx.category}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs font-medium capitalize ${isIncome ? 'text-brand-green' : 'text-brand-red'}`}>
                                                {tx.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-[#555570]">
                                            {formatTxDate(tx.date)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`font-mono text-sm font-medium ${isIncome ? 'text-brand-green' : 'text-brand-red'}`}>
                                                {isIncome ? '+' : '-'}{formatEGP(tx.amount)} EGP
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1 justify-end">
                                                <button
                                                    onClick={() => setEditTx(tx)}
                                                    className="p-1.5 text-[#555570] hover:text-brand-blue hover:bg-brand-blue/10 rounded-lg transition-colors"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(tx.id)}
                                                    className="p-1.5 text-[#555570] hover:text-brand-red hover:bg-brand-red/10 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {showAdd && (
                <AddTransactionModal
                    onClose={() => setShowAdd(false)}
                    onSuccess={() => { setShowAdd(false); fetchTransactions() }}
                />
            )}

            {editTx && (
                <EditTransactionModal
                    transaction={editTx}
                    onClose={() => setEditTx(null)}
                    onSuccess={() => { setEditTx(null); fetchTransactions() }}
                />
            )}
        </div>
    )
}

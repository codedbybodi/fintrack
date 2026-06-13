import { useState, useEffect } from "react"
import { updateTransaction } from "../services/api"
import { X } from 'lucide-react'

const CATEGORIES = [
    'Food', 'Transport', 'Rent', 'Shopping',
    'Entertainment', 'Health', 'Education', 'Salary', 'Freelace', 'Other'
]

function formatDateForInput(date) {
    if (!date) return new Date().toISOString().split('T')[0]
    return String(date).split('T')[0]
}

export default function EditTransactionModal({ transaction, onClose, onSuccess }) {
    const [form, setForm] = useState({
        title: transaction.title,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        date: formatDateForInput(transaction.date),
        notes: transaction.notes ?? ''
    })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setForm({
            title: transaction.title,
            amount: transaction.amount,
            type: transaction.type,
            category: transaction.category,
            date: formatDateForInput(transaction.date),
            notes: transaction.notes ?? ''
        })
    }, [transaction])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await updateTransaction(transaction.id, {
                ...form,
                amount: parseFloat(form.amount),
                notes: form.notes || null
            })
            onSuccess()
        } catch {
            alert('Failed to update transaction')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-dark-Card border border-dark-border rounded-2xl p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-semibold text-white">Edit transaction</h2>
                    <button onClick={onClose} className="text-[#555570] hover:text-white transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex rounded-lg border border-dark-border overflow-hidden">
                        {['expense', 'income'].map(t => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setForm({ ...form, type: t })}
                                className={`flex-1 py-2 text-sm font-medium capitalize transition-colors
                                    ${form.type === t
                                        ? t === 'expense'
                                            ? 'bg-brand-red/20 text-brand-red'
                                            : 'bg-brand-green/20 text-brand-green'
                                        : 'text-[#555570] hover:text-[#8888aa]'
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    <Input
                        label="Title"
                        value={form.title}
                        onChange={e => setForm({ ...form, title: e.target.value })}
                        placeholder="e.g. Grocery shopping"
                        required
                    />
                    <Input
                        label="Amount (EGP)"
                        type="number"
                        value={form.amount}
                        onChange={e => setForm({ ...form, amount: e.target.value })}
                        placeholder="0.00"
                        required
                        min="0"
                        step="0.01"
                    />

                    <div>
                        <label className="text-xs text-[#555570] uppercase tracking-wider mb-1.5 block">
                            Category
                        </label>
                        <select
                            value={form.category}
                            onChange={e => setForm({ ...form, category: e.target.value })}
                            className="w-full bg-dark border border-dark-border rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-green transition-colors"
                        >
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <Input
                        label="Date"
                        type="date"
                        value={form.date}
                        onChange={e => setForm({ ...form, date: e.target.value })}
                        required
                    />

                    <Input
                        label="Notes (optional)"
                        value={form.notes}
                        onChange={e => setForm({ ...form, notes: e.target.value })}
                        placeholder="Optional note..."
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-green text-dark font-semibold py-2.5 rounded-lg text-sm hover:bg-[#00b873] transition-colors disabled:opacity-50 mt-2"
                    >
                        {loading ? 'Saving...' : 'Save changes'}
                    </button>
                </form>
            </div>
        </div>
    )
}

function Input({ label, ...props }) {
    return (
        <div>
            <label className="text-xs text-[#555570] uppercase tracking-wider mb-1.5 block">
                {label}
            </label>
            <input
                {...props}
                className="w-full bg-dark border border-dark-border rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#333350] focus:outline-none focus:border-brand-green transition-colors"
            />
        </div>
    )
}

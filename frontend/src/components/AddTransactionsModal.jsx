import { useState } from "react"
import { createTransaction } from "../services/api"
import { X } from 'lucide-react'

const EXPENSE_CATEGORIES = [
    'Food', 'Transport', 'Rent', 'Shopping',
    'Entertainment', 'Health', 'Education', 'Other'
]

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Other']

const INPUT_CLASS =
    'w-full bg-[#0a0a0f] border border-[#1a1a28] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#333350] focus:outline-none focus:border-brand-green transition-colors'

const SELECT_CLASS =
    'w-full bg-[#0a0a0f] border border-[#1a1a28] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-green transition-colors appearance-none cursor-pointer'

export default function AddTransactionModal({ onClose, onSuccess }) {
    const [form, setForm] = useState({
        title: '',
        amount: '',
        type: 'expense',
        category: 'Food',
        date: new Date().toISOString().split('T')[0],
        notes: ''
    })
    const [loading, setLoading] = useState(false)

    const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

    const handleTypeChange = (type) => {
        const newCategories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
        const defaultCategory = type === 'income' ? 'Salary' : 'Food'
        setForm({
            ...form,
            type,
            category: newCategories.includes(form.category) ? form.category : defaultCategory
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await createTransaction({
                ...form,
                amount: parseFloat(form.amount),
                notes: form.notes.trim() || null
            })
            onSuccess()
        } catch {
            alert('Failed to add transaction')
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
                className="bg-[#0d0d14] border border-[#1a1a28] rounded-2xl p-6 w-full max-w-md shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-semibold text-white">Add transaction</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-[#555570] hover:text-white transition-colors p-1 rounded-lg hover:bg-[#1a1a28]"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex rounded-lg border border-[#1a1a28] overflow-hidden">
                        {['expense', 'income'].map(t => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => handleTypeChange(t)}
                                className={`flex-1 py-2.5 text-sm font-medium capitalize transition-colors
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

                    <Field label="Title">
                        <input
                            type="text"
                            value={form.title}
                            onChange={e => setForm({ ...form, title: e.target.value })}
                            placeholder="e.g. Grocery shopping"
                            className={INPUT_CLASS}
                            required
                        />
                    </Field>

                    <Field label="Amount (EGP)">
                        <input
                            type="number"
                            value={form.amount}
                            onChange={e => setForm({ ...form, amount: e.target.value })}
                            placeholder="0.00"
                            className={INPUT_CLASS}
                            required
                            min="0"
                            step="0.01"
                        />
                    </Field>

                    <Field label="Category">
                        <select
                            value={form.category}
                            onChange={e => setForm({ ...form, category: e.target.value })}
                            className={SELECT_CLASS}
                        >
                            {categories.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Date">
                        <input
                            type="date"
                            value={form.date}
                            onChange={e => setForm({ ...form, date: e.target.value })}
                            className={INPUT_CLASS}
                            required
                        />
                    </Field>

                    <Field label="Notes (optional)">
                        <textarea
                            value={form.notes}
                            onChange={e => setForm({ ...form, notes: e.target.value })}
                            placeholder="Optional note..."
                            rows={2}
                            className={`${INPUT_CLASS} resize-none`}
                        />
                    </Field>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-green text-[#0a0a0f] font-semibold py-2.5 rounded-lg text-sm hover:bg-[#00b873] transition-colors disabled:opacity-50 mt-1"
                    >
                        {loading ? 'Adding...' : 'Add transaction'}
                    </button>
                </form>
            </div>
        </div>
    )
}

function Field({ label, children }) {
    return (
        <div>
            <label className="text-xs text-[#555570] uppercase tracking-wider mb-1.5 block">
                {label}
            </label>
            {children}
        </div>
    )
}

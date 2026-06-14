import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { register } from "../services/api"
import { Wallet } from "lucide-react"

export default function Register() {
    const [form, setForm] = useState({ name: '', email: '', password: ''})
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            await register(form)
            navigate('/login')
        } catch (err) {
            const msg = err.response?.data?.detail || 'Something went wrong'
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-dark flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className="w-10 h-10 bg-brand-green rounded-xl flex items-center justify-center">
                        <Wallet size={20} className="text-dark" />
                    </div>
                    <span className="text-2xl font-semibold text-white tracking-tight">FinTrack</span>
                </div>
                <div className="bg-dark-card border border-dark-border rounded-2xl p-8">
                    <h1 className="text-xl font-semibold text-white mb-1">Create account</h1>
                    <p className="text-sm text-[#555570] mb-6">Start tracking your finances</p>

                    { error && (
                        <div className="bg-[#1a0a0a] border border-brand-red/20 text-brand-red text-sm px-4 py-3 rounded-lg mb-4">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {[
                            { label: 'Name', key: 'name', type: 'text', placeholder:'What should FinTrack call you?' },
                            { label: 'Email', key: 'email', type: 'email', placeholder: 'you@example.com' },
                            { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' }
                        ].map(({ label, key, type, placeholder }) => (
                            <div key={key}>
                                <label className="text-xs text-[#555570] uppercase tracking-wider mb-1.5 block">
                                    {label}
                                </label>
                                <input 
                                    type={type} 
                                    value={form[key]}
                                    onChange={e => setForm({...form, [key]: e.target.value })}
                                    className="w-full bg-dark border border-dark-border rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#333350] focus:outline-none focus:border-brand-green transition-colors"
                                    placeholder={placeholder}
                                    required
                                />
                            </div>
                        ))}
                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full bg-brand-green text-dark font-semibold py-2.5 rounded-lg text-sm hover:bg-[#00b873]"
                        >
                            {loading ? 'Creating account...' : 'Create account'}
                        </button>
                    </form>
                    <p className="text-center text-sm text-[#555570] mt-6">
                        Have an account?{' '}
                        <Link to="/login" className="text-brand-green hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )  
}
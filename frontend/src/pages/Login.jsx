import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { login } from "../services/api"
import { Wallet } from 'lucide-react'

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' })
    const [error, serError] = useState('')
    const[loading, setLoading] = useState(false)
    const navigate =  useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        serError('')
        try {
            const res = await login(form)
            localStorage.setItem('token', res.data.access_token)
            navigate('/')
        } catch {
            serError('Wrong email or password')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-dark flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className="w-10 h-10 bg-brand-green rounded-xl flex items-center justify-center">
                        <Wallet size={20} className="text-dark" />
                    </div>
                    <span className="text-2xl font-semibold text-white tracking-tight">FinTrack</span>
                </div>

                <div className="bg-dark-card border border-dark-border rounded-2xl p-8">
                    <h1 className="text-xl font-semibold text-white mb-1">Welcome back</h1>
                    <p className="text-sm text-[#555570] mb-6">Sign in to your account</p>

                    {error && (
                        <div className="bg-[#1a0a0a] border border-brand-red/20 text-brand-red text-sm px-4 py-3 rounded-lg mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs text-[#555570] uppercase tracking-wider mb-1.5 block">
                                Email
                            </label>
                            <input 
                                type="email" value={form.email} 
                                onChange={e => setForm({ ...form, email: e.target.value })} 
                                className="w-full bg-dark border border-dark-border rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#333350] focus:outline-none focus:border-brand-green transition-colors"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-xs text-[#555570] uppercase tracking-wider mb-1.5 block">
                                Password
                            </label>
                            <input 
                                type="password" 
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                className="w-full bg-dark border border-dark-border rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#333350] focus:outline-none focus:border-brand-green transition-colors"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-brand-green text-dark font-semibold py-2.5 rounded-lg text-sm hover:bg-[#00b873] transition-colors"
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-[#555570] mt-6">
                        No accounts?{' '}
                        <Link to={'/register'} className="text-brand-green hover:underline">Create one</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
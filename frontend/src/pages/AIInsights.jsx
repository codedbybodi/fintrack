import { useState } from 'react'
import { getAIInsights } from '../services/api'
import { Sparkles, TrendingUp, Wallet, PiggyBank, Zap } from 'lucide-react'

const formatEGP = (val) =>
    new Intl.NumberFormat('en-EG', { maximumFractionDigits: 0 }).format(val)

export default function AIInsights() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(false)

    const generateInsights = async () => {
        setLoading(true)
        try {
            const res = await getAIInsights()
            setData(res.data)
        } catch {
            alert('failed to generate insights')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='max-w-3xl mx-auto'>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-xl font-semibold text-white">AI Insights</h1>
                <p className="text-sm text-[#555570] mt-0.5">
                    This information is based on your real transaction data
                </p>
            </div>

            {!data && !loading && (
                <div className="bg-dark-Card border border-dark-border rounded-xl p-12 text-center">
                    <div className="w-14 h-14 bg-[#0f2a1e] rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Sparkles size={24} className="text-brand-green" />
                    </div>
                    <h2 className="text-base font-semibold text-white mb-2">
                        Get AI analysis of your finance
                    </h2>
                    <p className="text-sm text-[#555570] mb-6 max-w-sm mx-auto">
                        Gemini will analyze your transactions and give you personal insights and actionable tips.
                    </p>
                    <button onClick={generateInsights} className="inline-flex items-center gap-2 bg-brand-green text-dark font-semibold px-6 py-2.5 rounded-lg text-sm hover:bg-[#00b873] transition-colors">
                        <Sparkles size={15} />
                        Generate insights
                    </button>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="bg-dark-Card border border-dark-border rounded-xl p-12 text-center">
                    <div className="w-6 h-6 border-2 border-brand-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm text-[#555570]">Analyzing your finances...</p>
                </div>
            )}

            {/* Results */}
            {data && !loading && (
                <div className="space-y-4">
                    {/* Summary Card */}
                    <div className="grid grid-cols-4 gap-3">
                        <SummaryCard  icon={<Wallet size={14}/>} label="Balance" value={`${formatEGP(data.summary.balance)} EGP`} color={data.summary.balance >= 0 ? 'text-brand-green' : 'text-brand-red'} />
                        <SummaryCard icon={<TrendingUp size={14} />} label="Saving rate" value={`${data.summary.savings_rate}%`} color="text-brand-blue" />
                        <SummaryCard icon={<PiggyBank size={14} />} label="Income" value={`${formatEGP(data.summary.total_income)} EGP`} color="text-white" />
                        <SummaryCard icon={<Zap size={14} />} label="Top spend" value={data.summary.top_category} color="text-brand-gold"/>
                    </div>

                    {/* AI Analysis */}
                    <div className="bg-dark-Card border border-dark-border rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-7 h-7 bg-[#0f2a1e] rounded-lg flex items-center justify-center">
                                <Sparkles size={14} className="text-brand-green" />
                            </div>
                            <p className="text-sm font-semibold text-white">Gemini Analysis</p>
                            <span className="text-xs bg-[#0f2a1e] text-brand-green px-2 py-0.5 rounded-full border border-brand-green/20">
                                Based on your real data
                            </span>
                        </div>
                        <div className="text-sm text-[#c0c0d8] leading-relaxed whitespace-pre-line">
                            {data.insights}
                        </div>
                    </div>

                    {/* Regenerate */}
                    <button onClick={generateInsights} className="flex items-center gap-2 text-sm text-[#555570] hover:text-brand-green transition-colors">
                        <Sparkles size={14} />
                        Regenerate insights
                    </button>
                </div>
            )}

        </div>
    )
}

function SummaryCard({ icon, label, value, color }) {
    return (
        <div className="bg-dark-Card border border-dark-border rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-[10px] text-[#555570] uppercase tracking-wider mb-2">
                {icon} {label}
            </div>
            <p className={`font-mono text-sm font-medium ${color}`}>{value}</p>
        </div>
    )
}
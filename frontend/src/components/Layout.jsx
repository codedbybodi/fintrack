import { Outlet, NavLink, useNavigate } from "react-router-dom";
import{
    LayoutDashboard, ArrowLeftRight,
    Target, LogOut, Wallet,
    Sparkles
} from 'lucide-react'


const NavItems = [
    { to: '/', icon: LayoutDashboard, label: 'Transactions' },
    { to: '/transactions', icon: ArrowLeftRight, label: 'transactions' },
    { to: '/budgets', icon: Target, label: 'budgets' },
    { to: '/ai', icon: Sparkles, label: 'AI Insights'},
]

export default function Layout() {
    const navigate = useNavigate()

    const logout = () => {
        localStorage.removeItem('token')
        navigate('/login')
    }

    return (
        <div className="flex h-screen bg-dark overflow-hidden">
            {/* Sidebar */}
            <aside className="w-52 bg-dark-card border-r border-dark-border flex flex-col py-5 flex-shrink-0">
                {/* Logo */}
                <div className="flex items-center gap-2 px-5 pb-6">
                    <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center">
                        <Wallet size={16} className="text-dark" />
                    </div>
                    <span className="text-white font-semibold tracking-tight">FinTrack</span>
                </div>
                {/* Nav */}
                <nav className="flex-1 px-2.5 space-y-0.5">
                    {NavItems.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/'}
                            className={(({ isActive }) => `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all
                            ${isActive
                                ? 'bg-[#0f2a1e] text-brand-green'
                                : 'text-[#6b6b8a] hover:bg-dark-hover hover:text-[#b0b0d0]'
                            }
                            `)
                        }
                        >
                        <Icon size={17} />
                        {label}
                        </NavLink>
                    ))}
                </nav>
                {/* logOut */}
                <div className="px-2.5 p-4 border-t border-dark-border mx-2.5">
                    <button
                    onClick={logout}
                    className="flex items-center gap-2.5 px-3 py-2.5 w-full rounded-lg text-sm text-[#6b6b8a] hover:text-brand-red hover:bg-[#1a0a0a] transition-all" 
                    >
                        <LogOut size={17}/>
                            Sign Out
                    </button>
                </div>
            </aside>
            
            {/* Main */}
            <main className="flex-1 overflow-y-auto p-6">
                <Outlet />
            </main>
        </div>
    )
}
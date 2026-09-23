import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, LineChart, Users, Package, 
  Bot, Settings, Zap, Menu, X
} from 'lucide-react'

import { Dashboard } from './pages/Dashboard'
import { Analytics } from './pages/Analytics'
import { Customers } from './pages/Customers'
import { Products } from './pages/Products'
import { AIAnalyst } from './pages/AIAnalyst'

const SidebarItem = ({ icon: Icon, label, path, isActive }: any) => (
  <Link to={path}>
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-brand-500/10 text-brand-500 dark:text-brand-400 font-semibold shadow-sm' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50'}`}>
      <Icon size={20} className={isActive ? 'text-brand-500 dark:text-brand-400' : ''} />
      <span>{label}</span>
      {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500" />}
    </div>
  </Link>
)

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Close sidebar on navigation (mobile)
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [location.pathname])

  const pageTitle: Record<string, string> = {
    '/': 'Executive Dashboard',
    '/analytics': 'Advanced Analytics',
    '/customers': 'Customer Intelligence',
    '/products': 'Product Intelligence',
    '/ai': 'AI Business Analyst',
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-100 via-teal-50/30 to-indigo-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl" />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative inset-y-0 left-0 z-50 w-64 flex-shrink-0 bg-white/95 dark:bg-slate-900/95 lg:bg-white/70 lg:dark:bg-slate-900/70 backdrop-blur-xl border-r border-white/30 dark:border-slate-800/50 flex flex-col transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="px-6 py-6 flex items-center justify-between border-b border-slate-100/50 dark:border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-500 to-teal-400 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-teal-500/30">
              R
            </div>
            <div>
              <span className="text-lg font-bold text-slate-800 dark:text-white">RetailIQ</span>
              <span className="block text-[10px] text-teal-500 font-medium uppercase tracking-widest">AI Platform</span>
            </div>
          </div>
          <button className="lg:hidden p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="px-4 py-6 space-y-1.5 overflow-y-auto">
          <p className="px-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Main</p>
          <SidebarItem icon={LayoutDashboard} label="Dashboard" path="/" isActive={location.pathname === '/'} />
          <SidebarItem icon={LineChart} label="Analytics" path="/analytics" isActive={location.pathname === '/analytics'} />
          <p className="px-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-4 mb-3">Intelligence</p>
          <SidebarItem icon={Users} label="Customers" path="/customers" isActive={location.pathname === '/customers'} />
          <SidebarItem icon={Package} label="Products" path="/products" isActive={location.pathname === '/products'} />
          <p className="px-4 text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-4 mb-3">AI</p>
          <SidebarItem icon={Bot} label="AI Analyst" path="/ai" isActive={location.pathname === '/ai'} />
        </nav>

        <div className="flex-1 px-4 pb-6 mt-2">
          <div className="h-full mx-2 p-4 rounded-xl bg-gradient-to-br from-teal-500/10 to-indigo-500/10 border border-teal-500/20 flex flex-col">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-600 dark:text-teal-400">
                  <Zap size={16} />
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">AI Powered</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-3">
                Powered by Groq Llama-3.3.<br/>
                Connected to live PostgreSQL Database.
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col z-10 overflow-hidden w-full">
        {/* Header */}
        <header className="h-16 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-b border-white/30 dark:border-slate-800/50 flex items-center justify-between px-4 sm:px-8 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800" onClick={() => setIsSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">{pageTitle[location.pathname] || 'RetailIQ'}</h2>
              <p className="text-[10px] sm:text-xs text-slate-400 hidden sm:block">Kaggle Retail Dataset • 1M rows</p>
            </div>
          </div>

        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 w-full">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/products" element={<Products />} />
        <Route path="/ai" element={<AIAnalyst />} />
      </Routes>
    </Layout>
  )
}

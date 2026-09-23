import { useQuery } from '@tanstack/react-query'
import { fetchKPIs, fetchRevenueTrend, fetchCategoryPerformance, fetchChurnAnalysis, fetchBehavior } from '../api'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { DollarSign, Users, ShoppingCart, TrendingDown, Star, RotateCcw, Activity, Clock } from 'lucide-react'

const COLORS = ['#14b8a6', '#6366f1', '#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899']

const fmt = (n: number, prefix = '', suffix = '') => {
  if (n >= 1_000_000) return `${prefix}${(n / 1_000_000).toFixed(1)}M${suffix}`
  if (n >= 1_000) return `${prefix}${(n / 1_000).toFixed(1)}K${suffix}`
  return `${prefix}${n.toFixed(0)}${suffix}`
}

const StatCard = ({ title, value, icon: Icon, color, subtitle }: any) => (
  <div className="glass-card flex items-center gap-4">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
    <div>
      <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
      <p className="text-2xl font-bold text-slate-800 dark:text-white">{value}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
  </div>
)

const ChartCard = ({ title, subtitle, children }: any) => (
  <div className="glass-card flex flex-col">
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-white">{title}</h3>
      {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
    </div>
    {children}
  </div>
)

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-3 shadow-xl">
        <p className="text-sm font-semibold text-slate-700 dark:text-white mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} className="text-xs" style={{ color: p.color }}>
            {p.name}: {typeof p.value === 'number' && p.value > 1000 ? `₹${(p.value / 1000).toFixed(1)}K` : p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export const Dashboard = () => {
  const { data: kpis, isLoading: kL } = useQuery({ queryKey: ['kpis'], queryFn: fetchKPIs })
  const { data: trend } = useQuery({ queryKey: ['revenue-trend'], queryFn: fetchRevenueTrend })
  const { data: cats } = useQuery({ queryKey: ['category-performance'], queryFn: fetchCategoryPerformance })
  const { data: churn } = useQuery({ queryKey: ['churn-analysis'], queryFn: fetchChurnAnalysis })
  const { data: behavior } = useQuery({ queryKey: ['behavior'], queryFn: fetchBehavior })

  return (
    <div className="space-y-6">
      {/* KPI Cards Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={kL ? '…' : fmt(kpis?.total_revenue || 0, '₹')} icon={DollarSign} color="bg-gradient-to-br from-teal-400 to-teal-600" subtitle="From total_sales" />
        <StatCard title="Avg Order Value" value={kL ? '…' : fmt(kpis?.avg_order_value || 0, '₹')} icon={ShoppingCart} color="bg-gradient-to-br from-indigo-400 to-indigo-600" subtitle="avg_purchase_value" />
        <StatCard title="Total Customers" value={kL ? '…' : fmt(kpis?.total_customers || 0)} icon={Users} color="bg-gradient-to-br from-violet-400 to-violet-600" subtitle="Unique customer IDs" />
        <StatCard title="Churn Rate" value={kL ? '…' : `${(kpis?.churn_rate || 0).toFixed(1)}%`} icon={TrendingDown} color="bg-gradient-to-br from-rose-400 to-rose-600" subtitle="Churned customers" />
      </div>

      {/* KPI Cards Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Avg Product Rating" value={kL ? '…' : `${(kpis?.avg_product_rating || 0).toFixed(2)} ★`} icon={Star} color="bg-gradient-to-br from-amber-400 to-amber-600" />
        <StatCard title="Total Returns" value={kL ? '…' : fmt(kpis?.total_returns || 0, '₹')} icon={RotateCcw} color="bg-gradient-to-br from-red-400 to-red-600" />
        <StatCard title="Avg Recency (days)" value={kL ? '…' : `${(kpis?.avg_recency || 0).toFixed(0)}d`} icon={Clock} color="bg-gradient-to-br from-sky-400 to-sky-600" subtitle="Days since last purchase" />
        <StatCard title="Avg CLV" value={kL ? '…' : fmt(kpis?.avg_clv || 0, '₹')} icon={Activity} color="bg-gradient-to-br from-emerald-400 to-emerald-600" subtitle="Customer Lifetime Value" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard title="Monthly Revenue Trend" subtitle="Total sales aggregated by month of year">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trend || []}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="discGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area type="monotone" dataKey="revenue" stroke="#14b8a6" fill="url(#revGrad)" strokeWidth={2} name="Revenue" />
                <Area type="monotone" dataKey="discounts" stroke="#6366f1" fill="url(#discGrad)" strokeWidth={2} name="Discounts Given" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <ChartCard title="Category Mix" subtitle="Revenue share by product category">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={cats || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3}>
                {(cats || []).map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: any) => [`₹${(v / 1000).toFixed(1)}K`, 'Revenue']} />
              <Legend iconType="circle" iconSize={8} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Transactions by Day of Week" subtitle="Which days drive the most transactions">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={behavior?.by_day || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="transactions" name="Transactions" fill="#14b8a6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Churn Rate by Purchase Frequency" subtitle="How frequently customers buy vs. likelihood to churn">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={churn?.by_frequency || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} />
              <XAxis dataKey="frequency" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={(v) => `${v.toFixed(0)}%`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="churn_rate" name="Churn Rate (%)" fill="#ef4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}

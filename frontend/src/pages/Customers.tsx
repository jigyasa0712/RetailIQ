import { useQuery } from '@tanstack/react-query'
import { fetchCustomerMetrics, fetchChurnAnalysis } from '../api'
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { Users, TrendingDown, Award, Heart, BadgePercent, Clock } from 'lucide-react'

const COLORS = ['#14b8a6', '#6366f1', '#f59e0b', '#ef4444', '#10b981', '#3b82f6']

const StatBadge = ({ label, value, icon: Icon, color }: any) => (
  <div className={`rounded-2xl p-5 ${color} flex items-center gap-4 shadow-lg`}>
    <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-xs font-semibold text-white/70 uppercase tracking-widest">{label}</p>
      <p className="text-2xl font-bold text-white mt-0.5">{value}</p>
    </div>
  </div>
)

const ChartCard = ({ title, subtitle, children }: any) => (
  <div className="glass-card flex flex-col">
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-white">{title}</h3>
      {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </div>
)

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-3 shadow-xl text-xs">
        <p className="font-semibold text-slate-700 dark:text-white mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: {typeof p.value === 'number' && p.value > 999 ? `₹${(p.value/1000).toFixed(1)}K` : typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

const fmt = (n: number, prefix = '') => {
  if (!n) return `${prefix}0`
  if (n >= 1_000_000) return `${prefix}${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${prefix}${(n / 1_000).toFixed(1)}K`
  return `${prefix}${n.toFixed(0)}`
}

export const Customers = () => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['customer-metrics'],
    queryFn: fetchCustomerMetrics,
  })
  const { data: churn } = useQuery({
    queryKey: ['churn-analysis'],
    queryFn: fetchChurnAnalysis,
  })

  const s = metrics?.summary || {}

  // Build stacked bar data: churn Yes/No per income bracket
  const churnByIncome: Record<string, any> = {}
  ;(churn?.by_income || []).forEach((r: any) => {
    if (!churnByIncome[r.bracket]) churnByIncome[r.bracket] = { bracket: r.bracket, Churned: 0, Retained: 0 }
    if (r.churned === 'Yes') churnByIncome[r.bracket].Churned = r.count
    else churnByIncome[r.bracket].Retained = r.count
  })
  const churnIncomeData = Object.values(churnByIncome)

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-indigo-500 flex items-center justify-center">
          <Users size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Customer Intelligence</h1>
          <p className="text-sm text-slate-400">Deep dive into customer behaviour and segmentation</p>
        </div>
      </div>

      {/* KPI Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBadge
          label="Total Customers"
          value={isLoading ? '…' : fmt(s.total_customers || 0)}
          icon={Users}
          color="bg-gradient-to-br from-teal-500 to-teal-700"
        />
        <StatBadge
          label="Avg CLV"
          value={isLoading ? '…' : fmt(s.avg_clv || 0, '₹')}
          icon={BadgePercent}
          color="bg-gradient-to-br from-indigo-500 to-indigo-700"
        />
        <StatBadge
          label="Loyalty Rate"
          value={isLoading ? '…' : `${(s.loyalty_rate || 0).toFixed(1)}%`}
          icon={Heart}
          color="bg-gradient-to-br from-amber-500 to-amber-700"
        />
        <StatBadge
          label="Churn Rate"
          value={isLoading ? '…' : `${(s.churn_rate || 0).toFixed(1)}%`}
          icon={TrendingDown}
          color="bg-gradient-to-br from-rose-500 to-rose-700"
        />
      </div>

      {/* Extra stats strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="glass-card flex items-center gap-4 py-4">
          <Clock size={20} className="text-brand-500 flex-shrink-0" />
          <div>
            <p className="text-xs text-slate-400">Avg Membership Years</p>
            <p className="text-xl font-bold text-slate-800 dark:text-white">
              {isLoading ? '…' : `${(s.avg_membership || 0).toFixed(1)} yrs`}
            </p>
          </div>
        </div>
        <div className="glass-card flex items-center gap-4 py-4">
          <BadgePercent size={20} className="text-indigo-500 flex-shrink-0" />
          <div>
            <p className="text-xs text-slate-400">Avg Purchase Value</p>
            <p className="text-xl font-bold text-slate-800 dark:text-white">
              {isLoading ? '…' : fmt(s.avg_purchase_value || 0, '₹')}
            </p>
          </div>
        </div>
        <div className="glass-card flex items-center gap-4 py-4 lg:col-span-1 col-span-2">
          <Award size={20} className="text-amber-500 flex-shrink-0" />
          <div>
            <p className="text-xs text-slate-400">Avg Transactions / Customer</p>
            <p className="text-xl font-bold text-slate-800 dark:text-white">
              {isLoading ? '…' : `${((s.avg_clv || 0) / Math.max(s.avg_purchase_value || 1, 1)).toFixed(1)}x`}
            </p>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Income Segment Mix" subtitle="Distribution across income brackets">
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie
                data={metrics?.segments || []}
                dataKey="value" nameKey="name"
                cx="50%" cy="50%"
                outerRadius={90} innerRadius={50}
                paddingAngle={4}
                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {(metrics?.segments || []).map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => [v.toLocaleString(), 'Customers']} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Purchase Frequency Mix" subtitle="How often customers buy">
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie
                data={metrics?.by_frequency || []}
                dataKey="value" nameKey="name"
                cx="50%" cy="50%"
                outerRadius={90} innerRadius={50}
                paddingAngle={4}
                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {(metrics?.by_frequency || []).map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => [v.toLocaleString(), 'Customers']} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Gender Breakdown" subtitle="Customer count by gender">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={metrics?.by_gender || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} />
              <XAxis dataKey="gender" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Customers" radius={[6, 6, 0, 0]}>
                {(metrics?.by_gender || []).map((_: any, i: number) => (
                  <Cell key={i} fill={['#14b8a6', '#6366f1', '#f59e0b'][i % 3]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Avg Spend by Age Group" subtitle="Which age groups have the highest purchase value">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={metrics?.by_age || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} />
              <XAxis dataKey="age_group" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="avg_spend" name="Avg Spend (₹)" radius={[6, 6, 0, 0]}>
                {(metrics?.by_age || []).map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Churn by Income Bracket" subtitle="Churned vs retained customers per income level">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={churnIncomeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} />
              <XAxis dataKey="bracket" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} />
              <Bar dataKey="Churned"  stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Retained" stackId="a" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Top Customers Table */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center gap-2 mb-5">
          <Award size={18} className="text-brand-500" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Top 10 Customers by Revenue</h3>
        </div>

        {/* Mobile: Card list */}
        <div className="flex flex-col gap-3 lg:hidden">
          {(metrics?.top_customers || []).map((c: any, i: number) => (
            <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className={`inline-flex w-8 h-8 rounded-full items-center justify-center text-xs font-bold flex-shrink-0 ${
                i === 0 ? 'bg-amber-400 text-white' :
                i === 1 ? 'bg-slate-400 text-white' :
                i === 2 ? 'bg-orange-400 text-white' :
                'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
              }`}>{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm font-bold text-slate-800 dark:text-white">#{c.id}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{c.occupation || '—'} · {c.city || '—'} · {c.years} yrs</p>
              </div>
              <p className="text-sm font-bold text-teal-600 dark:text-teal-400 flex-shrink-0">
                ₹{c.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
          ))}
          {!metrics?.top_customers?.length && (
            <p className="py-8 text-center text-slate-400">Loading customer data…</p>
          )}
        </div>

        {/* Desktop: Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-100/70 dark:bg-slate-800/50">
                <th className="text-left py-3 px-4 text-slate-600 dark:text-slate-300 font-semibold text-xs uppercase tracking-wide">Rank</th>
                <th className="text-left py-3 px-4 text-slate-600 dark:text-slate-300 font-semibold text-xs uppercase tracking-wide">Customer ID</th>
                <th className="text-left py-3 px-4 text-slate-600 dark:text-slate-300 font-semibold text-xs uppercase tracking-wide">Occupation</th>
                <th className="text-left py-3 px-4 text-slate-600 dark:text-slate-300 font-semibold text-xs uppercase tracking-wide">City</th>
                <th className="text-left py-3 px-4 text-slate-600 dark:text-slate-300 font-semibold text-xs uppercase tracking-wide">Member Years</th>
                <th className="text-right py-3 px-4 text-slate-600 dark:text-slate-300 font-semibold text-xs uppercase tracking-wide">Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              {(metrics?.top_customers || []).map((c: any, i: number) => (
                <tr key={c.id} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <span className={`inline-flex w-7 h-7 rounded-full items-center justify-center text-xs font-bold ${
                      i === 0 ? 'bg-amber-400 text-white' :
                      i === 1 ? 'bg-slate-400 text-white' :
                      i === 2 ? 'bg-orange-400 text-white' :
                      'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                    }`}>{i + 1}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-700 dark:text-slate-200">#{c.id}</td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-200">{c.occupation || '—'}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{c.city || '—'}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{c.years} yrs</td>
                  <td className="py-3 px-4 text-right font-bold text-teal-600 dark:text-teal-400">
                    ₹{c.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                </tr>
              ))}
              {!metrics?.top_customers?.length && (
                <tr><td colSpan={6} className="py-12 text-center text-slate-400">Loading customer data…</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

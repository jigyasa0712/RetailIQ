import { useQuery } from '@tanstack/react-query'
import { fetchProductMetrics } from '../api'
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { Package, Star, RotateCcw, TrendingUp } from 'lucide-react'

const COLORS = ['#14b8a6', '#6366f1', '#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899']

const StatBadge = ({ label, value, color, icon: Icon }: any) => (
  <div className="glass-card flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon size={20} className="text-white" />
    </div>
    <div>
      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold text-slate-800 dark:text-white">{value}</p>
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
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-3 shadow-xl text-xs">
        <p className="font-semibold text-slate-700 dark:text-white mb-1">{label}</p>
        {payload.map((p: any) => <p key={p.name} style={{ color: p.color }}>{p.name}: {typeof p.value === 'number' && p.value > 1000 ? `₹${(p.value/1000).toFixed(1)}K` : typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</p>)}
      </div>
    )
  }
  return null
}

export const Products = () => {
  const { data: metrics, isLoading } = useQuery({ queryKey: ['product-metrics'], queryFn: fetchProductMetrics })
  const s = metrics?.summary || {}

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Package className="text-brand-500" />
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Product Intelligence</h1>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBadge label="Total SKUs" value={isLoading ? '…' : (s.total_products || 0).toLocaleString()} icon={Package} color="bg-gradient-to-br from-teal-500 to-teal-600" />
        <StatBadge label="Avg Rating" value={isLoading ? '…' : `${(s.avg_rating || 0).toFixed(2)} ★`} icon={Star} color="bg-gradient-to-br from-amber-500 to-amber-600" />
        <StatBadge label="Avg Return Rate" value={isLoading ? '…' : `${((s.avg_return_rate || 0) * 100).toFixed(1)}%`} icon={RotateCcw} color="bg-gradient-to-br from-rose-500 to-rose-600" />
        <StatBadge label="Avg Stock" value={isLoading ? '…' : (s.avg_stock || 0).toFixed(0)} icon={TrendingUp} color="bg-gradient-to-br from-indigo-500 to-indigo-600" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Revenue by Brand" subtitle="Top brands by total sales contribution">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={metrics?.by_brand || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
              <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" name="Revenue" radius={[0, 6, 6, 0]}>
                {(metrics?.by_brand || []).map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Product Rating Distribution" subtitle="How customers rate our products (1-5 stars)">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={metrics?.rating_distribution || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} />
              <XAxis dataKey="rating" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `${v} ★`} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Products" radius={[6, 6, 0, 0]}>
                {(metrics?.rating_distribution || []).map((_: any, i: number) => (
                  <Cell key={i} fill={['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981'][i % 5]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Return Analysis */}
      <ChartCard title="Return Rate by Category" subtitle="Which product categories have the highest return rates — a key quality signal">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={metrics?.return_analysis || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} />
            <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => `${(v * 100).toFixed(0)}%`} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar yAxisId="left" dataKey="return_rate" name="Return Rate" fill="#ef4444" radius={[6, 6, 0, 0]} />
            <Bar yAxisId="right" dataKey="total_returned" name="Total Returned (₹)" fill="#f59e0b" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Top Products Table */}
      <div className="glass-card">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-brand-500" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Top 10 Products by Revenue</h3>
        </div>

        {/* Mobile: Card list */}
        <div className="flex flex-col gap-3 lg:hidden">
          {(metrics?.top_by_revenue || []).map((p: any, i: number) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="inline-flex w-7 h-7 rounded-full items-center justify-center text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex-shrink-0 mt-0.5">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{p.name}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="px-2 py-0.5 rounded-full text-xs bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300">{p.category}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{p.brand}</span>
                  <span className="text-xs text-amber-500 font-medium">{p.rating.toFixed(1)} ★</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-teal-600 dark:text-teal-400">₹{p.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-xs text-rose-500">₹{p.returns.toLocaleString(undefined, { maximumFractionDigits: 0 })} ret.</p>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-100/70 dark:bg-slate-800/50">
                <th className="text-left py-2 px-3 text-slate-600 dark:text-slate-300 font-semibold text-xs uppercase tracking-wide">#</th>
                <th className="text-left py-2 px-3 text-slate-600 dark:text-slate-300 font-semibold text-xs uppercase tracking-wide">Product</th>
                <th className="text-left py-2 px-3 text-slate-600 dark:text-slate-300 font-semibold text-xs uppercase tracking-wide">Category</th>
                <th className="text-left py-2 px-3 text-slate-600 dark:text-slate-300 font-semibold text-xs uppercase tracking-wide">Brand</th>
                <th className="text-left py-2 px-3 text-slate-600 dark:text-slate-300 font-semibold text-xs uppercase tracking-wide">Rating</th>
                <th className="text-right py-2 px-3 text-slate-600 dark:text-slate-300 font-semibold text-xs uppercase tracking-wide">Revenue</th>
                <th className="text-right py-2 px-3 text-slate-600 dark:text-slate-300 font-semibold text-xs uppercase tracking-wide">Returns</th>
              </tr>
            </thead>
            <tbody>
              {(metrics?.top_by_revenue || []).map((p: any, i: number) => (
                <tr key={i} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-slate-500 dark:text-slate-400">{i + 1}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-700 dark:text-slate-200">{p.name}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full text-xs bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300">{p.category}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{p.brand}</td>
                  <td className="py-2.5 px-3 text-amber-500 font-medium">{p.rating.toFixed(1)} ★</td>
                  <td className="py-2.5 px-3 text-right font-semibold text-teal-600 dark:text-teal-400">
                    ₹{p.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                  <td className="py-2.5 px-3 text-right text-rose-500">
                    ₹{p.returns.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

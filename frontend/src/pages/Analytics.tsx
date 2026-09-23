import { useQuery } from '@tanstack/react-query'
import { fetchPromotions, fetchBehavior, fetchGeographic } from '../api'
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ScatterChart, Scatter, ZAxis
} from 'recharts'
import { Tag, Zap, MapPin, Clock } from 'lucide-react'

const COLORS = ['#14b8a6', '#6366f1', '#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899']

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
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}: {typeof p.value === 'number' && p.value > 1000 ? `₹${(p.value / 1000).toFixed(1)}K` : typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export const Analytics = () => {
  const { data: promo } = useQuery({ queryKey: ['promotions'], queryFn: fetchPromotions })
  const { data: behavior } = useQuery({ queryKey: ['behavior'], queryFn: fetchBehavior })
  const { data: geo } = useQuery({ queryKey: ['geographic'], queryFn: fetchGeographic })

  const channelData = geo?.channel_split
    ? [
        { name: 'Online', value: geo.channel_split.online },
        { name: 'In-Store', value: geo.channel_split.in_store }
      ]
    : []

  // Build radar from effectiveness
  const effectivenessMap: any = {}
  ;(promo?.by_effectiveness || []).forEach((e: any) => { effectivenessMap[e.effectiveness] = e })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="text-brand-500" />
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Advanced Analytics</h1>
      </div>

      {/* Promotion Analytics */}
      <div className="glass-card">
        <div className="flex items-center gap-2 mb-4">
          <Tag size={18} className="text-brand-500" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Promotion Performance</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-slate-400 mb-3">Revenue by Promotion Type</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={promo?.by_type || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="type" width={120} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" name="Revenue" fill="#14b8a6" radius={[0, 6, 6, 0]} />
                <Bar dataKey="discount_given" name="Discounts" fill="#6366f1" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <p className="text-sm text-slate-400 mb-3">Revenue by Promotion Channel</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={promo?.by_channel || []} dataKey="revenue" nameKey="channel" cx="50%" cy="50%" outerRadius={85} innerRadius={45} paddingAngle={4}>
                  {(promo?.by_channel || []).map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: any) => [`₹${(v/1000).toFixed(1)}K`, 'Revenue']} />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Geographic & Channel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard title="Revenue by Store Location" subtitle="Which store locations generate the most revenue">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={geo?.by_store || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} />
                <XAxis dataKey="location" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" name="Revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="customers" name="Customers" fill="#14b8a6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <div className="flex flex-col gap-6">
          <ChartCard title="Online vs In-Store" subtitle="Purchase channel split">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={channelData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} innerRadius={35} paddingAngle={4}>
                  {channelData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* Behavioral */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Hourly Transaction Heatmap" subtitle="Peak transaction hours throughout the day">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={behavior?.by_hour || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={h => `${h}:00`} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="transactions" name="Transactions" radius={[4, 4, 0, 0]}>
                {(behavior?.by_hour || []).map((_: any, i: number) => (
                  <Cell key={i} fill={`hsl(${175 - i * 5}, 70%, ${40 + i * 1.5}%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="App Usage vs Avg Spend" subtitle="Engagement level and spending correlation">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={behavior?.app_engagement || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} />
              <XAxis dataKey="usage" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => `$${(v/1000).toFixed(1)}K`} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar yAxisId="left" dataKey="avg_spend" name="Avg Spend" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              <Bar yAxisId="right" dataKey="avg_visits" name="Avg Web Visits" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Customer Support Impact */}
      <ChartCard title="Support Calls vs. Churn Rate" subtitle="Impact of customer support interactions on churn — a key business health metric">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={behavior?.support_impact || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} />
            <XAxis dataKey="calls" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => `${v.toFixed(0)}%`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="churn_rate" name="Churn Rate (%)" radius={[6, 6, 0, 0]}>
              {(behavior?.support_impact || []).map((_: any, i: number) => (
                <Cell key={i} fill={['#10b981', '#f59e0b', '#ef4444', '#7f1d1d'][i % 4]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}

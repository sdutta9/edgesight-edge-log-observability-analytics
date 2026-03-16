import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, LineChart, Line } from 'recharts';
import { Activity, AlertTriangle, Clock, HardDrive, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { api } from '@/lib/api-client';
import type { MetricSummary } from '@shared/types';
const KpiCard = ({ title, value, change, icon: Icon, color, data, loading }: any) => (
  <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm overflow-hidden">
    <CardContent className="p-6">
      <div className="flex items-center justify-between space-y-0 pb-2">
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <div className={`p-2 rounded-lg bg-${color}-500/10`}>
          <Icon className={`h-4 w-4 text-${color}-400`} />
        </div>
      </div>
      <div className="mt-2">
        {loading ? (
          <div className="h-8 w-24 bg-slate-800 animate-pulse rounded" />
        ) : (
          <div className="text-2xl font-bold text-white">{value}</div>
        )}
        <p className={`text-xs mt-1 ${change?.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
          {change}
        </p>
      </div>
      <div className="h-10 mt-4 w-full">
        {!loading && data && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <Line type="monotone" dataKey="val" stroke={`var(--${color}-400)`} strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </CardContent>
  </Card>
);
export function HomePage() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['metrics'],
    queryFn: () => api<MetricSummary[]>('/api/metrics'),
    refetchInterval: 30000,
  });
  const chartData = useMemo(() => {
    if (!metrics) return [];
    return metrics.map(m => ({
      time: format(m.timestamp, 'HH:mm'),
      requests: m.totalRequests,
      errors: m.errorCount,
      latency: m.p90Latency,
    }));
  }, [metrics]);
  const latest = metrics?.[metrics.length - 1];
  const previous = metrics?.[metrics.length - 2];
  const calculateChange = (curr: number, prev: number) => {
    if (!prev) return '0%';
    const diff = ((curr - prev) / prev) * 100;
    return `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`;
  };
  const statusData = [
    { name: '2xx', value: 85, color: '#10b981' },
    { name: '3xx', value: 8, color: '#3b82f6' },
    { name: '4xx', value: 5, color: '#f59e0b' },
    { name: '5xx', value: 2, color: '#f43f5e' },
  ];
  return (
    <AppLayout container>
      <div className="space-y-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">Edge Dashboard</h1>
          <p className="text-slate-400 font-medium">Real-time performance metrics across the Cloudflare edge.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Total Requests"
            value={latest?.totalRequests.toLocaleString() ?? '0'}
            change={calculateChange(latest?.totalRequests || 0, previous?.totalRequests || 0)}
            icon={Activity}
            color="cyan"
            loading={isLoading}
            data={metrics?.slice(-10).map(m => ({ val: m.totalRequests }))}
          />
          <KpiCard
            title="Error Rate"
            value={`${((latest?.errorCount || 0) / (latest?.totalRequests || 1) * 100).toFixed(2)}%`}
            change={calculateChange(latest?.errorCount || 0, previous?.errorCount || 0)}
            icon={AlertTriangle}
            color="rose"
            loading={isLoading}
            data={metrics?.slice(-10).map(m => ({ val: m.errorCount }))}
          />
          <KpiCard
            title="P90 Latency"
            value={`${latest?.p90Latency || 0}ms`}
            change={calculateChange(latest?.p90Latency || 0, previous?.p90Latency || 0)}
            icon={Clock}
            color="amber"
            loading={isLoading}
            data={metrics?.slice(-10).map(m => ({ val: m.p90Latency }))}
          />
          <KpiCard
            title="Bandwidth"
            value={`${((latest?.bandwidth || 0) / 1024 / 1024).toFixed(1)} MB`}
            change={calculateChange(latest?.bandwidth || 0, previous?.bandwidth || 0)}
            icon={HardDrive}
            color="indigo"
            loading={isLoading}
            data={metrics?.slice(-10).map(m => ({ val: m.bandwidth }))}
          />
        </div>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-200">Traffic Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              {isLoading ? (
                <div className="h-full w-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-cyan-500 animate-spin" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#94a3b8' }}
                    />
                    <Area type="monotone" dataKey="requests" stroke="#06b6d4" fillOpacity={1} fill="url(#colorRequests)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-200 text-sm">HTTP Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusData}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-200 text-sm">P90 Latency Trend (ms)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={12} hide />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a' }} />
                    <Area type="monotone" dataKey="latency" stroke="#f59e0b" fill="#f59e0b20" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, LineChart, Line } from 'recharts';
import { Activity, AlertTriangle, Clock, HardDrive, Loader2, Circle } from 'lucide-react';
import { format } from 'date-fns';
import { api } from '@/lib/api-client';
import type { MetricSummary } from '@shared/types';
import { cn } from '@/lib/utils';
const KpiCard = ({ title, value, change, icon: Icon, color, data, loading }: any) => (
  <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-md overflow-hidden relative group">
    <div className={cn("absolute inset-0 bg-gradient-to-br opacity-5 pointer-events-none", {
      'from-cyan-500 to-transparent': color === 'cyan',
      'from-rose-500 to-transparent': color === 'rose',
      'from-amber-500 to-transparent': color === 'amber',
      'from-indigo-500 to-transparent': color === 'indigo',
    })} />
    <CardContent className="p-6">
      <div className="flex items-center justify-between space-y-0 pb-2">
        <p className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">{title}</p>
        <div className={cn("p-2 rounded-lg transition-all duration-300 group-hover:scale-110", {
          'bg-cyan-500/10 text-cyan-400': color === 'cyan',
          'bg-rose-500/10 text-rose-400': color === 'rose',
          'bg-amber-500/10 text-amber-400': color === 'amber',
          'bg-indigo-500/10 text-indigo-400': color === 'indigo',
        })}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-2">
        {loading ? (
          <div className="h-8 w-24 bg-slate-800 animate-pulse rounded" />
        ) : (
          <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
        )}
        <p className={cn("text-xs mt-1 font-medium", change?.startsWith('+') ? 'text-emerald-400' : 'text-rose-400')}>
          {change}
        </p>
      </div>
      <div className="h-12 mt-4 w-full">
        {!loading && data && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <Line 
                type="monotone" 
                dataKey="val" 
                stroke={color === 'cyan' ? '#06b6d4' : color === 'rose' ? '#f43f5e' : color === 'amber' ? '#f59e0b' : '#6366f1'} 
                strokeWidth={2} 
                dot={false} 
                isAnimationActive={true} 
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </CardContent>
  </Card>
);
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg shadow-xl backdrop-blur-xl">
        <p className="text-xs font-mono text-slate-500 mb-2">{label}</p>
        {payload.map((item: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between gap-8 mb-1 last:mb-0">
            <span className="text-xs font-medium text-slate-300 capitalize">{item.name}:</span>
            <span className="text-xs font-bold text-white" style={{ color: item.color }}>{item.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};
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
      Requests: m.totalRequests,
      Errors: m.errorCount,
      Latency: m.p90Latency,
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
      <div className="space-y-8 animate-in fade-in duration-700">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">Edge Dashboard</h1>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <Circle className="h-1.5 w-1.5 fill-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Live</span>
            </div>
          </div>
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
        <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-md overflow-hidden">
          <CardHeader className="border-b border-slate-800/50 pb-4">
            <CardTitle className="text-slate-200 text-lg">Traffic Distribution</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="aspect-[21/9] w-full min-h-[350px]">
              {isLoading ? (
                <div className="h-full w-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-cyan-500 animate-spin" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorErrors" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.5} />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickMargin={10} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickMargin={10} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="Requests" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorRequests)" />
                    <Area type="monotone" dataKey="Errors" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorErrors)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-md">
            <CardHeader className="border-b border-slate-800/50 pb-4">
              <CardTitle className="text-slate-200 text-sm font-semibold uppercase tracking-wider">HTTP Status Distribution</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusData}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: '#1e293b' }} content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40}>
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-md">
            <CardHeader className="border-b border-slate-800/50 pb-4">
              <CardTitle className="text-slate-200 text-sm font-semibold uppercase tracking-wider">P90 Latency Trend (ms)</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.5} />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={11} hide />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="Latency" stroke="#f59e0b" strokeWidth={2} fill="#f59e0b" fillOpacity={0.1} />
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
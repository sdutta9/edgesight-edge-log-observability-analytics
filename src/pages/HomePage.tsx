import React, { useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, LineChart, Line } from 'recharts';
import { Activity, AlertTriangle, Clock, HardDrive } from 'lucide-react';
import { generateMockMetrics } from '@shared/mock-data';
import { format } from 'date-fns';
const metrics = generateMockMetrics(24);
const KpiCard = ({ title, value, change, icon: Icon, color, data }: any) => (
  <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
    <CardContent className="p-6">
      <div className="flex items-center justify-between space-y-0 pb-2">
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <div className={`p-2 rounded-lg bg-${color}-500/10`}>
          <Icon className={`h-4 w-4 text-${color}-400`} />
        </div>
      </div>
      <div className="mt-2">
        <div className="text-2xl font-bold text-white">{value}</div>
        <p className={`text-xs mt-1 ${change.startsWith('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
          {change} from last hour
        </p>
      </div>
      <div className="h-10 mt-4 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line type="monotone" dataKey="val" stroke={`var(--${color}-400)`} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
);
export function HomePage() {
  const chartData = useMemo(() => metrics.map(m => ({
    time: format(m.timestamp, 'HH:mm'),
    requests: m.totalRequests,
    errors: m.errorCount,
    latency: m.p90Latency
  })), []);
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
            title="Total Traffic" 
            value="1.2M" 
            change="+12.5%" 
            icon={Activity} 
            color="cyan"
            data={metrics.slice(-10).map(m => ({ val: m.totalRequests }))}
          />
          <KpiCard 
            title="Error Rate" 
            value="0.42%" 
            change="-2.1%" 
            icon={AlertTriangle} 
            color="rose"
            data={metrics.slice(-10).map(m => ({ val: m.errorCount }))}
          />
          <KpiCard 
            title="Avg Latency" 
            value="42ms" 
            change="+4ms" 
            icon={Clock} 
            color="amber"
            data={metrics.slice(-10).map(m => ({ val: m.p90Latency }))}
          />
          <KpiCard 
            title="Bandwidth" 
            value="4.2 TB" 
            change="+8.2%" 
            icon={HardDrive} 
            color="indigo"
            data={metrics.slice(-10).map(m => ({ val: m.bandwidth }))}
          />
        </div>
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-200">Request Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
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
              <CardTitle className="text-slate-200 text-sm">P90 Latency (ms)</CardTitle>
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
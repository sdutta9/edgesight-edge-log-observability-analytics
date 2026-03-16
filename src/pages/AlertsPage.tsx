import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, AlertTriangle, CheckCircle2, Info, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  status: 'active' | 'resolved';
  title: string;
  description: string;
  timestamp: number;
  path?: string;
}
const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'critical',
    status: 'active',
    title: 'High Error Rate Detected',
    description: 'Error rate exceeded 5% threshold (currently 7.2%).',
    timestamp: Date.now() - 1000 * 60 * 15,
    path: '/api/v1/auth'
  },
  {
    id: '2',
    type: 'warning',
    status: 'active',
    title: 'Latency Spike',
    description: 'P90 Latency reached 450ms (average 120ms).',
    timestamp: Date.now() - 1000 * 60 * 45,
    path: '/api/v1/data'
  },
  {
    id: '3',
    type: 'info',
    status: 'resolved',
    title: 'Deployment Successful',
    description: 'Version v1.2.5 successfully propagated to all edge nodes.',
    timestamp: Date.now() - 1000 * 60 * 120,
  }
];
export function AlertsPage() {
  return (
    <AppLayout container>
      <div className="space-y-8">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">System Alerts</h1>
            <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 px-2 py-0">
              Live Monitoring
            </Badge>
          </div>
          <p className="text-slate-400 font-medium">Monitoring threshold breaches and system health events.</p>
        </div>
        <div className="grid gap-4">
          {mockAlerts.length > 0 ? (
            mockAlerts.map((alert) => (
              <Card key={alert.id} className={cn(
                "bg-slate-900/40 border-slate-800 transition-all hover:bg-slate-900/60",
                alert.status === 'active' ? "border-l-4 border-l-rose-500" : "opacity-60"
              )}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      alert.type === 'critical' ? "bg-rose-500/10 text-rose-400" : 
                      alert.type === 'warning' ? "bg-amber-500/10 text-amber-400" : 
                      "bg-blue-500/10 text-blue-400"
                    )}>
                      {alert.type === 'critical' ? <AlertTriangle className="h-5 w-5" /> : 
                       alert.type === 'warning' ? <Bell className="h-5 w-5" /> : 
                       <Info className="h-5 w-5" />}
                    </div>
                    <div>
                      <CardTitle className="text-slate-100 text-lg">{alert.title}</CardTitle>
                      <CardDescription className="text-slate-400 font-medium">
                        {format(alert.timestamp, 'MMM d, HH:mm:ss')}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={alert.status === 'active' ? "destructive" : "secondary"}>
                    {alert.status.toUpperCase()}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-4">
                    <p className="text-slate-300 text-sm leading-relaxed">{alert.description}</p>
                    {alert.path && (
                      <div className="flex items-center gap-2 text-xs font-mono bg-slate-950 p-2 rounded border border-slate-800 w-fit">
                        <span className="text-slate-500">AFFECTED_PATH:</span>
                        <span className="text-cyan-400">{alert.path}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="h-20 w-20 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">No Active Alerts</h3>
                <p className="text-slate-500">System is operating within normal parameters.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
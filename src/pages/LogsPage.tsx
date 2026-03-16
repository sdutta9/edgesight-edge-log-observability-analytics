import React, { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Filter, Download } from 'lucide-react';
import { generateMockLogs } from '@shared/mock-data';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
export function LogsPage() {
  const [search, setSearch] = useState('');
  const logs = useMemo(() => generateMockLogs(50), []);
  const filteredLogs = useMemo(() => {
    return logs.filter(l => 
      l.path.toLowerCase().includes(search.toLowerCase()) || 
      l.rayId.toLowerCase().includes(search.toLowerCase())
    );
  }, [logs, search]);
  const getStatusColor = (status: number) => {
    if (status >= 500) return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    if (status >= 400) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    if (status >= 300) return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  };
  return (
    <AppLayout container>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Logs Explorer</h1>
            <p className="text-slate-400 text-sm">Real-time edge events across the network.</p>
          </div>
          <Button variant="outline" className="border-slate-800 text-slate-300 hover:bg-slate-800">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
        <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-lg border border-slate-800">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input 
              placeholder="Search by path, ray ID, or IP..." 
              className="pl-10 bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-600"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="border-slate-800 text-slate-400">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/30 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-900/80">
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400 font-medium">Timestamp</TableHead>
                <TableHead className="text-slate-400 font-medium">Method</TableHead>
                <TableHead className="text-slate-400 font-medium">Path</TableHead>
                <TableHead className="text-slate-400 font-medium">Status</TableHead>
                <TableHead className="text-slate-400 font-medium text-right">Latency</TableHead>
                <TableHead className="text-slate-400 font-medium">Ray ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id} className="border-slate-800 hover:bg-slate-800/50 group transition-colors">
                  <TableCell className="text-slate-300 font-mono text-xs">
                    {format(log.timestamp, 'HH:mm:ss.SSS')}
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded",
                      log.method === 'GET' ? 'text-cyan-400' : 'text-purple-400'
                    )}>
                      {log.method}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-200 font-medium max-w-[200px] truncate">
                    {log.path}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("font-mono font-bold", getStatusColor(log.status))}>
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono text-slate-400">
                    {log.latency}ms
                  </TableCell>
                  <TableCell className="text-slate-500 font-mono text-xs uppercase">
                    {log.rayId}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
}
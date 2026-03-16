import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Filter, Download, ChevronRight, ChevronDown, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api-client';
import type { LogEvent } from '@shared/types';
export function LogsPage() {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ['logs'],
    queryFn: () => api<{ items: LogEvent[]; next: string | null }>('/api/logs'),
    refetchInterval: 10000,
  });
  const filteredLogs = useMemo(() => {
    if (!data?.items) return [];
    return data.items.filter(l =>
      l.path.toLowerCase().includes(search.toLowerCase()) ||
      l.rayId.toLowerCase().includes(search.toLowerCase()) ||
      l.ip.includes(search)
    );
  }, [data, search]);
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
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="h-8 w-8 text-cyan-500 animate-spin" />
              <p className="text-slate-500 text-sm">Loading logs from the edge...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-slate-500">No logs found matching your criteria.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-900/80">
                <TableRow className="border-slate-800 hover:bg-transparent">
                  <TableHead className="w-10"></TableHead>
                  <TableHead className="text-slate-400 font-medium">Timestamp</TableHead>
                  <TableHead className="text-slate-400 font-medium">Method</TableHead>
                  <TableHead className="text-slate-400 font-medium">Path</TableHead>
                  <TableHead className="text-slate-400 font-medium text-center">Status</TableHead>
                  <TableHead className="text-slate-400 font-medium text-right">Latency</TableHead>
                  <TableHead className="text-slate-400 font-medium pl-8">Ray ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <React.Fragment key={log.id}>
                    <TableRow 
                      className={cn(
                        "border-slate-800 hover:bg-slate-800/50 group transition-colors cursor-pointer",
                        expandedId === log.id && "bg-slate-800/30"
                      )}
                      onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                    >
                      <TableCell>
                        {expandedId === log.id ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
                      </TableCell>
                      <TableCell className="text-slate-300 font-mono text-xs whitespace-nowrap">
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
                      <TableCell className="text-center">
                        <Badge variant="outline" className={cn("font-mono font-bold", getStatusColor(log.status))}>
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-slate-400">
                        {log.latency}ms
                      </TableCell>
                      <TableCell className="text-slate-500 font-mono text-xs uppercase pl-8">
                        {log.rayId}
                      </TableCell>
                    </TableRow>
                    {expandedId === log.id && (
                      <TableRow className="border-slate-800 bg-slate-950/50 hover:bg-slate-950/50">
                        <TableCell colSpan={7} className="p-4">
                          <div className="bg-slate-900 rounded-md p-4 border border-slate-800 overflow-x-auto">
                            <pre className="text-xs text-cyan-300 font-mono">
                              {JSON.stringify(log, null, 2)}
                            </pre>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
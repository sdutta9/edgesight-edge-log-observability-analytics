import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/layout/AppLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Download, ChevronRight, ChevronDown, Loader2, ListFilter } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api-client';
import type { LogEvent } from '@shared/types';
export function LogsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'errors' | 'success'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ['logs'],
    queryFn: () => api<{ items: LogEvent[]; next: string | null }>('/api/logs'),
    refetchInterval: 10000,
  });
  const filteredLogs = useMemo(() => {
    if (!data?.items) return [];
    return data.items.filter(l => {
      const matchesSearch = l.path.toLowerCase().includes(search.toLowerCase()) ||
                          l.rayId.toLowerCase().includes(search.toLowerCase()) ||
                          l.ip.includes(search);
      const matchesFilter = filter === 'all' ? true :
                           filter === 'errors' ? l.status >= 400 :
                           l.status < 400;
      return matchesSearch && matchesFilter;
    });
  }, [data, search, filter]);
  const getStatusColor = (status: number) => {
    if (status >= 500) return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    if (status >= 400) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    if (status >= 300) return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  };
  return (
    <AppLayout container>
      <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Logs Explorer</h1>
            <p className="text-slate-400 text-sm font-medium">Deep inspection of every request hitting the edge nodes.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 transition-colors">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <div className="h-8 w-[1px] bg-slate-800 mx-2" />
            <div className="flex bg-slate-950 p-1 rounded-md border border-slate-800">
              {(['all', 'success', 'errors'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-3 py-1 text-xs font-bold rounded-sm transition-all uppercase tracking-wider",
                    filter === f ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20" : "text-slate-500 hover:text-slate-300"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-800 backdrop-blur-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search by endpoint, ray ID, or client IP..."
              className="pl-10 bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-600 focus-visible:ring-cyan-500/50"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="border-slate-800 text-slate-400 hover:bg-slate-800">
            <ListFilter className="h-4 w-4" />
          </Button>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/20 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="py-24 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-10 w-10 text-cyan-500 animate-spin" />
                <p className="text-slate-500 text-sm font-mono uppercase tracking-widest">Awaiting edge stream...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="py-24 text-center">
                <p className="text-slate-500 font-medium italic">No events found for current selection.</p>
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-slate-900/90 backdrop-blur-md sticky top-0 z-10">
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="w-10"></TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Timestamp</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Method</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Endpoint</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-widest text-center">Status</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-widest text-right">Latency</TableHead>
                    <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-widest pl-8">Ray ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <React.Fragment key={log.id}>
                      <TableRow
                        className={cn(
                          "border-slate-800 hover:bg-slate-800/40 group transition-colors cursor-pointer",
                          expandedId === log.id && "bg-slate-800/20"
                        )}
                        onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                      >
                        <TableCell>
                          {expandedId === log.id ? <ChevronDown className="h-4 w-4 text-cyan-500" /> : <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-slate-400" />}
                        </TableCell>
                        <TableCell className="text-slate-400 font-mono text-[11px] whitespace-nowrap">
                          {format(log.timestamp, 'HH:mm:ss.SSS')}
                        </TableCell>
                        <TableCell>
                          <span className={cn(
                            "text-[10px] font-black px-2 py-0.5 rounded border",
                            log.method === 'GET' ? 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5' : 
                            log.method === 'POST' ? 'text-purple-400 border-purple-500/20 bg-purple-500/5' :
                            'text-amber-400 border-amber-500/20 bg-amber-500/5'
                          )}>
                            {log.method}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-200 font-medium max-w-[200px] truncate font-mono text-xs">
                          {log.path}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={cn("font-mono font-black text-xs min-w-[40px] justify-center", getStatusColor(log.status))}>
                            {log.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono text-slate-400 text-xs">
                          {log.latency}<span className="text-[10px] text-slate-600 ml-0.5">ms</span>
                        </TableCell>
                        <TableCell className="text-slate-500 font-mono text-[10px] uppercase pl-8 group-hover:text-slate-300 transition-colors">
                          {log.rayId}
                        </TableCell>
                      </TableRow>
                      {expandedId === log.id && (
                        <TableRow className="border-slate-800 bg-slate-950 hover:bg-slate-950">
                          <TableCell colSpan={7} className="p-6">
                            <div className="flex flex-col gap-4">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">Raw Event Payload</h4>
                                <Button variant="ghost" size="sm" className="h-6 text-[10px] text-slate-400 hover:text-white" onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(JSON.stringify(log, null, 2));
                                }}>Copy JSON</Button>
                              </div>
                              <div className="bg-[#0b101b] rounded-lg p-5 border border-slate-800 overflow-x-auto shadow-inner">
                                <pre className="text-xs font-mono leading-relaxed">
                                  {Object.entries(log).map(([key, value]) => (
                                    <div key={key} className="flex gap-4">
                                      <span className="text-cyan-500/80 min-w-[100px] inline-block">"{key}":</span>
                                      <span className={cn(
                                        typeof value === 'number' ? 'text-amber-400' : 
                                        typeof value === 'boolean' ? 'text-purple-400' : 
                                        'text-emerald-400'
                                      )}>
                                        {JSON.stringify(value)}
                                        <span className="text-slate-600">,</span>
                                      </span>
                                    </div>
                                  ))}
                                </pre>
                              </div>
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
      </div>
    </AppLayout>
  );
}
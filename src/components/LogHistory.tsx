import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
import { Search, Calendar, TrendingUp, Activity } from 'lucide-react';
import type { Log } from './FitnessCoach';

interface LogHistoryProps {
  logs: Log[];
}

export const LogHistory = ({ logs }: LogHistoryProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'workout' | 'nutrition' | 'recovery' | 'metrics'>('all');
  const [dateFilter, setDateFilter] = useState('');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || log.type === filterType;
    
    let matchesDate = true;
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      const logDate = log.timestamp;
      matchesDate = isAfter(logDate, startOfDay(filterDate)) && isBefore(logDate, endOfDay(filterDate));
    }
    
    return matchesSearch && matchesType && matchesDate;
  });

  const getLogTypeIcon = (type: string) => {
    switch (type) {
      case 'workout': return <Activity className="h-4 w-4" />;
      case 'recovery': return <TrendingUp className="h-4 w-4" />;
      case 'nutrition': return '🍎';
      case 'metrics': return '📊';
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getLogTypeColor = (type: string) => {
    switch (type) {
      case 'workout': return 'bg-accent/20 text-accent border-accent/30';
      case 'recovery': return 'bg-success/20 text-success border-success/30';
      case 'nutrition': return 'bg-warning/20 text-warning border-warning/30';
      case 'metrics': return 'bg-info/20 text-info border-info/30';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getDOMSColor = (doms: number) => {
    if (doms <= 2) return 'text-success';
    if (doms <= 4) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="bg-gradient-to-br from-card via-card to-card/90">
        <CardHeader>
          <CardTitle className="text-lg">Training History</CardTitle>
          <p className="text-sm text-muted-foreground">
            {logs.length} total logs • Search and filter your training data
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input border-border/50"
              />
            </div>
            
            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger className="bg-input border-border/50">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="workout">Workout</SelectItem>
                <SelectItem value="recovery">Recovery</SelectItem>
                <SelectItem value="nutrition">Nutrition</SelectItem>
                <SelectItem value="metrics">Metrics</SelectItem>
              </SelectContent>
            </Select>
            
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="bg-input border-border/50"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      {logs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {['workout', 'recovery', 'nutrition', 'metrics'].map(type => {
            const count = logs.filter(log => log.type === type).length;
            return (
              <Card key={type} className="bg-gradient-to-br from-card to-card/90">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    {getLogTypeIcon(type)}
                    <div>
                      <p className="text-sm font-medium capitalize">{type}</p>
                      <p className="text-lg font-bold text-accent">{count}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Log List */}
      <Card className="bg-gradient-to-br from-card via-card to-card/90">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recent Logs</CardTitle>
            <Badge variant="outline" className="text-xs">
              {filteredLogs.length} {filteredLogs.length === 1 ? 'entry' : 'entries'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No logs found matching your filters.</p>
                <p className="text-sm">Try adjusting your search criteria.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="border border-border/50 rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge className={getLogTypeColor(log.type)}>
                          {getLogTypeIcon(log.type)}
                          <span className="ml-1 capitalize">{log.type}</span>
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {format(log.timestamp, 'MMM dd, HH:mm')}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm mb-3 text-foreground">{log.content}</p>
                    
                    {log.structured && (
                      <div className="flex flex-wrap gap-3 text-xs">
                        {log.structured.doms !== undefined && (
                          <div className="flex items-center space-x-1">
                            <span className="text-muted-foreground">DOMS:</span>
                            <span className={`font-medium ${getDOMSColor(log.structured.doms)}`}>
                              {log.structured.doms}/10
                            </span>
                          </div>
                        )}
                        {log.structured.weight && (
                          <div className="flex items-center space-x-1">
                            <span className="text-muted-foreground">Weight:</span>
                            <span className="font-medium text-info">{log.structured.weight}kg</span>
                          </div>
                        )}
                        {log.structured.sleep && (
                          <div className="flex items-center space-x-1">
                            <span className="text-muted-foreground">Sleep:</span>
                            <span className={`font-medium ${log.structured.sleep >= 7 ? 'text-success' : 'text-warning'}`}>
                              {log.structured.sleep}h
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
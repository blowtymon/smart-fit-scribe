import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
import { Calendar, Filter, BarChart3, FileText, Download, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Log } from './FitnessCoach';

interface LogHistoryProps {
  logs: Log[];
}

export const LogHistory = ({ logs }: LogHistoryProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'workout' | 'nutrition' | 'recovery' | 'metrics' | 'strength'>('all');
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
      case 'workout': return <BarChart3 className="h-4 w-4" />;
      case 'recovery': return <Calendar className="h-4 w-4" />;
      case 'nutrition': return '🍎';
      case 'metrics': return '📊';
      case 'strength': return '💪';
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
                <SelectItem value="strength">Strength</SelectItem>
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
          {['workout', 'recovery', 'nutrition', 'metrics', 'strength'].map(type => {
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
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {getLogTypeIcon(log.type)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {log.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(log.timestamp, 'MMM dd, HH:mm')}
                            </span>
                          </div>
                          <p className="text-sm">{log.content}</p>
                          
                          {/* Display structured data */}
                          {log.structured && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {log.structured.doms && (
                                <Badge variant="secondary" className="text-xs">
                                  DOMS: {log.structured.doms}/10
                                </Badge>
                              )}
                              {log.structured.weight && (
                                <Badge variant="secondary" className="text-xs">
                                  Weight: {log.structured.weight}kg
                                </Badge>
                              )}
                              {log.structured.waist && (
                                <Badge variant="secondary" className="text-xs">
                                  Waist: {log.structured.waist}cm
                                </Badge>
                              )}
                              {log.structured.bodyFat && (
                                <Badge variant="secondary" className="text-xs">
                                  BF: {log.structured.bodyFat}%
                                </Badge>
                              )}
                               {log.structured.sleep && (
                                 <Badge variant="secondary" className="text-xs">
                                   Sleep: {log.structured.sleep}h
                                 </Badge>
                               )}
                               
                               {/* New structured data */}
                               {log.structured.nutrition && (
                                 <>
                                   {log.structured.nutrition.calories && (
                                     <Badge variant="secondary" className="text-xs">
                                       Cal: {log.structured.nutrition.calories}
                                     </Badge>
                                   )}
                                   {log.structured.nutrition.protein && (
                                     <Badge variant="secondary" className="text-xs">
                                       P: {log.structured.nutrition.protein}g
                                     </Badge>
                                   )}
                                 </>
                               )}
                               
                               {log.structured.recovery && (
                                 <>
                                   {log.structured.recovery.hrv && (
                                     <Badge variant="secondary" className="text-xs">
                                       HRV: {log.structured.recovery.hrv}ms
                                     </Badge>
                                   )}
                                   {log.structured.recovery.doms && (
                                     <Badge variant="secondary" className="text-xs">
                                       DOMS: {log.structured.recovery.doms}/10
                                     </Badge>
                                   )}
                                 </>
                               )}
                               
                               {log.structured.bodyMeasurements && (
                                 <>
                                   {log.structured.bodyMeasurements.weight && (
                                     <Badge variant="secondary" className="text-xs">
                                       Weight: {log.structured.bodyMeasurements.weight}kg
                                     </Badge>
                                   )}
                                   {log.structured.bodyMeasurements.bodyFat && (
                                     <Badge variant="secondary" className="text-xs">
                                       BF: {log.structured.bodyMeasurements.bodyFat}%
                                     </Badge>
                                   )}
                                 </>
                               )}
                               
                               {log.structured.strengthTraining && (
                                 <Badge variant="secondary" className="text-xs">
                                   {log.structured.strengthTraining.exercises?.length || 0} exercises
                                 </Badge>
                               )}
                            </div>
                          )}
                          
                          {/* Display file attachments */}
                          {log.attachments && log.attachments.length > 0 && (
                            <div className="mt-3 space-y-2">
                              <p className="text-xs font-medium text-muted-foreground">
                                Attachments ({log.attachments.length}):
                              </p>
                              <div className="space-y-1">
                                {log.attachments.map((attachment, index) => (
                                  <div key={index} className="flex items-center space-x-2 p-2 bg-muted/50 rounded border">
                                    <FileText className="h-3 w-3 text-accent" />
                                    <span className="text-xs font-medium">{attachment.fileName}</span>
                                    <span className="text-xs text-muted-foreground">
                                      ({(attachment.fileSize / 1024 / 1024).toFixed(2)} MB)
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 ml-auto"
                                      onClick={() => {
                                        // Download file
                                        const link = document.createElement('a');
                                        link.href = attachment.content;
                                        link.download = attachment.fileName;
                                        link.click();
                                      }}
                                    >
                                      <Download className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
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
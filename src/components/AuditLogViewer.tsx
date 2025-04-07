
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { auditService, AuditLog, formatAuditDate } from '@/utils/auditService';
import { ClipboardList, Download, Clock, Filter, Trash2, RotateCw } from 'lucide-react';
import { Badge } from './ui/badge';

export function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [statistics, setStatistics] = useState({
    totalScrapingOperations: 0,
    totalLeadsValidated: 0,
    totalLeadsExported: 0,
    totalLogs: 0
  });

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = () => {
    const allLogs = auditService.getLogs();
    setLogs(allLogs);
    filterLogs(allLogs, actionFilter);
    setStatistics(auditService.getStatistics());
  };

  const filterLogs = (logsToFilter: AuditLog[], action: string) => {
    if (action === 'all') {
      setFilteredLogs(logsToFilter);
    } else {
      setFilteredLogs(logsToFilter.filter(log => log.action === action));
    }
  };

  const handleActionFilterChange = (value: string) => {
    setActionFilter(value);
    filterLogs(logs, value);
  };

  const handleClearLogs = () => {
    auditService.clearLogs();
    loadLogs();
  };

  const getBadgeColorForAction = (action: AuditLog['action']) => {
    switch (action) {
      case 'SCRAPE':
        return 'bg-blue-100 text-blue-800';
      case 'VALIDATE':
        return 'bg-green-100 text-green-800';
      case 'EXPORT':
        return 'bg-purple-100 text-purple-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      case 'MODIFY':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="transition-all duration-300 hover:shadow-md">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Audit Logs
            </CardTitle>
            <CardDescription>
              Track lead generation and validation activities
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={loadLogs}>
              <RotateCw className="h-4 w-4" />
              <span className="sr-only">Refresh</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClearLogs}
              className="text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-3">
            <div className="text-sm">
              <span className="font-medium">{statistics.totalScrapingOperations}</span> searches
            </div>
            <div className="text-sm">
              <span className="font-medium">{statistics.totalLeadsValidated}</span> validations
            </div>
            <div className="text-sm">
              <span className="font-medium">{statistics.totalLeadsExported}</span> exports
            </div>
          </div>
          
          <Select 
            value={actionFilter} 
            onValueChange={handleActionFilterChange}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="SCRAPE">Scraping</SelectItem>
              <SelectItem value="VALIDATE">Validation</SelectItem>
              <SelectItem value="EXPORT">Export</SelectItem>
              <SelectItem value="DELETE">Delete</SelectItem>
              <SelectItem value="MODIFY">Modify</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Count
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log, index) => (
                    <tr key={index} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div className="flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                          {formatAuditDate(log.timestamp)}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <Badge className={getBadgeColorForAction(log.action)}>
                          {log.action}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {log.source || '-'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {log.leads_count || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {log.details ? (
                          <span className="text-xs font-mono">
                            {Object.entries(log.details)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(', ')}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No audit logs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

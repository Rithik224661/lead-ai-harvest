import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { Download, Filter, Search, Trash2, CheckSquare, FileDown, AlertTriangle } from 'lucide-react';
import { Lead } from './LeadCard';
import { LeadTable } from './LeadTable';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from './ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { auditService } from '@/utils/auditService';
import { FilterCriteria } from '@/components/AdvancedFilter';

interface LeadsContentProps {
  leads: Lead[];
  priorityFilter: string | null;
  isLoading?: boolean;
  filters?: FilterCriteria[];
  onApplyFilters?: (newFilters: FilterCriteria[]) => void;
}

export function LeadsContent({ 
  leads, 
  priorityFilter, 
  isLoading = false,
  filters = [],
  onApplyFilters 
}: LeadsContentProps) {
  const [selectedLeads, setSelectedLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState(priorityFilter || 'all');
  const [filterSource, setFilterSource] = useState('all');
  const [filterValidation, setFilterValidation] = useState('all');
  const navigate = useNavigate();
  
  useEffect(() => {
    if (priorityFilter) {
      setFilterPriority(priorityFilter);
    }
  }, [priorityFilter]);

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = searchTerm === '' || 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesPriority = filterPriority === 'all' || lead.priority === filterPriority;
    const matchesSource = filterSource === 'all' || lead.source === filterSource;
    
    const hasValidationIssues = lead.validationIssues && lead.validationIssues.length > 0;
    const matchesValidation = filterValidation === 'all' || 
      (filterValidation === 'valid' && !hasValidationIssues) ||
      (filterValidation === 'invalid' && hasValidationIssues);
    
    const passesExternalFilters = filters.length === 0 || filters.every(filter => {
      const value = lead[filter.field as keyof Lead];
      if (typeof value === 'string') {
        return filter.operator === 'contains' ? 
          value.toLowerCase().includes(filter.value.toLowerCase()) : 
          value.toLowerCase() === filter.value.toLowerCase();
      }
      return true;
    });
    
    return matchesSearch && matchesPriority && matchesSource && matchesValidation && passesExternalFilters;
  });

  const handleToggleSelect = (lead: Lead) => {
    const isSelected = selectedLeads.some(l => l.id === lead.id);
    if (isSelected) {
      setSelectedLeads(selectedLeads.filter(l => l.id !== lead.id));
    } else {
      setSelectedLeads([...selectedLeads, lead]);
    }
  };

  const handleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads([...filteredLeads]);
    }
  };

  const handleExportSelected = () => {
    if (selectedLeads.length === 0) {
      toast.error('Please select leads to export');
      return;
    }

    auditService.logExport('UI_Navigation', selectedLeads.length);
    
    navigate('/export', { state: { selectedLeads: selectedLeads.map(l => l.id) } });
  };

  const handleDeleteSelected = () => {
    if (selectedLeads.length === 0) {
      toast.error('Please select leads to delete');
      return;
    }
    
    const updatedLeads = leads.filter(lead => !selectedLeads.some(l => l.id === lead.id));
    localStorage.setItem('storedLeads', JSON.stringify(updatedLeads));
    
    auditService.addLog('DELETE', { leads_count: selectedLeads.length });
    
    toast.success(`Deleted ${selectedLeads.length} leads`);
    
    setSelectedLeads([]);
    
    window.location.reload();
  };

  const getSourceOptions = () => {
    const sources = [...new Set(leads.map(lead => lead.source))];
    return sources.map(source => (
      <SelectItem key={source} value={source}>
        {source}
      </SelectItem>
    ));
  };

  const leadsWithIssues = leads.filter(lead => 
    lead.validationIssues && lead.validationIssues.length > 0
  ).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Leads</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleExportSelected}
            disabled={selectedLeads.length === 0}
            className="flex items-center gap-1 transition-all duration-300 hover:bg-muted"
          >
            <FileDown className="h-4 w-4" />
            Export ({selectedLeads.length})
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDeleteSelected}
            disabled={selectedLeads.length === 0}
            className="flex items-center gap-1 text-destructive hover:bg-destructive/10 transition-all duration-300"
          >
            <Trash2 className="h-4 w-4" />
            Delete ({selectedLeads.length})
          </Button>
        </div>
      </div>
      
      {priorityFilter && (
        <div className="mb-4 p-3 bg-muted rounded-md animate-in fade-in-80 slide-in-from-bottom-5">
          <p>Showing leads with {priorityFilter} priority</p>
        </div>
      )}
      
      <Card className="transition-all duration-300 hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Lead Management</CardTitle>
              <CardDescription>
                {isLoading ? 'Loading leads...' : `${filteredLeads.length} leads found`}
                {leadsWithIssues > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="ml-2 inline-flex items-center text-amber-500">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          {leadsWithIssues} with issues
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Leads with validation issues detected</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="md:flex-1 flex gap-2">
              <Input 
                placeholder="Search leads..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 transition-all duration-300"
                disabled={isLoading}
              />
              <Button variant="ghost" size="icon" disabled={isLoading}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Select 
                value={filterPriority} 
                onValueChange={(value) => {
                  setFilterPriority(value);
                  if (value === 'all') {
                    navigate('/leads');
                  } else {
                    navigate(`/leads?priority=${value}`);
                  }
                }}
                disabled={isLoading}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
              
              <Select 
                value={filterSource} 
                onValueChange={setFilterSource}
                disabled={isLoading}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {getSourceOptions()}
                </SelectContent>
              </Select>

              <Select 
                value={filterValidation} 
                onValueChange={setFilterValidation}
                disabled={isLoading}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Validation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="valid">Valid Only</SelectItem>
                  <SelectItem value="invalid">Issues Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : filteredLeads.length > 0 ? (
            <LeadTable 
              leads={filteredLeads} 
              selectedLeads={selectedLeads} 
              onSelectLead={handleToggleSelect}
            />
          ) : (
            <div className="text-center py-12 border rounded-md animate-in fade-in-80">
              <p className="text-muted-foreground">No leads found with the current filters.</p>
              {(searchTerm || filterPriority !== 'all' || filterSource !== 'all' || filterValidation !== 'all') && (
                <Button 
                  variant="link" 
                  onClick={() => {
                    setSearchTerm('');
                    setFilterPriority('all');
                    setFilterSource('all');
                    setFilterValidation('all');
                    navigate('/leads');
                  }}
                  className="transition-all duration-300"
                >
                  Clear all filters
                </Button>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSelectAll}
            disabled={isLoading || filteredLeads.length === 0}
            className="transition-all duration-300 hover:bg-muted"
          >
            <CheckSquare className="mr-2 h-4 w-4" />
            {selectedLeads.length === filteredLeads.length && filteredLeads.length > 0
              ? 'Unselect All'
              : 'Select All'
            }
          </Button>
          
          <div className="text-sm text-muted-foreground">
            {selectedLeads.length} of {filteredLeads.length} selected
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

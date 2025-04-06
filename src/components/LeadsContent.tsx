
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { Download, Filter, Search, Trash2, CheckSquare, FileDown } from 'lucide-react';
import { Lead } from './LeadCard';
import { LeadTable } from './LeadTable';
import { useNavigate } from 'react-router-dom';

interface LeadsContentProps {
  leads: Lead[];
  priorityFilter: string | null;
}

export function LeadsContent({ leads, priorityFilter }: LeadsContentProps) {
  const [selectedLeads, setSelectedLeads] = useState<Lead[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState(priorityFilter || 'all');
  const [filterSource, setFilterSource] = useState('all');
  const navigate = useNavigate();

  // Filter leads based on search term and filters
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = searchTerm === '' || 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesPriority = filterPriority === 'all' || lead.priority === filterPriority;
    const matchesSource = filterSource === 'all' || lead.source === filterSource;
    
    return matchesSearch && matchesPriority && matchesSource;
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

    navigate('/export');
  };

  const handleDeleteSelected = () => {
    if (selectedLeads.length === 0) {
      toast.error('Please select leads to delete');
      return;
    }
    
    // In a real app, this would call an API to delete the leads
    const updatedLeads = leads.filter(lead => !selectedLeads.some(l => l.id === lead.id));
    localStorage.setItem('storedLeads', JSON.stringify(updatedLeads));
    
    toast.success(`Deleted ${selectedLeads.length} leads`);
    
    // Reset selected leads
    setSelectedLeads([]);
    
    // Reload page to refresh the leads list
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
            className="flex items-center gap-1"
          >
            <FileDown className="h-4 w-4" />
            Export ({selectedLeads.length})
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDeleteSelected}
            disabled={selectedLeads.length === 0}
            className="flex items-center gap-1 text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            Delete ({selectedLeads.length})
          </Button>
        </div>
      </div>
      
      {priorityFilter && (
        <div className="mb-4 p-3 bg-muted rounded-md">
          <p>Showing leads with {priorityFilter} priority</p>
        </div>
      )}
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Lead Management</CardTitle>
          <CardDescription>
            {filteredLeads.length} leads found
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="md:flex-1 flex gap-2">
              <Input 
                placeholder="Search leads..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button variant="ghost" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Select 
                value={filterPriority} 
                onValueChange={setFilterPriority}
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
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {getSourceOptions()}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {filteredLeads.length > 0 ? (
            <LeadTable 
              leads={filteredLeads} 
              selectedLeads={selectedLeads} 
              onSelectLead={handleToggleSelect}
            />
          ) : (
            <div className="text-center py-12 border rounded-md">
              <p className="text-muted-foreground">No leads found with the current filters.</p>
              {(searchTerm || filterPriority !== 'all' || filterSource !== 'all') && (
                <Button 
                  variant="link" 
                  onClick={() => {
                    setSearchTerm('');
                    setFilterPriority('all');
                    setFilterSource('all');
                  }}
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

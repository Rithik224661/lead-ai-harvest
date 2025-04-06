
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Lead, LeadCard } from './LeadCard';
import { Progress } from './ui/progress';
import { Check, Clock, Database, Download, FileSpreadsheet, Search, Upload, Users } from 'lucide-react';
import { Input } from './ui/input';
import { mockLeads } from '@/data/mockLeads';
import { LeadTable } from './LeadTable';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function LeadDashboard() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads);
  const [selectedLeads, setSelectedLeads] = useState<Lead[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [validationCriteria, setValidationCriteria] = useState('CTO OR VP OR Founder OR Director');
  const [validationProgress, setValidationProgress] = useState(0);
  const navigate = useNavigate();

  const highPriorityLeads = leads.filter(lead => lead.priority === 'high');
  const mediumPriorityLeads = leads.filter(lead => lead.priority === 'medium');
  const lowPriorityLeads = leads.filter(lead => lead.priority === 'low');

  const handleToggleSelect = (lead: Lead) => {
    const isSelected = selectedLeads.some(l => l.id === lead.id);
    if (isSelected) {
      setSelectedLeads(selectedLeads.filter(l => l.id !== lead.id));
    } else {
      setSelectedLeads([...selectedLeads, lead]);
    }
  };

  const handleValidateLeads = () => {
    setIsValidating(true);
    setValidationProgress(0);
    
    // Simulate API call with progress updates
    const interval = setInterval(() => {
      setValidationProgress(prev => {
        const newProgress = prev + Math.random() * 10;
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 200);
    
    // Simulate AI validation based on job titles
    setTimeout(() => {
      clearInterval(interval);
      const newLeads = [...leads];
      
      // Parse validation criteria for more sophisticated filtering
      const criteriaRules = validationCriteria
        .split('OR')
        .map(rule => rule.trim().toLowerCase());
      
      // This simulates the AI validation using the rules
      newLeads.forEach(lead => {
        const title = lead.jobTitle.toLowerCase();
        
        // Check for high priority matches (custom criteria)
        if (criteriaRules.some(rule => title.includes(rule))) {
          lead.priority = 'high';
        } 
        // Check for medium priority
        else if (
          title.includes('manager') || 
          title.includes('lead') || 
          title.includes('head')
        ) {
          lead.priority = 'medium';
        } 
        // Everything else is low priority
        else {
          lead.priority = 'low';
        }
      });
      
      // Store validated leads
      setLeads(newLeads);
      localStorage.setItem('storedLeads', JSON.stringify(newLeads));
      
      setIsValidating(false);
      setValidationProgress(100);
      
      const highPriorityCount = newLeads.filter(l => l.priority === 'high').length;
      const confidence = Math.round((highPriorityCount / newLeads.length) * 100);
      
      toast.success('Leads validated successfully', {
        description: `Found ${highPriorityCount} high priority leads (${confidence}% confidence).`,
      });
    }, 3000);
  };
  
  const handleExportCSV = () => {
    const leadsToExport = selectedLeads.length > 0 ? selectedLeads : leads;
    
    const headers = ['name', 'jobTitle', 'company', 'email', 'phone', 'priority', 'source'];
    
    const csvContent = [
      headers.join(','),
      ...leadsToExport.map(lead => 
        headers.map(header => 
          JSON.stringify(lead[header as keyof Lead] || '')
        ).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `leads-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    const exportType = selectedLeads.length > 0 ? 'selected' : 'all';
    const highPriorityCount = leadsToExport.filter(l => l.priority === 'high').length;
    
    toast.success('CSV exported successfully', {
      description: `Exported ${leadsToExport.length} leads to CSV (${highPriorityCount} high priority).`,
    });
  };

  const handleNavigateToFilter = (priority: Lead['priority']) => {
    navigate(`/leads?priority=${priority}`);
  };

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Leads" 
          value={leads.length} 
          icon={<Database className="h-5 w-5 text-teal-600" />} 
          description="All collected leads" 
          onClick={() => navigate('/leads')} 
          clickable={true}
        />
        <StatCard 
          title="High Priority" 
          value={highPriorityLeads.length} 
          icon={<Check className="h-5 w-5 text-green-600" />} 
          description="Decision makers" 
          onClick={() => handleNavigateToFilter('high')} 
          clickable={true}
        />
        <StatCard 
          title="Medium Priority" 
          value={mediumPriorityLeads.length} 
          icon={<Clock className="h-5 w-5 text-blue-600" />} 
          description="Influencers" 
          onClick={() => handleNavigateToFilter('medium')} 
          clickable={true}
        />
        <StatCard 
          title="Selected" 
          value={selectedLeads.length} 
          icon={<Users className="h-5 w-5 text-indigo-600" />} 
          description="For export" 
          onClick={() => {}} 
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/3 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Validation</CardTitle>
              <CardDescription>
                Use AI to prioritize your leads based on job titles and other criteria
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Validation Criteria</label>
                <Input 
                  placeholder="e.g., CTO OR VP OR Founder" 
                  value={validationCriteria}
                  onChange={(e) => setValidationCriteria(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Use keywords like "CTO", "VP", "Founder", etc. separated by OR to indicate high priority roles
                </p>
              </div>

              {isValidating && (
                <div className="space-y-2">
                  <div className="text-sm flex justify-between">
                    <span>Processing leads...</span>
                    <span>{Math.round(validationProgress)}%</span>
                  </div>
                  <Progress value={validationProgress} className="h-2" />
                </div>
              )}

              <Button 
                onClick={handleValidateLeads}
                disabled={isValidating}
                className="w-full"
              >
                {isValidating ? 'Validating...' : 'Validate Leads'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Export Options</CardTitle>
              <CardDescription>
                Export your leads for use in other systems
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full flex items-center gap-2"
                onClick={() => navigate('/export')}
              >
                <FileSpreadsheet className="h-4 w-4" />
                Configure Export
              </Button>
              <Button 
                variant="outline" 
                className="w-full flex items-center gap-2"
                onClick={handleExportCSV}
              >
                <Download className="h-4 w-4" />
                Quick Export ({selectedLeads.length > 0 ? selectedLeads.length : 'All'})
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="w-full md:w-2/3">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle>Lead Management</CardTitle>
              <div className="flex justify-between items-center">
                <CardDescription>
                  {filteredLeads.length} leads found
                </CardDescription>
                <div className="flex w-full max-w-sm items-center space-x-2">
                  <Input 
                    placeholder="Search leads..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="h-8"
                  />
                  <Button size="sm" variant="ghost" className="h-8 px-2">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="table">
                <TabsList className="mb-4">
                  <TabsTrigger value="table">Table View</TabsTrigger>
                  <TabsTrigger value="cards">Card View</TabsTrigger>
                </TabsList>
                <TabsContent value="table" className="m-0">
                  <LeadTable 
                    leads={filteredLeads} 
                    selectedLeads={selectedLeads}
                    onSelectLead={handleToggleSelect}
                  />
                </TabsContent>
                <TabsContent value="cards" className="m-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredLeads.map((lead) => (
                      <LeadCard 
                        key={lead.id} 
                        lead={lead} 
                        onSelect={handleToggleSelect}
                        isSelected={selectedLeads.some(l => l.id === lead.id)}
                      />
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
  clickable?: boolean;
  onClick: () => void;
}

function StatCard({ title, value, icon, description, clickable = false, onClick }: StatCardProps) {
  return (
    <Card 
      className={`${clickable ? 'cursor-pointer transform transition-all hover:scale-105 hover:shadow-md' : ''}`}
      onClick={clickable ? onClick : undefined}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

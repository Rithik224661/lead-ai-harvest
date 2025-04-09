
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Lead, LeadCard } from './LeadCard';
import { Progress } from './ui/progress';
import { Check, Clock, Database, Download, FileSpreadsheet, Search, Users, AlertCircle, Brain } from 'lucide-react';
import { Input } from './ui/input';
import { mockLeads } from '@/data/mockLeads';
import { LeadTable } from './LeadTable';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { validateLeadsWithAI } from '@/services/aiLeadService';
import { supabase } from '@/integrations/supabase/client';
import { addUserIdToData } from '@/utils/rlsHelpers';

export function LeadDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<Lead[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [validationCriteria, setValidationCriteria] = useState('CTO OR VP OR Founder OR Director');
  const [validationProgress, setValidationProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch leads from Supabase
    const fetchLeads = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase.from('leads').select('*');
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Transform to expected Lead format if needed
          const formattedLeads = data.map(lead => ({
            id: lead.id,
            name: lead.name,
            jobTitle: lead.job_title,
            company: lead.company,
            email: lead.email,
            phone: lead.phone,
            priority: lead.priority || 'medium',
            source: lead.source || 'imported',
            aiScore: lead.ai_score,
            validationIssues: lead.validation_issues
          }));
          
          setLeads(formattedLeads);
        } else {
          // Fallback to mock leads if no data from supabase
          setLeads(mockLeads);
        }
      } catch (e) {
        console.error('Failed to fetch leads from Supabase', e);
        setLeads(mockLeads);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLeads();
  }, []);

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

  const handleValidateLeads = async () => {
    const settings = localStorage.getItem('leadHarvestSettings');
    let apiKey = '';
    
    if (settings) {
      try {
        const parsedSettings = JSON.parse(settings);
        apiKey = parsedSettings.openAiKey;
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
    
    if (!apiKey) {
      toast.error('OpenAI API key is required for validation', {
        description: 'Please add your API key in the Settings page.',
        action: {
          label: 'Go to Settings',
          onClick: () => navigate('/settings')
        }
      });
      return;
    }
    
    setIsValidating(true);
    setValidationProgress(0);
    
    // Simulate API call with progress updates
    const interval = setInterval(() => {
      setValidationProgress(prev => {
        const newProgress = prev + Math.random() * 10;
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 200);
    
    try {
      // Use the AI service to validate leads
      const validatedLeads = await validateLeadsWithAI(leads, validationCriteria);
      
      // Store validated leads
      setLeads(validatedLeads);
      localStorage.setItem('storedLeads', JSON.stringify(validatedLeads));
      
      const highPriorityCount = validatedLeads.filter(l => l.priority === 'high').length;
      const confidence = Math.round((highPriorityCount / validatedLeads.length) * 100);
      
      toast.success('Leads validated successfully', {
        description: `Found ${highPriorityCount} high priority leads (${confidence}% confidence).`,
      });
    } catch (error) {
      console.error('Error validating leads:', error);
      toast.error('Failed to validate leads. Please try again.');
    } finally {
      clearInterval(interval);
      setIsValidating(false);
      setValidationProgress(100);
    }
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
  
  const handleSaveToDatabase = async () => {
    try {
      // Prepare leads with user_id for RLS
      const preparedLeads = await Promise.all(
        leads.map(async (lead) => {
          // Add user_id to each lead for RLS
          return await addUserIdToData({
            name: lead.name,
            job_title: lead.jobTitle,
            company: lead.company,
            email: lead.email,
            phone: lead.phone,
            priority: lead.priority,
            source: lead.source,
            ai_score: lead.aiScore,
            validation_issues: lead.validationIssues
          });
        })
      );
      
      // Insert leads to the database
      const { data, error } = await supabase.from('leads').insert(preparedLeads);
      
      if (error) throw error;
      
      toast.success(`${leads.length} leads added to database`);
    } catch (error) {
      console.error('Error saving leads:', error);
      toast.error('Failed to save leads to database');
    }
  };

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.company?.toLowerCase().includes(searchTerm.toLowerCase())
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
          className="transition-all duration-300 hover:scale-105"
        />
        <StatCard 
          title="High Priority" 
          value={highPriorityLeads.length} 
          icon={<Check className="h-5 w-5 text-green-600" />} 
          description="Decision makers" 
          onClick={() => handleNavigateToFilter('high')} 
          clickable={true}
          className="transition-all duration-300 hover:scale-105"
        />
        <StatCard 
          title="Medium Priority" 
          value={mediumPriorityLeads.length} 
          icon={<Clock className="h-5 w-5 text-blue-600" />} 
          description="Influencers" 
          onClick={() => handleNavigateToFilter('medium')} 
          clickable={true}
          className="transition-all duration-300 hover:scale-105"
        />
        <StatCard 
          title="Selected" 
          value={selectedLeads.length} 
          icon={<Users className="h-5 w-5 text-indigo-600" />} 
          description="For export" 
          onClick={() => {}} 
          className="transition-all duration-300"
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/3 space-y-4">
          <Card className="transition-all duration-300 hover:shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>AI Validation</CardTitle>
                <Brain className="h-5 w-5 text-primary animate-pulse" />
              </div>
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
                  className="transition-all duration-300"
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
                className="w-full transition-all duration-300 hover:scale-105"
              >
                {isValidating ? 'Validating...' : 'Validate Leads'}
              </Button>
              
              {!isValidating && leads.some(l => l.aiScore) && (
                <div className="mt-2 p-2 bg-muted rounded-md transition-all duration-300">
                  <div className="text-sm font-medium mb-1">Validation Results:</div>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>Validated leads:</span>
                      <span>{leads.filter(l => l.aiScore).length} / {leads.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>High priority (9-10):</span>
                      <span>{leads.filter(l => l.aiScore && l.aiScore >= 9).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Medium priority (7-8):</span>
                      <span>{leads.filter(l => l.aiScore && l.aiScore >= 7 && l.aiScore < 9).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Low priority (1-6):</span>
                      <span>{leads.filter(l => l.aiScore && l.aiScore < 7).length}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-md">
            <CardHeader>
              <CardTitle>Export Options</CardTitle>
              <CardDescription>
                Export your leads for use in other systems
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full flex items-center gap-2 transition-all duration-300 hover:bg-muted"
                onClick={() => navigate('/export')}
              >
                <FileSpreadsheet className="h-4 w-4" />
                Configure Export
              </Button>
              <Button 
                variant="outline" 
                className="w-full flex items-center gap-2 transition-all duration-300 hover:bg-muted"
                onClick={handleExportCSV}
              >
                <Download className="h-4 w-4" />
                Quick Export ({selectedLeads.length > 0 ? selectedLeads.length : 'All'})
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="w-full md:w-2/3">
          <Card className="h-full transition-all duration-300 hover:shadow-md">
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
                    className="h-8 transition-all duration-300"
                  />
                  <Button size="sm" variant="ghost" className="h-8 px-2 transition-all duration-300">
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
  className?: string;
}

function StatCard({ title, value, icon, description, clickable = false, onClick, className = '' }: StatCardProps) {
  return (
    <Card 
      className={`${clickable ? 'cursor-pointer transform transition-all hover:scale-105 hover:shadow-md' : ''} ${className}`}
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

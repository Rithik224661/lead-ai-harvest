
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, 
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter, 
  AlertDialogHeader, AlertDialogTitle
} from './ui/alert-dialog';
import { 
  BadgeCheck, Clock, Database, Globe, Pause, Play, 
  RotateCcw, Search, Shield, Target, Brain
} from 'lucide-react';
import { Lead } from './LeadCard';
import { mockLeads } from '@/data/mockLeads';
import { generateLeadsWithAI, validateLeadsWithAI } from '@/services/aiLeadService';

export function FindLeadsContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [foundLeads, setFoundLeads] = useState<Lead[]>([]);
  const [searchSource, setSearchSource] = useState('linkedin');
  const [requestDelay, setRequestDelay] = useState(2);
  const [useProxy, setUseProxy] = useState(true);
  const [respectRobotsTxt, setRespectRobotsTxt] = useState(true);
  const [currentProxy, setCurrentProxy] = useState('192.168.1.1:8080');
  const [requestCount, setRequestCount] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [leadCount, setLeadCount] = useState(5);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  
  // Load settings on component mount
  useEffect(() => {
    const settings = localStorage.getItem('leadHarvestSettings');
    if (settings) {
      try {
        const parsedSettings = JSON.parse(settings);
        setUseProxy(parsedSettings.useProxies !== undefined ? parsedSettings.useProxies : true);
        setRespectRobotsTxt(parsedSettings.respectRobotsTxt !== undefined ? parsedSettings.respectRobotsTxt : true);
        setRequestDelay(parsedSettings.requestDelay || 2);
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
  }, []);

  // Simulated proxies
  const proxies = [
    '192.168.1.1:8080',
    '45.86.231.76:3128',
    '103.152.34.230:80',
    '218.32.241.119:8080',
    '91.243.35.42:3128'
  ];

  // Function to simulate keyword expansion using NLP
  const expandKeywords = (keyword: string): string[] => {
    const expansions: Record<string, string[]> = {
      'ai': ['machine learning', 'deep learning', 'neural networks', 'llm', 'generative ai'],
      'marketing': ['digital marketing', 'growth hacking', 'seo', 'content marketing', 'social media'],
      'sales': ['business development', 'account executive', 'sales representative', 'revenue', 'deals'],
      'tech': ['technology', 'software', 'engineering', 'development', 'programming'],
      'startup': ['founder', 'entrepreneur', 'early-stage', 'seed', 'venture'],
      'finance': ['fintech', 'banking', 'investment', 'wealth management', 'capital']
    };

    const lowercaseKeyword = keyword.toLowerCase();
    // Find matching keywords or return original if no match
    for (const [key, expansionList] of Object.entries(expansions)) {
      if (lowercaseKeyword.includes(key)) {
        return [keyword, ...expansionList];
      }
    }
    return [keyword];
  };

  // Function to handle lead generation with AI
  const handleGenerateLeads = async () => {
    setShowGenerateDialog(false);
    
    if (!searchTerm.trim()) {
      toast.error('Please enter a search term');
      return;
    }
    
    // Check if OpenAI API key is set
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
      toast.error('OpenAI API key is required for lead generation', {
        description: 'Please add your API key in the Settings page.',
      });
      return;
    }

    setIsSearching(true);
    setSearchProgress(0);
    setFoundLeads([]);
    setRequestCount(0);

    // Simulate NLP keyword expansion
    const expandedKeywords = expandKeywords(searchTerm);
    console.log('Expanded keywords:', expandedKeywords);
    
    toast.info(
      `Generating ${leadCount} leads for "${searchTerm}"`, 
      {
        description: `Expanded to: ${expandedKeywords.join(', ')}`,
        duration: 5000
      }
    );

    // Simulate the scraping process with progress updates
    let progress = 0;
    let currentProxyIndex = 0;
    let generatedLeads: Lead[] = [];

    const simulateRequests = setInterval(async () => {
      // Rotate proxy
      if (useProxy) {
        currentProxyIndex = (currentProxyIndex + 1) % proxies.length;
        setCurrentProxy(proxies[currentProxyIndex]);
      }

      // Simulate finding leads
      progress += Math.random() * 15;
      const progressCapped = Math.min(progress, 100);
      setSearchProgress(progressCapped);
      setRequestCount(prev => prev + 1);

      // If almost done, generate the leads with AI
      if (progress > 85 && generatedLeads.length === 0) {
        try {
          generatedLeads = await generateLeadsWithAI({
            count: leadCount,
            searchTerm,
            source: searchSource
          });
          
          setFoundLeads(generatedLeads);
        } catch (error) {
          console.error("Error generating leads:", error);
          toast.error("Error generating leads. Please try again.");
        }
      }

      // Complete the search
      if (progressCapped >= 100) {
        clearInterval(simulateRequests);
        setIsSearching(false);
        toast.success(
          `Found ${generatedLeads.length} leads`, 
          { 
            description: 'Ready for export or validation',
          }
        );
      }
    }, requestDelay * 1000);

    // Cleanup function
    return () => clearInterval(simulateRequests);
  };

  // Function to handle search button click
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      toast.error('Please enter a search term');
      return;
    }
    
    setShowGenerateDialog(true);
  };

  const handleSaveLeads = () => {
    if (foundLeads.length === 0) {
      toast.error('No leads to save');
      return;
    }

    // In a real app, this would save to your database or context
    toast.success(`Saved ${foundLeads.length} leads to My Leads`);
    
    // Reset the search
    setFoundLeads([]);
    setSearchProgress(0);
  };

  const handleValidateLeads = async () => {
    if (foundLeads.length === 0) {
      toast.error('No leads to validate');
      return;
    }

    toast.info('Validating leads with AI...', { duration: 3000 });
    
    // Check if OpenAI API key is set
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
      toast.error('OpenAI API key is required for lead validation', {
        description: 'Please add your API key in the Settings page.',
      });
      return;
    }

    try {
      const validatedLeads = await validateLeadsWithAI(
        foundLeads, 
        "CTO OR VP OR Chief OR Founder OR Director"
      );
      
      setFoundLeads(validatedLeads);
      
      const highCount = validatedLeads.filter(l => l.priority === 'high').length;
      
      toast.success(
        'AI Validation Complete', 
        { 
          description: `Found ${highCount} high-priority leads (${Math.round(highCount/validatedLeads.length * 100)}% confidence)`,
        }
      );
      
      // Update the leads in localStorage to include the AI validation results
      const storedLeadsJSON = localStorage.getItem('storedLeads');
      if (storedLeadsJSON) {
        try {
          const storedLeads = JSON.parse(storedLeadsJSON);
          
          // Update stored leads with validated information
          const updatedStoredLeads = storedLeads.map((storedLead: Lead) => {
            const validatedLead = validatedLeads.find(l => 
              l.email === storedLead.email && l.company === storedLead.company
            );
            
            if (validatedLead) {
              return {
                ...storedLead,
                priority: validatedLead.priority,
                aiScore: validatedLead.aiScore
              };
            }
            
            return storedLead;
          });
          
          localStorage.setItem('storedLeads', JSON.stringify(updatedStoredLeads));
        } catch (e) {
          console.error('Failed to update stored leads', e);
        }
      }
      
    } catch (error) {
      console.error("Error validating leads:", error);
      toast.error("Error validating leads. Please try again.");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card className="w-full transition-all duration-300 hover:shadow-md">
        <CardHeader>
          <CardTitle>Find Leads</CardTitle>
          <CardDescription>
            Search public data sources to discover potential leads
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-3/4 flex gap-2">
              <Input
                placeholder="Search for leads by keyword, company, or industry..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isSearching}
                className="transition-all duration-300"
              />
              <Button 
                variant={isSearching ? "outline" : "default"}
                onClick={isSearching ? () => setIsSearching(false) : handleSearch}
                disabled={!searchTerm && !isSearching}
                className="transition-all duration-300 hover:scale-105"
              >
                {isSearching ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" /> Stop
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" /> Search
                  </>
                )}
              </Button>
            </div>
            <div className="w-full md:w-1/4">
              <Select
                disabled={isSearching}
                defaultValue={searchSource}
                onValueChange={setSearchSource}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="crunchbase">Crunchbase</SelectItem>
                  <SelectItem value="angellist">AngelList</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {showAdvanced && (
            <Card className="bg-muted/20 transition-all duration-300">
              <CardHeader className="py-3">
                <CardTitle className="text-base">Advanced Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="delay">Request Delay (seconds)</Label>
                      <span className="text-xs text-muted-foreground">{requestDelay}s</span>
                    </div>
                    <Slider
                      id="delay"
                      defaultValue={[requestDelay]}
                      min={1}
                      max={10}
                      step={1}
                      onValueChange={(values) => setRequestDelay(values[0])}
                      disabled={isSearching}
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="proxy"
                        checked={useProxy} 
                        onCheckedChange={setUseProxy}
                        disabled={isSearching}
                      />
                      <Label htmlFor="proxy">Enable Proxy Rotation</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="robots"
                        checked={respectRobotsTxt} 
                        onCheckedChange={setRespectRobotsTxt}
                        disabled={isSearching}
                      />
                      <Label htmlFor="robots">Respect robots.txt</Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between items-center">
            <Button 
              variant="ghost" 
              onClick={() => setShowAdvanced(!showAdvanced)}
              size="sm"
              className="transition-all duration-300"
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            </Button>
            {useProxy && isSearching && (
              <div className="flex items-center text-xs text-muted-foreground gap-2 animate-pulse">
                <RotateCcw className="h-3 w-3 animate-spin" />
                <span>Current proxy: {currentProxy}</span>
                <span>Requests: {requestCount}</span>
              </div>
            )}
          </div>

          {isSearching && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Searching...</span>
                <span>{Math.round(searchProgress)}%</span>
              </div>
              <Progress value={searchProgress} className="h-2 transition-all" />
            </div>
          )}
        </CardContent>
      </Card>

      {(isSearching || foundLeads.length > 0) && (
        <Card className="w-full transition-all duration-300 hover:shadow-md">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>Results</CardTitle>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleValidateLeads}
                  disabled={foundLeads.length === 0 || isSearching}
                  className="transition-all duration-300 hover:scale-105"
                >
                  <BadgeCheck className="mr-2 h-4 w-4" />
                  Validate with AI
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveLeads}
                  disabled={foundLeads.length === 0 || isSearching}
                  className="transition-all duration-300 hover:scale-105"
                >
                  <Database className="mr-2 h-4 w-4" />
                  Save to My Leads
                </Button>
              </div>
            </div>
            <CardDescription>
              {foundLeads.length} leads found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">Name</th>
                    <th className="text-left py-3 px-2">Title</th>
                    <th className="text-left py-3 px-2">Company</th>
                    <th className="text-left py-3 px-2">Contact</th>
                    {foundLeads.some(lead => lead.priority) && (
                      <th className="text-left py-3 px-2">Priority</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {foundLeads.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-muted-foreground">
                        {isSearching ? 'Searching for leads...' : 'No leads found yet'}
                      </td>
                    </tr>
                  ) : (
                    foundLeads.map((lead) => (
                      <tr key={lead.id} className="border-b hover:bg-muted/50 transition-colors duration-300">
                        <td className="py-3 px-2">{lead.name}</td>
                        <td className="py-3 px-2">{lead.jobTitle}</td>
                        <td className="py-3 px-2">{lead.company}</td>
                        <td className="py-3 px-2">{lead.email || 'N/A'}</td>
                        {foundLeads.some(lead => lead.priority) && (
                          <td className="py-3 px-2">
                            {lead.priority && (
                              <span 
                                className={`inline-block px-2 py-1 rounded-full text-xs ${
                                  lead.priority === 'high' 
                                    ? 'bg-green-100 text-green-800' 
                                    : lead.priority === 'medium'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                                } transition-all duration-300`}
                              >
                                {lead.aiScore 
                                  ? `${lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)} (${lead.aiScore}/10)`
                                  : lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)
                                }
                              </span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>
                  {respectRobotsTxt ? 'Respecting robots.txt' : 'Warning: robots.txt ignored'}
                </span>
              </div>
            </div>
          </CardFooter>
        </Card>
      )}
      
      {/* Lead Generation Dialog */}
      <AlertDialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <AlertDialogContent className="transition-all duration-300 animate-in fade-in-80 zoom-in-90">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" /> AI Lead Generation
            </AlertDialogTitle>
            <AlertDialogDescription>
              How many leads would you like to generate for <strong>"{searchTerm}"</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label htmlFor="lead-count">Number of leads</Label>
                <span className="text-sm font-medium">{leadCount} leads</span>
              </div>
              <Slider
                id="lead-count"
                value={[leadCount]}
                min={1}
                max={20}
                step={1}
                onValueChange={(values) => setLeadCount(values[0])}
              />
              
              <div className="text-sm text-muted-foreground mt-2">
                <p>Lead generation will use the following parameters:</p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Source: {searchSource}</li>
                  <li>Proxy rotation: {useProxy ? 'Enabled' : 'Disabled'}</li>
                  <li>Request delay: {requestDelay}s</li>
                </ul>
              </div>
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel className="transition-all duration-300">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleGenerateLeads();
              }}
              className="transition-all duration-300 hover:scale-105"
            >
              Generate Leads
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


import React, { useState } from 'react';
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
import { BadgeCheck, Clock, Database, Globe, Pause, Play, RotateCcw, Search, Shield, Target } from 'lucide-react';
import { Lead } from './LeadCard';
import { mockLeads } from '@/data/mockLeads';

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

  // Function to simulate scraping with proxy rotation and rate limiting
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      toast.error('Please enter a search term');
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
      `Searching for "${searchTerm}"`, 
      {
        description: `Expanded to: ${expandedKeywords.join(', ')}`,
        duration: 5000
      }
    );

    // Simulate the scraping process with progress updates
    let progress = 0;
    let currentProxyIndex = 0;

    const simulateRequests = setInterval(() => {
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

      // Add found leads gradually
      if (progress > 20 && foundLeads.length < 10) {
        // Filter mockLeads based on search term or expanded keywords
        const filteredLeads = mockLeads.filter(lead => {
          const matchesKeyword = expandedKeywords.some(keyword => 
            lead.jobTitle.toLowerCase().includes(keyword.toLowerCase()) || 
            lead.company.toLowerCase().includes(keyword.toLowerCase())
          );
          return matchesKeyword;
        });

        // Add some of the filtered leads
        const randomIndex = Math.floor(Math.random() * filteredLeads.length);
        const newLead = {...filteredLeads[randomIndex % filteredLeads.length]};
        newLead.id = `found-${foundLeads.length + 1}`;
        
        setFoundLeads(prev => {
          // Avoid duplicates
          if (prev.some(lead => lead.company === newLead.company && lead.name === newLead.name)) {
            return prev;
          }
          return [...prev, newLead];
        });
      }

      // Complete the search
      if (progressCapped >= 100) {
        clearInterval(simulateRequests);
        setIsSearching(false);
        toast.success(
          `Found ${foundLeads.length + 1} leads`, 
          { 
            description: 'Ready for export or validation',
          }
        );
      }
    }, requestDelay * 1000);

    // Cleanup function
    return () => clearInterval(simulateRequests);
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

  const handleValidateLeads = () => {
    if (foundLeads.length === 0) {
      toast.error('No leads to validate');
      return;
    }

    toast.info('Validating leads with AI...', { duration: 3000 });

    // Simulate AI validation process
    setTimeout(() => {
      const validatedLeads = foundLeads.map(lead => {
        // Simple validation logic based on job title
        const title = lead.jobTitle.toLowerCase();
        let priority;
        
        if (
          title.includes('cto') || 
          title.includes('vp') || 
          title.includes('chief') || 
          title.includes('founder')
        ) {
          priority = 'high';
        } else if (
          title.includes('director') || 
          title.includes('manager') || 
          title.includes('head of')
        ) {
          priority = 'medium';
        } else {
          priority = 'low';
        }
        
        return { ...lead, priority };
      });

      setFoundLeads(validatedLeads);
      
      const highCount = validatedLeads.filter(l => l.priority === 'high').length;
      
      toast.success(
        'AI Validation Complete', 
        { 
          description: `Found ${highCount} high-priority leads (${Math.round(highCount/validatedLeads.length * 100)}% confidence)`,
        }
      );
    }, 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <Card className="w-full">
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
              />
              <Button 
                variant={isSearching ? "outline" : "default"}
                onClick={isSearching ? () => setIsSearching(false) : handleSearch}
                disabled={!searchTerm && !isSearching}
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
            <Card className="bg-muted/20">
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
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            </Button>
            {useProxy && isSearching && (
              <div className="flex items-center text-xs text-muted-foreground gap-2">
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
              <Progress value={searchProgress} />
            </div>
          )}
        </CardContent>
      </Card>

      {(isSearching || foundLeads.length > 0) && (
        <Card className="w-full">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>Results</CardTitle>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleValidateLeads}
                  disabled={foundLeads.length === 0 || isSearching}
                >
                  <BadgeCheck className="mr-2 h-4 w-4" />
                  Validate with AI
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveLeads}
                  disabled={foundLeads.length === 0 || isSearching}
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
                      <tr key={lead.id} className="border-b hover:bg-muted/50">
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
                                }`}
                              >
                                {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)}
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
    </div>
  );
}

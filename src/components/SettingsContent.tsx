
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { Separator } from './ui/separator';
import { Slider } from './ui/slider';
import { Check, KeyRound, Lightbulb, RefreshCw, Shield, UserRound } from 'lucide-react';
import { auditService } from '@/utils/auditService';

export function SettingsContent() {
  // API keys
  const [openAiKey, setOpenAiKey] = useState('');
  const [isVerifyingKey, setIsVerifyingKey] = useState(false);
  const [isKeyVerified, setIsKeyVerified] = useState(false);
  
  // Scraping settings
  const [useProxies, setUseProxies] = useState(true);
  const [respectRobotsTxt, setRespectRobotsTxt] = useState(true);
  const [requestDelay, setRequestDelay] = useState(3);
  
  // Appearance settings
  const [darkMode, setDarkMode] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  
  // Load settings on component mount
  useEffect(() => {
    const settings = localStorage.getItem('leadHarvestSettings');
    if (settings) {
      try {
        const parsedSettings = JSON.parse(settings);
        setOpenAiKey(parsedSettings.openAiKey || '');
        setUseProxies(parsedSettings.useProxies !== undefined ? parsedSettings.useProxies : true);
        setRespectRobotsTxt(parsedSettings.respectRobotsTxt !== undefined ? parsedSettings.respectRobotsTxt : true);
        setRequestDelay(parsedSettings.requestDelay || 3);
        setDarkMode(parsedSettings.darkMode || false);
        setAnimationsEnabled(parsedSettings.animationsEnabled !== undefined ? parsedSettings.animationsEnabled : true);
        setIsKeyVerified(!!parsedSettings.openAiKey);
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }

    // Apply dark mode from settings on load
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Apply animations setting
    if (!animationsEnabled) {
      document.documentElement.classList.add('no-animations');
    } else {
      document.documentElement.classList.remove('no-animations');
    }
  }, []);

  // Apply dark mode when the state changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Apply animations setting when it changes
  useEffect(() => {
    if (!animationsEnabled) {
      document.documentElement.classList.add('no-animations');
    } else {
      document.documentElement.classList.remove('no-animations');
    }
  }, [animationsEnabled]);

  const saveSettings = () => {
    const settings = {
      openAiKey,
      useProxies,
      respectRobotsTxt,
      requestDelay,
      darkMode,
      animationsEnabled
    };
    
    localStorage.setItem('leadHarvestSettings', JSON.stringify(settings));
    toast.success('Settings saved successfully');
  };

  const verifyOpenAIKey = async () => {
    if (!openAiKey.trim()) {
      toast.error('Please enter your OpenAI API key');
      return;
    }
    
    setIsVerifyingKey(true);
    
    try {
      // Simulate API verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real implementation, we would make a test request to the OpenAI API
      // For now, we'll just simulate success
      const isValid = openAiKey.startsWith('sk-') && openAiKey.length > 10;
      
      if (isValid) {
        setIsKeyVerified(true);
        toast.success('API key verified successfully');
        saveSettings();
      } else {
        toast.error('Invalid API key format');
        setIsKeyVerified(false);
      }
    } catch (error) {
      console.error('Error verifying API key:', error);
      toast.error('Failed to verify API key. Please try again.');
      setIsKeyVerified(false);
    } finally {
      setIsVerifyingKey(false);
    }
  };

  const handleToggleChange = (setter: React.Dispatch<React.SetStateAction<boolean>>, value: boolean) => {
    setter(value);
  };

  // Scraping simulation
  const simulateScraping = () => {
    const source = 'LinkedIn';
    auditService.logScrape(source, useProxies, useProxies ? '192.168.1.1:8080' : undefined, 25);
    toast.success(`Scraping simulated from ${source} with ${useProxies ? 'proxies' : 'no proxies'}`);
  };

  // Validation simulation
  const simulateValidation = () => {
    auditService.logValidation(15, 'Email & Company');
    toast.success('Validation simulated for 15 leads');
  };

  // Export simulation
  const simulateExport = () => {
    auditService.logExport('CSV', 10);
    toast.success('Export simulated for 10 leads');
  };

  // Delete simulation
  const simulateDelete = () => {
    auditService.addLog('DELETE', {
      leads_count: 5,
      source: 'Manual selection',
      details: {
        reason: 'Duplicates',
        delete_time: new Date().toISOString()
      }
    });
    toast.success('Delete operation simulated for 5 leads');
  };

  // Modify simulation
  const simulateModify = () => {
    auditService.addLog('MODIFY', {
      leads_count: 3,
      source: 'Bulk edit',
      details: {
        fields_changed: ['priority', 'notes'],
        modify_time: new Date().toISOString()
      }
    });
    toast.success('Modify operation simulated for 3 leads');
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>API Settings</CardTitle>
                <CardDescription>Configure API keys for lead generation</CardDescription>
              </div>
              <KeyRound className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="openai-key">OpenAI API Key</Label>
                {isKeyVerified && <span className="text-xs text-green-600 flex items-center"><Check className="h-3 w-3 mr-1" /> Verified</span>}
              </div>
              <div className="flex space-x-2">
                <Input 
                  type="password"
                  id="openai-key"
                  value={openAiKey}
                  onChange={(e) => setOpenAiKey(e.target.value)}
                  placeholder="sk-..."
                  className="flex-1"
                />
                <Button 
                  onClick={verifyOpenAIKey}
                  disabled={isVerifyingKey}
                  variant="outline"
                >
                  {isVerifyingKey ? 'Verifying...' : 'Verify & Save'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Required for AI lead validation and generation.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Scraping Settings</CardTitle>
                <CardDescription>Configure how leads are discovered</CardDescription>
              </div>
              <RefreshCw className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="use-proxies">Use Proxy Rotation</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically rotate between proxy servers
                  </p>
                </div>
                <Switch 
                  id="use-proxies"
                  checked={useProxies}
                  onCheckedChange={(checked) => handleToggleChange(setUseProxies, checked)}
                />
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="respect-robots">Respect robots.txt</Label>
                  <p className="text-xs text-muted-foreground">
                    Follow website crawling guidelines
                  </p>
                </div>
                <Switch 
                  id="respect-robots"
                  checked={respectRobotsTxt}
                  onCheckedChange={(checked) => handleToggleChange(setRespectRobotsTxt, checked)}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="request-delay">Request Delay (seconds)</Label>
                  <span className="text-sm">{requestDelay}s</span>
                </div>
                <Slider 
                  id="request-delay"
                  min={1}
                  max={10}
                  step={1}
                  value={[requestDelay]}
                  onValueChange={(values) => setRequestDelay(values[0])}
                />
                <p className="text-xs text-muted-foreground">
                  Time between requests to avoid rate limiting
                </p>
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={simulateScraping}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Test Scraping (Audit Log)
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize your experience</CardDescription>
              </div>
              <Lightbulb className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <Switch 
                  id="dark-mode"
                  checked={darkMode}
                  onCheckedChange={(checked) => handleToggleChange(setDarkMode, checked)}
                />
              </div>
              
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="animations">Enable Animations</Label>
                <Switch 
                  id="animations"
                  checked={animationsEnabled}
                  onCheckedChange={(checked) => handleToggleChange(setAnimationsEnabled, checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="transition-all duration-300 hover:shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>User Account</CardTitle>
                <CardDescription>Manage your account settings</CardDescription>
              </div>
              <UserRound className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
                UL
              </div>
              <div>
                <p className="font-medium">Lead AI Harvest User</p>
                <p className="text-sm text-muted-foreground">user@example.com</p>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                Edit Profile
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start text-destructive hover:bg-destructive/10">
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="transition-all duration-300 hover:shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Audit Log Actions</CardTitle>
              <CardDescription>Test functionality for audit logging</CardDescription>
            </div>
            <Shield className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" onClick={simulateScraping}>
              Test Scraping
            </Button>
            <Button variant="outline" onClick={simulateValidation}>
              Test Validation
            </Button>
            <Button variant="outline" onClick={simulateExport}>
              Test Export
            </Button>
            <Button variant="outline" onClick={simulateDelete}>
              Test Delete
            </Button>
            <Button variant="outline" onClick={simulateModify} className="col-span-2 md:col-span-4">
              Test Modify
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end mt-6">
        <Button onClick={saveSettings} className="px-8 transition-all duration-300 hover:scale-105">
          Save All Settings
        </Button>
      </div>
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle, Database, Key, RefreshCcw, RotateCcw, Save, Shield } from 'lucide-react';

interface Settings {
  openAiKey: string;
  useProxies: boolean;
  requestDelay: number;
  respectRobotsTxt: boolean;
  defaultSource: string;
}

export function SettingsContent() {
  const [settings, setSettings] = useState<Settings>({
    openAiKey: '',
    useProxies: true,
    requestDelay: 2,
    respectRobotsTxt: true,
    defaultSource: 'linkedin'
  });
  const [isVerifying, setIsVerifying] = useState(false);
  const [keyIsValid, setKeyIsValid] = useState<boolean | null>(null);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('leadHarvestSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Failed to parse settings from localStorage', e);
      }
    }
  }, []);

  const handleSaveSettings = () => {
    // Save settings to localStorage
    localStorage.setItem('leadHarvestSettings', JSON.stringify(settings));
    toast.success('Settings saved successfully');
  };
  
  const verifyApiKey = async () => {
    if (!settings.openAiKey || settings.openAiKey.trim() === '') {
      toast.error('Please enter an API key');
      return;
    }
    
    setIsVerifying(true);
    setKeyIsValid(null);
    
    try {
      // Simulate API key verification (in a real app, this would call OpenAI's API)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, any key starting with "sk-" is considered valid
      const isValid = settings.openAiKey.startsWith('sk-');
      
      setKeyIsValid(isValid);
      
      if (isValid) {
        toast.success('API key verified successfully');
        handleSaveSettings();
      } else {
        toast.error('Invalid API key format');
      }
    } catch (error) {
      console.error('Error verifying API key:', error);
      toast.error('Failed to verify API key');
      setKeyIsValid(false);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
          <CardDescription>
            Configure API keys for external services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="openai-key">OpenAI API Key</Label>
            <div className="flex gap-2">
              <Input 
                id="openai-key"
                type="password"
                value={settings.openAiKey}
                onChange={(e) => setSettings({...settings, openAiKey: e.target.value})}
                placeholder="sk-..."
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => {
                  const input = document.getElementById('openai-key') as HTMLInputElement;
                  if (input) {
                    input.type = input.type === 'password' ? 'text' : 'password';
                  }
                }}
              >
                <Key className="h-4 w-4" />
              </Button>
            </div>
            {keyIsValid === true && (
              <div className="flex items-center text-green-600 text-sm mt-1">
                <CheckCircle className="h-4 w-4 mr-1" />
                API key verified
              </div>
            )}
            {keyIsValid === false && (
              <div className="flex items-center text-red-600 text-sm mt-1">
                <AlertCircle className="h-4 w-4 mr-1" />
                Invalid API key
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Required for AI-powered lead validation and classification
            </p>
            <Button 
              onClick={verifyApiKey} 
              disabled={isVerifying}
              className="mt-2"
            >
              {isVerifying ? 'Verifying...' : 'Verify & Save API Key'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scraping Settings</CardTitle>
          <CardDescription>
            Configure how the application scrapes data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Use Proxy Rotation</Label>
                <p className="text-sm text-muted-foreground">
                  Rotate between different proxy servers to avoid rate limiting
                </p>
              </div>
              <Switch 
                checked={settings.useProxies}
                onCheckedChange={(checked) => setSettings({...settings, useProxies: checked})}
              />
            </div>

            <div className="space-y-0.5">
              <div className="flex justify-between">
                <Label htmlFor="request-delay">Request Delay (seconds)</Label>
                <span className="text-sm">{settings.requestDelay}s</span>
              </div>
              <Slider
                id="request-delay"
                defaultValue={[settings.requestDelay]}
                min={1}
                max={10}
                step={0.5}
                onValueChange={(values) => setSettings({...settings, requestDelay: values[0]})}
              />
              <p className="text-xs text-muted-foreground">
                Time between requests to avoid detection
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Respect robots.txt</Label>
                <p className="text-sm text-muted-foreground">
                  Follow ethical scraping guidelines
                </p>
              </div>
              <Switch 
                checked={settings.respectRobotsTxt}
                onCheckedChange={(checked) => setSettings({...settings, respectRobotsTxt: checked})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="default-source">Default Search Source</Label>
              <Select 
                value={settings.defaultSource}
                onValueChange={(value) => setSettings({...settings, defaultSource: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select default source" />
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
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveSettings} className="ml-auto">
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>
            Manage your application data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="w-full" onClick={() => {
              window.location.href = '/export';
            }}>
              <Database className="mr-2 h-4 w-4" />
              Export All Data
            </Button>
            <Button variant="outline" className="w-full text-destructive" onClick={() => {
              if (confirm("Are you sure? This will delete all your stored leads.")) {
                localStorage.removeItem('storedLeads');
                toast.success('All data has been cleared');
              }
            }}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Reset Application
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

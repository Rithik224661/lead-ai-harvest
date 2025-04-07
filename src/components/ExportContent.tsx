import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { Download, FileSpreadsheet, FileText, FileArchive, ChevronRight } from 'lucide-react';
import { Lead } from './LeadCard';
import { mockLeads } from '@/data/mockLeads';

export function ExportContent() {
  const [fileType, setFileType] = useState('csv');
  const [selectedLeads, setSelectedLeads] = useState<Lead[]>(mockLeads);
  const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>({
    name: true,
    jobTitle: true,
    company: true,
    email: true,
    phone: true,
    priority: true,
    source: true
  });
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  const filteredLeads = selectedPriority === 'all' 
    ? selectedLeads 
    : selectedLeads.filter(lead => lead.priority === selectedPriority);

  const handleExport = () => {
    const fieldsToExport = Object.entries(selectedFields)
      .filter(([_, isSelected]) => isSelected)
      .map(([field]) => field);
    
    if (fieldsToExport.length === 0) {
      toast.error('Please select at least one field to export');
      return;
    }

    const headers = fieldsToExport.map(field => {
      return field.replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase());
    }).join(',');

    const rows = filteredLeads.map(lead => 
      fieldsToExport.map(field => {
        const value = lead[field as keyof Lead];
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : `"${value}"`;
      }).join(',')
    );

    const csvContent = [headers, ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `leads-export-${new Date().toISOString().split('T')[0]}.${fileType}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    const highPriorityCount = filteredLeads.filter(l => l.priority === 'high').length;
    toast.success('Export successful', {
      description: `Exported ${filteredLeads.length} leads to ${fileType.toUpperCase()} (${highPriorityCount} high priority)`,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Export Leads</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Export Configuration</CardTitle>
              <CardDescription>
                Select export format and customize fields to export
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Export Format</Label>
                <Tabs defaultValue="csv" onValueChange={setFileType} className="w-full">
                  <TabsList className="grid grid-cols-3">
                    <TabsTrigger value="csv" className="flex gap-2 items-center">
                      <FileText className="h-4 w-4" /> CSV
                    </TabsTrigger>
                    <TabsTrigger value="xlsx" className="flex gap-2 items-center">
                      <FileSpreadsheet className="h-4 w-4" /> Excel
                    </TabsTrigger>
                    <TabsTrigger value="pdf" className="flex gap-2 items-center">
                      <FileArchive className="h-4 w-4" /> PDF
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <div className="space-y-2">
                <Label>Lead Priority</Label>
                <Select defaultValue="all" onValueChange={setSelectedPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="high">High Priority Only</SelectItem>
                    <SelectItem value="medium">Medium Priority Only</SelectItem>
                    <SelectItem value="low">Low Priority Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-4">
                <Label>Fields to Export</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="name" 
                      checked={selectedFields.name}
                      onCheckedChange={(checked) => 
                        setSelectedFields({...selectedFields, name: checked as boolean})
                      }
                    />
                    <Label htmlFor="name">Name</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="jobTitle" 
                      checked={selectedFields.jobTitle}
                      onCheckedChange={(checked) => 
                        setSelectedFields({...selectedFields, jobTitle: checked as boolean})
                      }
                    />
                    <Label htmlFor="jobTitle">Job Title</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="company" 
                      checked={selectedFields.company}
                      onCheckedChange={(checked) => 
                        setSelectedFields({...selectedFields, company: checked as boolean})
                      }
                    />
                    <Label htmlFor="company">Company</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="email" 
                      checked={selectedFields.email}
                      onCheckedChange={(checked) => 
                        setSelectedFields({...selectedFields, email: checked as boolean})
                      }
                    />
                    <Label htmlFor="email">Email</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="phone" 
                      checked={selectedFields.phone}
                      onCheckedChange={(checked) => 
                        setSelectedFields({...selectedFields, phone: checked as boolean})
                      }
                    />
                    <Label htmlFor="phone">Phone</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="priority" 
                      checked={selectedFields.priority}
                      onCheckedChange={(checked) => 
                        setSelectedFields({...selectedFields, priority: checked as boolean})
                      }
                    />
                    <Label htmlFor="priority">Priority</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="source" 
                      checked={selectedFields.source}
                      onCheckedChange={(checked) => 
                        setSelectedFields({...selectedFields, source: checked as boolean})
                      }
                    />
                    <Label htmlFor="source">Source</Label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">
                Exporting {filteredLeads.length} leads
              </div>
              <Button onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export {fileType.toUpperCase()}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Export Preview</CardTitle>
              <CardDescription>
                Preview of the data to be exported
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm">
                <div className="font-medium mb-1">File Format:</div>
                <div className="bg-muted rounded p-2">{fileType.toUpperCase()}</div>
              </div>
              
              <div className="text-sm">
                <div className="font-medium mb-1">Lead Count:</div>
                <div className="flex justify-between">
                  <div>Total leads:</div>
                  <div>{filteredLeads.length}</div>
                </div>
                <div className="flex justify-between">
                  <div>High priority:</div>
                  <div>{filteredLeads.filter(l => l.priority === 'high').length}</div>
                </div>
                <div className="flex justify-between">
                  <div>Medium priority:</div>
                  <div>{filteredLeads.filter(l => l.priority === 'medium').length}</div>
                </div>
                <div className="flex justify-between">
                  <div>Low priority:</div>
                  <div>{filteredLeads.filter(l => l.priority === 'low').length}</div>
                </div>
              </div>
              
              <div className="text-sm">
                <div className="font-medium mb-1">Selected Fields:</div>
                <div className="space-y-1">
                  {Object.entries(selectedFields)
                    .filter(([_, isSelected]) => isSelected)
                    .map(([field]) => (
                      <div key={field} className="flex items-center">
                        <ChevronRight className="h-3 w-3 mr-1 text-muted-foreground" />
                        <span>
                          {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

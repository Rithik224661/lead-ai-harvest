
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { ChevronUp, ChevronDown, Wand2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Lead } from './LeadCard';

interface AILeadValidatorProps {
  leads: Lead[];
  onValidationComplete: (validatedLeads: Lead[]) => void;
}

export function AILeadValidator({ leads, onValidationComplete }: AILeadValidatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [validationCriteria, setValidationCriteria] = useState(
    'CEO OR Chief Executive Officer OR Founder OR Owner'
  );
  const [strictness, setStrictness] = useState([5]);
  const [isValidating, setIsValidating] = useState(false);

  const validateLeads = async () => {
    if (leads.length === 0) {
      toast.error('No leads to validate');
      return;
    }

    try {
      setIsValidating(true);
      toast.info(`Validating ${leads.length} leads...`);

      // Get OpenAI key from settings
      const { data: settingsData } = await supabase
        .from('settings')
        .select('open_ai_key')
        .single();
      
      const openAiKey = settingsData?.open_ai_key;

      if (!openAiKey) {
        toast.error('OpenAI API key not found. Please add it in Settings.');
        return;
      }

      // In a real application, this would call an API endpoint that uses OpenAI
      // For now, we'll simulate validation for demonstration purposes
      const validatedLeads = leads.map(lead => {
        // Check if lead's job title matches any of the validation criteria
        const criteriaArray = validationCriteria.split('OR').map(c => c.trim().toLowerCase());
        const title = (lead.jobTitle || '').toLowerCase();
        
        let priority: "high" | "medium" | "low" = "low";
        let aiScore = 1;

        // Find exact rule matches for high priority
        if (criteriaArray.some(rule => title.includes(rule))) {
          priority = 'high';
          aiScore = Math.max(8, 10 - (10 - strictness[0]));
        } 
        // Check for medium priority keywords
        else if (
          title.includes('manager') || 
          title.includes('director') || 
          title.includes('head of')
        ) {
          priority = 'medium';
          aiScore = Math.max(5, 8 - (10 - strictness[0]));
        } 
        // Everything else is low priority
        else {
          priority = 'low';
          aiScore = Math.max(1, 5 - (10 - strictness[0]));
        }
        
        return {
          ...lead,
          priority,
          aiScore,
        };
      });

      // Log the validation activity
      await supabase.from('audit_logs').insert([{
        action: 'VALIDATE',
        source: 'AI Lead Validator',
        leads_count: leads.length,
        details: {
          criteria: validationCriteria,
          strictness: strictness[0],
          validation_time: new Date().toISOString()
        }
      }]);

      // Update validated leads in the database
      for (const lead of validatedLeads) {
        await supabase
          .from('leads')
          .update({
            priority: lead.priority,
            ai_score: lead.aiScore,
            updated_at: new Date().toISOString()
          })
          .eq('id', lead.id);
      }

      toast.success(`${validatedLeads.length} leads validated successfully!`);
      onValidationComplete(validatedLeads);
    } catch (error) {
      console.error('Error validating leads:', error);
      toast.error('Failed to validate leads. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div 
          className="flex justify-between items-center cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div>
            <CardTitle>AI Lead Validation</CardTitle>
            <CardDescription>Automatically score and prioritize leads</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Validation Criteria</label>
              <Textarea
                value={validationCriteria}
                onChange={(e) => setValidationCriteria(e.target.value)}
                placeholder="Enter keywords separated by OR (e.g., CEO OR CTO OR Director)"
                className="min-h-20"
              />
              <p className="text-xs text-muted-foreground">
                Separate keywords with "OR" to identify high-value leads based on job titles.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Validation Strictness</label>
                <span className="text-sm text-muted-foreground">{strictness[0]}/10</span>
              </div>
              <Slider
                value={strictness}
                onValueChange={setStrictness}
                max={10}
                step={1}
                min={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Lenient</span>
                <span>Strict</span>
              </div>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              onClick={validateLeads} 
              disabled={isValidating || leads.length === 0}
              className="w-full"
            >
              <Wand2 className="mr-2 h-4 w-4" />
              {isValidating ? 'Validating...' : `Validate ${leads.length} Leads`}
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  );
}

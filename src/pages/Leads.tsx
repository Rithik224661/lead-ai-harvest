
import { useState, useEffect } from 'react';
import { Layout } from "@/components/Layout";
import { LeadsContent } from "@/components/LeadsContent";
import { Lead } from "@/components/LeadCard";
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { validateLead } from "@/utils/leadValidation";
import { supabase } from '@/integrations/supabase/client';
import { useRealtime } from '@/hooks/useRealtime';
import { AILeadValidator } from '@/components/AILeadValidator';
import { FilterCriteria, AdvancedFilter } from '@/components/AdvancedFilter';

const Leads = () => {
  const [searchParams] = useSearchParams();
  const priority = searchParams.get('priority');
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterCriteria[]>([]);
  
  // Use the real-time hook to get leads with live updates
  const { data: realtimeLeads, loading: realtimeLoading, error } = useRealtime<Lead>('leads');
  const [leads, setLeads] = useState<Lead[]>([]);
  
  // Apply filters and validation to the realtime leads
  useEffect(() => {
    if (realtimeLoads === null) return;

    // Apply any validations needed
    const processedLeads = realtimeLeads.map((lead: any) => {
      // Only validate if the lead hasn't been validated yet
      if (!lead.validationIssues) {
        const validation = validateLead(lead);
        return {
          ...lead,
          validationIssues: validation.isValid ? [] : validation.issues
        };
      }
      return lead;
    });
    
    setLeads(processedLeads);
    setIsLoading(false);
    
  }, [realtimeLeads]);

  // Handle filter application
  const handleApplyFilters = (newFilters: FilterCriteria[]) => {
    setFilters(newFilters);
  };

  // Handle validation completion
  const handleValidationComplete = (validatedLeads: Lead[]) => {
    // The leads will be updated automatically through the realtime subscription
    toast.success('Lead validation complete');
  };

  if (error) {
    toast.error('Error loading leads data');
    console.error('Error loading leads:', error);
  }
  
  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <LeadsContent 
              leads={leads} 
              priorityFilter={priority} 
              isLoading={isLoading || realtimeLoading} 
              filters={filters}
              onApplyFilters={handleApplyFilters}
            />
          </div>
          <div className="space-y-6">
            <AILeadValidator 
              leads={leads} 
              onValidationComplete={handleValidationComplete} 
            />
            <AdvancedFilter onApplyFilters={handleApplyFilters} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Leads;

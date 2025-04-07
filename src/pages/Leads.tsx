
import React, { useState, useEffect } from 'react';
import { Layout } from "@/components/Layout";
import { LeadsContent } from "@/components/LeadsContent";
import { Lead } from "@/components/LeadCard";
import { mockLeads } from "@/data/mockLeads";
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { validateLead } from "@/utils/leadValidation";

const Leads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [searchParams] = useSearchParams();
  const priority = searchParams.get('priority');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // In a real application, this would fetch from an API
    // We'll simulate loading with a small delay for UX
    setIsLoading(true);
    
    const loadLeads = async () => {
      try {
        // Get leads from localStorage
        const storedLeads = localStorage.getItem('storedLeads');
        let leadsData = mockLeads;
        
        if (storedLeads) {
          try {
            leadsData = JSON.parse(storedLeads);
          } catch (e) {
            console.error('Failed to parse leads from localStorage', e);
            toast.error('Failed to load leads data');
          }
        } else {
          // Store mock leads in localStorage for future use
          localStorage.setItem('storedLeads', JSON.stringify(mockLeads));
        }
        
        // Perform validation check on each lead
        const validatedLeads = leadsData.map((lead: Lead) => {
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
        
        // Filter by priority if provided
        let filteredLeads = validatedLeads;
        if (priority) {
          filteredLeads = validatedLeads.filter(lead => lead.priority === priority);
        }
        
        // Small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 300));
        setLeads(filteredLeads);
        
        // Update localStorage with validations
        localStorage.setItem('storedLeads', JSON.stringify(validatedLeads));
      } catch (error) {
        console.error('Error loading leads:', error);
        toast.error('Failed to load leads data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLeads();
  }, [priority]);
  
  return (
    <Layout>
      <LeadsContent 
        leads={leads} 
        priorityFilter={priority} 
        isLoading={isLoading} 
      />
    </Layout>
  );
};

export default Leads;


import React, { useState, useEffect } from 'react';
import { Layout } from "@/components/Layout";
import { LeadsContent } from "@/components/LeadsContent";
import { Lead } from "@/components/LeadCard";
import { mockLeads } from "@/data/mockLeads";

const Leads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const params = new URLSearchParams(window.location.search);
  const priority = params.get('priority');
  
  useEffect(() => {
    // In a real application, this would fetch from an API
    // For now, we'll use mockLeads and filter them based on the URL parameter
    const storedLeads = localStorage.getItem('storedLeads');
    let leadsData = mockLeads;
    
    if (storedLeads) {
      try {
        leadsData = JSON.parse(storedLeads);
      } catch (e) {
        console.error('Failed to parse leads from localStorage', e);
      }
    } else {
      // Store mock leads in localStorage for future use
      localStorage.setItem('storedLeads', JSON.stringify(mockLeads));
    }
    
    // Filter by priority if provided
    if (priority) {
      leadsData = leadsData.filter(lead => lead.priority === priority);
    }
    
    setLeads(leadsData);
  }, [priority]);
  
  return (
    <Layout>
      <LeadsContent leads={leads} priorityFilter={priority} />
    </Layout>
  );
};

export default Leads;

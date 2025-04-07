import { Lead } from "@/components/LeadCard";
import { toast } from "sonner";
import { validateLead, enhancedValidateLeadsWithAI } from "@/utils/leadValidation";
import { auditService } from "@/utils/auditService";

interface AIGenerationOptions {
  count: number;
  searchTerm: string;
  source: string;
}

export const generateLeadsWithAI = async (options: AIGenerationOptions): Promise<Lead[]> => {
  const { count, searchTerm, source } = options;
  
  try {
    // Check if an API key is stored in settings
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
      return [];
    }
    
    // Simulate API call with realistic delay
    // In a real implementation, this would make an actual API call to OpenAI
    const generatedLeads = await simulateAILeadGeneration(count, searchTerm, source);
    
    // Log the scraping activity
    auditService.logScrape(source, true, '192.168.1.1:8080', generatedLeads.length);
    
    // Store the newly generated leads
    const existingLeadsJSON = localStorage.getItem('storedLeads');
    const existingLeads: Lead[] = existingLeadsJSON ? JSON.parse(existingLeadsJSON) : [];
    
    // Merge new leads with existing ones, avoiding duplicates by company and name
    const mergedLeads = [...existingLeads];
    
    generatedLeads.forEach(newLead => {
      const isDuplicate = existingLeads.some(
        lead => lead.company === newLead.company && lead.name === newLead.name
      );
      
      if (!isDuplicate) {
        mergedLeads.push(newLead);
      }
    });
    
    // Save to localStorage
    localStorage.setItem('storedLeads', JSON.stringify(mergedLeads));
    
    return generatedLeads;
  } catch (error) {
    console.error("Error generating leads with AI:", error);
    throw error;
  }
};

export const validateLeadsWithAI = async (leads: Lead[], criteria: string): Promise<Lead[]> => {
  try {
    // Check for API key
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
      return leads;
    }

    // Use our enhanced validation that includes suspicious lead detection
    const validatedLeads = await enhancedValidateLeadsWithAI(leads, criteria, apiKey);
    
    // Log the validation activity
    auditService.logValidation(leads.length, criteria);
    
    return validatedLeads;
  } catch (error) {
    console.error("Error validating leads with AI:", error);
    throw error;
  }
};

// Helper function to simulate AI lead generation with more realistic data
const simulateAILeadGeneration = async (count: number, searchTerm: string, source: string): Promise<Lead[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const companyTypes = ['Tech', 'Finance', 'Healthcare', 'Education', 'Manufacturing', 'Retail'];
  const jobLevels = ['C-Level', 'VP', 'Director', 'Manager', 'Lead', 'Specialist'];
  const jobFunctions = ['Technology', 'Marketing', 'Sales', 'Operations', 'Product', 'Finance'];
  const sources = [source || 'LinkedIn', 'Twitter', 'CrunchBase'];
  
  const generatedLeads: Lead[] = [];
  
  for (let i = 0; i < count; i++) {
    // Generate company name based on search term
    const companyType = companyTypes[Math.floor(Math.random() * companyTypes.length)];
    let companyName = '';
    
    if (searchTerm) {
      // Use the search term as part of company name
      const searchWords = searchTerm.split(' ');
      const primaryWord = searchWords[0];
      companyName = `${primaryWord.charAt(0).toUpperCase() + primaryWord.slice(1)} ${companyType}`;
      
      // Add some variations
      if (Math.random() > 0.5) {
        companyName += " Solutions";
      } else if (Math.random() > 0.7) {
        companyName += " Inc";
      }
    } else {
      // Generate random company name if no search term
      const prefixes = ['Tech', 'Next', 'Smart', 'Cloud', 'Digital', 'Future', 'Global'];
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      companyName = `${prefix} ${companyType}`;
    }
    
    // Generate position based on search term if possible
    const jobLevel = jobLevels[Math.floor(Math.random() * jobLevels.length)];
    const jobFunction = jobFunctions[Math.floor(Math.random() * jobFunctions.length)];
    
    let jobTitle = '';
    if (searchTerm && searchTerm.toLowerCase().includes('marketing')) {
      jobTitle = `${jobLevel} of Marketing`;
    } else if (searchTerm && searchTerm.toLowerCase().includes('sales')) {
      jobTitle = `${jobLevel} of Sales`;
    } else if (searchTerm && searchTerm.toLowerCase().includes('tech')) {
      jobTitle = `${jobLevel === 'C-Level' ? 'CTO' : `${jobLevel} of Technology`}`;
    } else {
      jobTitle = `${jobLevel} of ${jobFunction}`;
    }
    
    // Generate random name
    const firstNames = ['John', 'Sarah', 'Michael', 'Emma', 'David', 'Olivia', 'James', 'Sophia', 'William', 'Ava'];
    const lastNames = ['Smith', 'Johnson', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Wilson'];
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    
    // Generate email based on name and company
    const companyDomain = companyName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '') + '.com';
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${companyDomain}`;
    
    // Generate phone with proper formatting
    const areaCode = Math.floor(Math.random() * 900) + 100;
    const part1 = Math.floor(Math.random() * 900) + 100;
    const part2 = Math.floor(Math.random() * 9000) + 1000;
    const phone = `(${areaCode}) ${part1}-${part2}`;
    
    // Determine priority based on job title
    let priority: "high" | "medium" | "low" = "low";
    
    if (jobLevel === 'C-Level' || jobLevel === 'VP') {
      priority = 'high';
    } else if (jobLevel === 'Director' || jobLevel === 'Manager') {
      priority = 'medium';
    }
    
    generatedLeads.push({
      id: `gen-${Date.now()}-${i}`,
      name,
      jobTitle,
      company: companyName,
      email,
      phone,
      priority,
      source: sources[Math.floor(Math.random() * sources.length)],
      aiScore: undefined // Will be set during validation
    });
  }
  
  return generatedLeads;
};

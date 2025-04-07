
import { Lead } from "@/components/LeadCard";
import { toast } from "sonner";

// Email validation patterns
const disposableEmailDomains = [
  "tempmail.com", "fake.com", "mailinator.com", "yopmail.com", 
  "guerrillamail.com", "sharklasers.com", "dispostable.com"
];

export interface ValidationResult {
  valid: boolean;
  reason?: string;
  score?: number;
}

/**
 * Validates an email address format and checks for disposable email services
 */
export const validateEmail = (email: string): ValidationResult => {
  // Check if email is null or empty
  if (!email || email.trim() === '') {
    return { valid: false, reason: "Email is empty" };
  }
  
  // Basic format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, reason: "Invalid format" };
  }
  
  // Check for disposable email domains
  const domain = email.split('@')[1].toLowerCase();
  if (disposableEmailDomains.includes(domain)) {
    return { valid: false, reason: "Disposable email" };
  }
  
  return { valid: true };
};

/**
 * Validates a company name for potential issues
 */
export const validateCompany = (company: string): ValidationResult => {
  if (!company || company.trim() === '') {
    return { valid: false, reason: "Company name is empty" };
  }
  
  // Check for suspicious company names
  const suspiciousNames = ["Test", "Demo", "Example", "Fake"];
  if (suspiciousNames.some(name => company.toLowerCase().includes(name.toLowerCase()))) {
    return { valid: false, reason: "Suspicious company name" };
  }
  
  return { valid: true };
};

/**
 * Validates a phone number format
 */
export const validatePhone = (phone: string): ValidationResult => {
  // Skip validation if phone is null or empty
  if (!phone || phone.trim() === '') {
    return { valid: true }; // Phone is optional
  }
  
  // Check if phone number has a reasonable length
  if (phone.replace(/\D/g, '').length < 7) {
    return { valid: false, reason: "Too short" };
  }
  
  return { valid: true };
};

/**
 * Performs comprehensive lead validation
 */
export const validateLead = (lead: Lead): {
  isValid: boolean;
  issues: { field: string; reason: string }[];
} => {
  const issues: { field: string; reason: string }[] = [];
  
  // Validate email
  const emailValidation = validateEmail(lead.email || '');
  if (!emailValidation.valid) {
    issues.push({ field: 'email', reason: emailValidation.reason || 'Invalid email' });
  }
  
  // Validate company
  const companyValidation = validateCompany(lead.company);
  if (!companyValidation.valid) {
    issues.push({ field: 'company', reason: companyValidation.reason || 'Invalid company' });
  }
  
  // Validate phone
  const phoneValidation = validatePhone(lead.phone || '');
  if (!phoneValidation.valid) {
    issues.push({ field: 'phone', reason: phoneValidation.reason || 'Invalid phone' });
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
};

/**
 * Enhanced AI validation that incorporates suspicious lead detection
 */
export const enhancedValidateLeadsWithAI = async (
  leads: Lead[], 
  criteria: string,
  apiKey: string
): Promise<Lead[]> => {
  try {
    if (!apiKey) {
      toast.error('OpenAI API key is required for lead validation', {
        description: 'Please add your API key in the Settings page.',
      });
      return leads;
    }

    const validatedLeads = await Promise.all(leads.map(async (lead) => {
      // First run basic validation
      const validation = validateLead(lead);
      
      // Apply automatic validation first
      let priority: "high" | "medium" | "low" = "low";
      let aiScore = 1;
      
      // Parse validation criteria
      const criteriaRules = criteria
        .split('OR')
        .map(rule => rule.trim().toLowerCase());
      
      const title = lead.jobTitle.toLowerCase();
      
      // Find exact rule matches for high priority
      if (criteriaRules.some(rule => title.includes(rule))) {
        priority = 'high';
        aiScore = Math.floor(Math.random() * 2) + 9; // 9-10
      } 
      // Check for medium priority keywords
      else if (
        title.includes('manager') || 
        title.includes('lead') || 
        title.includes('head')
      ) {
        priority = 'medium';
        aiScore = Math.floor(Math.random() * 2) + 7; // 7-8
      } 
      // Everything else is low priority
      else {
        priority = 'low';
        aiScore = Math.floor(Math.random() * 6) + 1; // 1-6
      }
      
      // If suspicious, lower the priority
      if (!validation.isValid) {
        priority = 'low';
        aiScore = Math.max(1, aiScore - 4); // Lower score but not below 1
      }
      
      return {
        ...lead,
        priority,
        aiScore,
        validationIssues: validation.issues
      };
    }));
    
    return validatedLeads;
  } catch (error) {
    console.error("Error validating leads with AI:", error);
    toast.error("Error validating leads. Please try again.");
    throw error;
  }
};

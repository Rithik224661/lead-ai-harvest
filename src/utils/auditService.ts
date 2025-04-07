
/**
 * Audit logging service to track lead operations
 */

export interface AuditLog {
  timestamp: string;
  action: 'SCRAPE' | 'VALIDATE' | 'EXPORT' | 'DELETE' | 'MODIFY';
  source?: string;
  proxy_used?: string;
  leads_count?: number;
  user_id?: string;
  details?: Record<string, any>;
}

class AuditService {
  private logs: AuditLog[] = [];
  
  constructor() {
    // Load any existing logs from localStorage
    this.loadLogs();
  }
  
  private loadLogs() {
    try {
      const savedLogs = localStorage.getItem('leadHarvestAuditLogs');
      if (savedLogs) {
        this.logs = JSON.parse(savedLogs);
      }
    } catch (error) {
      console.error('Failed to load audit logs', error);
    }
  }
  
  private saveLogs() {
    try {
      localStorage.setItem('leadHarvestAuditLogs', JSON.stringify(this.logs));
    } catch (error) {
      console.error('Failed to save audit logs', error);
    }
  }
  
  /**
   * Add a new audit log entry
   */
  public addLog(action: AuditLog['action'], details: Partial<AuditLog> = {}) {
    const newLog: AuditLog = {
      timestamp: new Date().toISOString(),
      action,
      ...details
    };
    
    this.logs.push(newLog);
    this.saveLogs();
    return newLog;
  }
  
  /**
   * Log scraping activity
   */
  public logScrape(source: string, proxies: boolean, proxyUsed?: string, leadsCount?: number) {
    return this.addLog('SCRAPE', {
      source: source || 'Unknown Source',
      proxy_used: proxies ? proxyUsed : 'none',
      leads_count: leadsCount,
      details: { 
        proxies_enabled: proxies,
        scrape_time: new Date().toISOString()
      }
    });
  }
  
  /**
   * Log validation activity
   */
  public logValidation(leadsCount: number, criteria: string) {
    return this.addLog('VALIDATE', {
      source: 'Lead Validation',
      leads_count: leadsCount,
      details: { 
        criteria,
        validation_time: new Date().toISOString() 
      }
    });
  }
  
  /**
   * Log export activity
   */
  public logExport(format: string, leadsCount: number) {
    return this.addLog('EXPORT', {
      source: `${format} Export`,
      leads_count: leadsCount,
      details: { 
        format,
        export_time: new Date().toISOString()
      }
    });
  }

  /**
   * Log delete activity
   */
  public logDelete(leadsCount: number, reason?: string) {
    return this.addLog('DELETE', {
      source: 'Lead Deletion',
      leads_count: leadsCount,
      details: {
        reason: reason || 'Manual deletion',
        delete_time: new Date().toISOString()
      }
    });
  }

  /**
   * Log modify activity
   */
  public logModify(leadsCount: number, fieldsChanged: string[]) {
    return this.addLog('MODIFY', {
      source: 'Lead Modification',
      leads_count: leadsCount,
      details: {
        fields_changed: fieldsChanged.join(', '),
        modify_time: new Date().toISOString()
      }
    });
  }
  
  /**
   * Get all logs
   */
  public getLogs(): AuditLog[] {
    return [...this.logs];
  }
  
  /**
   * Get logs filtered by action
   */
  public getLogsByAction(action: AuditLog['action']): AuditLog[] {
    return this.logs.filter(log => log.action === action);
  }
  
  /**
   * Clear all logs
   */
  public clearLogs() {
    this.logs = [];
    this.saveLogs();
  }
  
  /**
   * Get statistics about logs
   */
  public getStatistics() {
    const totalScrapingOperations = this.logs.filter(log => log.action === 'SCRAPE').length;
    const totalLeadsValidated = this.logs
      .filter(log => log.action === 'VALIDATE')
      .reduce((sum, log) => sum + (log.leads_count || 0), 0);
    const totalLeadsExported = this.logs
      .filter(log => log.action === 'EXPORT')
      .reduce((sum, log) => sum + (log.leads_count || 0), 0);
      
    return {
      totalScrapingOperations,
      totalLeadsValidated,
      totalLeadsExported,
      totalLogs: this.logs.length
    };
  }
}

// Export a singleton instance
export const auditService = new AuditService();

// Helper function to get a formatted date string
export const formatAuditDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

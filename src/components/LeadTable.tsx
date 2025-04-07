
import { Lead } from "./LeadCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Checkbox } from "./ui/checkbox";
import { Badge } from "./ui/badge";

interface LeadTableProps {
  leads: Lead[];
  selectedLeads: Lead[];
  onSelectLead: (lead: Lead) => void;
}

export function LeadTable({ leads, selectedLeads, onSelectLead }: LeadTableProps) {
  const priorityClasses = {
    high: "bg-green-100 text-green-800 hover:bg-green-100",
    medium: "bg-blue-100 text-blue-800 hover:bg-blue-100", 
    low: "bg-gray-100 text-gray-800 hover:bg-gray-100"
  };
  
  const getPriorityLabel = (lead: Lead) => {
    const base = lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1);
    return lead.aiScore ? `${base} (${lead.aiScore}/10)` : base;
  };
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Source</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No leads found.
              </TableCell>
            </TableRow>
          ) : (
            leads.map((lead) => (
              <TableRow key={lead.id} className="group">
                <TableCell>
                  <Checkbox 
                    checked={selectedLeads.some(l => l.id === lead.id)}
                    onCheckedChange={() => onSelectLead(lead)}
                  />
                </TableCell>
                <TableCell className="font-medium">{lead.name}</TableCell>
                <TableCell>{lead.jobTitle}</TableCell>
                <TableCell>{lead.company}</TableCell>
                <TableCell>{lead.email || "-"}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={priorityClasses[lead.priority]}>
                    {getPriorityLabel(lead)}
                  </Badge>
                </TableCell>
                <TableCell>{lead.source}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

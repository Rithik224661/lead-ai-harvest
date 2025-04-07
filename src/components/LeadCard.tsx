
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Mail, Phone, Building, User, Briefcase } from "lucide-react";

export interface Lead {
  id: string;
  name: string;
  jobTitle: string;
  company: string;
  email: string | null;
  phone: string | null;
  priority: "high" | "medium" | "low";
  source: string;
  aiScore?: number; // Added AI score property
}

interface LeadCardProps {
  lead: Lead;
  onSelect: (lead: Lead) => void;
  isSelected: boolean;
}

export function LeadCard({ lead, onSelect, isSelected }: LeadCardProps) {
  return (
    <Card className={`transition-all ${isSelected ? 'border-teal-500 shadow-md' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{lead.name}</CardTitle>
          <PriorityBadge priority={lead.priority} aiScore={lead.aiScore} />
        </div>
        <CardDescription className="flex items-center gap-1">
          <Briefcase className="h-3.5 w-3.5" />
          {lead.jobTitle}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-1.5 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Building className="h-3.5 w-3.5" />
            <span>{lead.company}</span>
          </div>
          {lead.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              <span>{lead.email}</span>
            </div>
          )}
          {lead.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-3.5 w-3.5" />
              <span>{lead.phone}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button
          variant={isSelected ? "default" : "outline"}
          className="w-full"
          onClick={() => onSelect(lead)}
        >
          {isSelected ? "Selected" : "Select"}
        </Button>
      </CardFooter>
    </Card>
  );
}

function PriorityBadge({ priority, aiScore }: { priority: Lead["priority"], aiScore?: number }) {
  const variants = {
    high: "bg-green-100 text-green-800 hover:bg-green-100",
    medium: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    low: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  };

  // Show AI score if available
  const label = aiScore 
    ? `${priority.charAt(0).toUpperCase() + priority.slice(1)} (${aiScore}/10)`
    : `${priority.charAt(0).toUpperCase() + priority.slice(1)} Priority`;

  return <Badge variant="outline" className={variants[priority]}>{label}</Badge>;
}

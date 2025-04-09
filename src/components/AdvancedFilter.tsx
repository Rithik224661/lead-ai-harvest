
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Filter, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

export interface FilterCriteria {
  field: string;
  operator: string;
  value: string;
}

interface AdvancedFilterProps {
  onApplyFilters: (filters: FilterCriteria[]) => void;
}

export function AdvancedFilter({ onApplyFilters }: AdvancedFilterProps) {
  const [filters, setFilters] = useState<FilterCriteria[]>([]);
  const [currentFilter, setCurrentFilter] = useState<FilterCriteria>({
    field: 'name',
    operator: 'contains',
    value: '',
  });

  const handleAddFilter = () => {
    if (!currentFilter.value.trim()) return;
    
    setFilters([...filters, { ...currentFilter }]);
    setCurrentFilter({ ...currentFilter, value: '' });
  };

  const handleRemoveFilter = (index: number) => {
    const newFilters = [...filters];
    newFilters.splice(index, 1);
    setFilters(newFilters);
    onApplyFilters(newFilters);
  };

  const handleApply = () => {
    onApplyFilters(filters);
  };

  const handleClear = () => {
    setFilters([]);
    onApplyFilters([]);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 flex-wrap">
        {filters.map((filter, index) => (
          <Badge key={index} variant="secondary" className="gap-1 pl-2">
            <span>
              {filter.field} {filter.operator} "{filter.value}"
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 ml-1"
              onClick={() => handleRemoveFilter(index)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1">
              <Filter className="h-4 w-4" />
              Add Filter
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium">Advanced Filters</h4>
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor="field">Field</Label>
                    <Select
                      value={currentFilter.field}
                      onValueChange={(value) =>
                        setCurrentFilter({ ...currentFilter, field: value })
                      }
                    >
                      <SelectTrigger id="field">
                        <SelectValue placeholder="Field" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="company">Company</SelectItem>
                        <SelectItem value="jobTitle">Job Title</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="operator">Operator</Label>
                    <Select
                      value={currentFilter.operator}
                      onValueChange={(value) =>
                        setCurrentFilter({ ...currentFilter, operator: value })
                      }
                    >
                      <SelectTrigger id="operator">
                        <SelectValue placeholder="Operator" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contains">Contains</SelectItem>
                        <SelectItem value="equals">Equals</SelectItem>
                        <SelectItem value="starts_with">Starts with</SelectItem>
                        <SelectItem value="ends_with">Ends with</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="value">Value</Label>
                    <Input
                      id="value"
                      value={currentFilter.value}
                      onChange={(e) =>
                        setCurrentFilter({ ...currentFilter, value: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" size="sm" onClick={handleClear}>
                    Clear All
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={handleAddFilter}>
                      Add
                    </Button>
                    <Button size="sm" onClick={handleApply}>
                      Apply
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        {filters.length > 0 && (
          <Button variant="ghost" size="sm" onClick={handleClear}>
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}

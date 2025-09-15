import React, { useState, useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { X, ChevronDown, Search } from 'lucide-react';

interface Option {
  id: string;
  name: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

interface SearchableMultiSelectProps {
  options: Option[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
  placeholder?: string;
  label?: string;
  maxHeight?: string;
  emptyMessage?: string;
  loading?: boolean;
}

export const SearchableMultiSelect: React.FC<SearchableMultiSelectProps> = ({
  options,
  selectedValues,
  onSelectionChange,
  placeholder = "Search and select...",
  label,
  maxHeight = "200px",
  emptyMessage = "No options available",
  loading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.subtitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get selected option objects
  const selectedOptions = options.filter(option => selectedValues.includes(option.id));

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleOption = (optionId: string) => {
    if (selectedValues.includes(optionId)) {
      onSelectionChange(selectedValues.filter(id => id !== optionId));
    } else {
      onSelectionChange([...selectedValues, optionId]);
    }
  };

  const handleRemoveSelected = (optionId: string) => {
    onSelectionChange(selectedValues.filter(id => id !== optionId));
  };

  const handleOpen = () => {
    setIsOpen(true);
    // Focus the search input when opening
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  return (
    <div className="w-full space-y-2">
      {label && <Label className="text-sm font-medium">{label}</Label>}
      
      {/* Selected items display */}
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 bg-muted/50 rounded-lg">
          {selectedOptions.map(option => (
            <Badge key={option.id} variant="secondary" className="flex items-center gap-1">
              {option.icon}
              <span className="text-xs">{option.name}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1 hover:bg-transparent"
                onClick={() => handleRemoveSelected(option.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Dropdown trigger */}
      <div className="relative" ref={dropdownRef}>
        <Button
          variant="outline"
          className="w-full justify-between text-left font-normal"
          onClick={handleOpen}
          type="button"
        >
          <span className="truncate">
            {selectedOptions.length > 0 
              ? `${selectedOptions.length} selected`
              : placeholder
            }
          </span>
          <ChevronDown className="h-4 w-4 ml-2 flex-shrink-0" />
        </Button>

        {/* Dropdown content */}
        {isOpen && (
          <Card className="absolute z-50 w-full mt-1 p-2 shadow-lg">
            {/* Search input */}
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Options list */}
            <div 
              className="space-y-1 overflow-y-auto"
              style={{ maxHeight }}
            >
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Loading...</p>
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    {searchTerm ? 'No matches found' : emptyMessage}
                  </p>
                </div>
              ) : (
                filteredOptions.map(option => (
                  <div
                    key={option.id}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors hover:bg-muted ${
                      selectedValues.includes(option.id) ? 'bg-primary/10' : ''
                    }`}
                    onClick={() => handleToggleOption(option.id)}
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      {option.icon}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{option.name}</p>
                        {option.subtitle && (
                          <p className="text-xs text-muted-foreground truncate">{option.subtitle}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0 ml-2">
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          selectedValues.includes(option.id)
                            ? 'bg-primary border-primary'
                            : 'border-muted-foreground'
                        }`}
                      >
                        {selectedValues.includes(option.id) && (
                          <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Summary footer */}
            {filteredOptions.length > 0 && (
              <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                {selectedValues.length} of {options.length} selected
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default SearchableMultiSelect;
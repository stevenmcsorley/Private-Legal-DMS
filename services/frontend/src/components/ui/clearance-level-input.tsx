import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, Lock, Eye, AlertTriangle, Info, Lightbulb } from 'lucide-react';
import { 
  validateClearanceLevel, 
  getRecommendedClearanceLevel, 
  getClearanceRange,
  getClearanceDescription 
} from '@/utils/clearance-config';

interface ClearanceLevelInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  maxLevel?: number;
  roles?: string[];
  showRecommendation?: boolean;
  showValidation?: boolean;
}

const getClearanceLabel = (level: number): string => {
  const labels = {
    1: 'Public',
    2: 'Internal',
    3: 'Confidential',
    4: 'Restricted',
    5: 'Secret',
    6: 'Top Secret',
    7: 'Compartmented',
    8: 'Special Access',
    9: 'Critical',
    10: 'Ultra Classified'
  };
  return labels[level as keyof typeof labels] || `Level ${level}`;
};

const getClearanceColor = (level: number): string => {
  if (level <= 2) return 'border-green-600 bg-green-900/30 text-green-400';
  if (level <= 4) return 'border-blue-600 bg-blue-900/30 text-blue-400';
  if (level <= 6) return 'border-yellow-600 bg-yellow-900/30 text-yellow-400';
  if (level <= 8) return 'border-orange-600 bg-orange-900/30 text-orange-400';
  return 'border-red-600 bg-red-900/30 text-red-400';
};

const getClearanceIcon = (level: number) => {
  if (level <= 2) return <Eye className="h-3 w-3" />;
  if (level <= 4) return <Shield className="h-3 w-3" />;
  if (level <= 6) return <Lock className="h-3 w-3" />;
  return <AlertTriangle className="h-3 w-3" />;
};

export const ClearanceLevelInput = ({ 
  value, 
  onChange, 
  label = 'Security Clearance Level',
  required = false,
  disabled = false,
  maxLevel = 10,
  roles = [],
  showRecommendation = true,
  showValidation = true
}: ClearanceLevelInputProps) => {
  const [validation, setValidation] = useState<{ valid: boolean; message?: string; recommendation?: number }>({ valid: true });
  const [recommendedLevel, setRecommendedLevel] = useState<number | null>(null);
  const [clearanceRange, setClearanceRange] = useState<{ min: number; max: number }>({ min: 1, max: maxLevel });

  useEffect(() => {
    if (roles.length > 0 && showValidation) {
      const validationResult = validateClearanceLevel(value, roles);
      setValidation(validationResult);
      
      if (showRecommendation) {
        const recommended = getRecommendedClearanceLevel(roles);
        setRecommendedLevel(recommended !== value ? recommended : null);
      }
      
      const range = getClearanceRange(roles);
      setClearanceRange({ min: range.min, max: Math.min(range.max, maxLevel) });
    }
  }, [value, roles, maxLevel, showValidation, showRecommendation]);

  const applyRecommendation = () => {
    if (recommendedLevel !== null) {
      onChange(recommendedLevel);
    }
  };
  return (
    <div className="space-y-2">
      <Label htmlFor="clearance-level">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <Select 
            value={value.toString()} 
            onValueChange={(val) => onChange(parseInt(val))}
            disabled={disabled}
          >
            <SelectTrigger className={`w-64 ${!validation.valid ? 'border-red-500' : ''}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: maxLevel }, (_, i) => i + 1)
                .filter(level => roles.length === 0 || (level >= clearanceRange.min && level <= clearanceRange.max))
                .map((level) => (
                <SelectItem key={level} value={level.toString()}>
                  <div className="flex items-center space-x-2">
                    {getClearanceIcon(level)}
                    <span>Level {level} - {getClearanceLabel(level)}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Badge className={getClearanceColor(value)}>
            <div className="flex items-center space-x-1">
              {getClearanceIcon(value)}
              <span>Level {value}</span>
            </div>
          </Badge>

          {recommendedLevel !== null && (
            <Button
              variant="outline"
              size="sm"
              onClick={applyRecommendation}
              className="text-blue-600 border-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900/20"
            >
              <Lightbulb className="h-3 w-3 mr-1" />
              Use Level {recommendedLevel}
            </Button>
          )}
        </div>

        {/* Validation Message */}
        {!validation.valid && (
          <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/20 dark:border-red-800">
            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
            <div className="text-sm text-red-700 dark:text-red-300">
              {validation.message}
            </div>
          </div>
        )}

        {/* Role-based guidance */}
        {roles.length > 0 && (
          <div className="text-xs text-slate-500 space-y-1">
            <div className="flex items-center space-x-1">
              <Info className="h-3 w-3" />
              <span>Valid range for selected roles: {clearanceRange.min} - {clearanceRange.max}</span>
            </div>
            <div>{getClearanceDescription(value)}</div>
          </div>
        )}
      </div>
      
      {roles.length === 0 && (
        <p className="text-xs text-slate-500">
          Higher clearance levels can access lower-level classified documents.
        </p>
      )}
    </div>
  );
};
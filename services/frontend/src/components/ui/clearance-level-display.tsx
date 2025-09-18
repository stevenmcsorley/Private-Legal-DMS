import { Badge } from '@/components/ui/badge';
import { Shield, Lock, Eye, AlertTriangle } from 'lucide-react';

interface ClearanceLevelDisplayProps {
  level: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
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

const getClearanceIcon = (level: number, size: string = 'sm') => {
  const iconClass = size === 'lg' ? 'h-4 w-4' : size === 'md' ? 'h-3.5 w-3.5' : 'h-3 w-3';
  
  if (level <= 2) return <Eye className={iconClass} />;
  if (level <= 4) return <Shield className={iconClass} />;
  if (level <= 6) return <Lock className={iconClass} />;
  return <AlertTriangle className={iconClass} />;
};

export const ClearanceLevelDisplay = ({ 
  level, 
  showLabel = true,
  size = 'sm'
}: ClearanceLevelDisplayProps) => {
  return (
    <Badge className={getClearanceColor(level)}>
      <div className="flex items-center space-x-1">
        {getClearanceIcon(level, size)}
        <span>
          {showLabel ? `${getClearanceLabel(level)} (${level})` : `Level ${level}`}
        </span>
      </div>
    </Badge>
  );
};
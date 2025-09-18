import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClearanceLevelDisplay } from '@/components/ui/clearance-level-display';
import { Shield, Info, Clock, FileText, AlertCircle } from 'lucide-react';
import { getClearanceDescription, getClearanceRange } from '@/utils/clearance-config';

interface UserClearanceProfileProps {
  user: {
    id: string;
    display_name: string;
    email: string;
    roles: string[];
    clearance_level: number;
    created_at: string;
  };
}

interface AccessibleSecurityClass {
  level: number;
  label: string;
  description: string;
  matterCount?: number;
}

export const UserClearanceProfile = ({ user }: UserClearanceProfileProps) => {
  const [accessibleClasses, setAccessibleClasses] = useState<AccessibleSecurityClass[]>([]);
  const [recentClearanceHistory, setRecentClearanceHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccessibleSecurityClasses();
    fetchClearanceHistory();
  }, [user.id]);

  const fetchAccessibleSecurityClasses = async () => {
    try {
      const response = await fetch(`/api/admin/users/${user.id}/accessible-security-classes`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setAccessibleClasses(data.classes || []);
      }
    } catch (error) {
      console.error('Error fetching accessible security classes:', error);
    }
  };

  const fetchClearanceHistory = async () => {
    try {
      const response = await fetch(`/api/admin/users/${user.id}/clearance-history`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setRecentClearanceHistory(data.history || []);
      }
    } catch (error) {
      console.error('Error fetching clearance history:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearanceRange = getClearanceRange(user.roles);

  const securityClassLabels = {
    1: 'Public',
    2: 'Internal', 
    3: 'Confidential',
    4: 'Restricted',
    5: 'Secret'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-2 text-sm text-slate-400">Loading clearance profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Clearance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-amber-500" />
            <span>Security Clearance Profile</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-slate-300 mb-2 block">Current Clearance Level</Label>
              <ClearanceLevelDisplay level={user.clearance_level} showLabel={true} size="lg" />
              <p className="text-sm text-slate-400 mt-2">
                {getClearanceDescription(user.clearance_level)}
              </p>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-slate-300 mb-2 block">Role-Based Range</Label>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-400">Valid range:</span>
                <Badge variant="outline" className="text-slate-300">
                  Level {clearanceRange.min} - {clearanceRange.max}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {user.roles.map((role) => (
                  <Badge key={role} variant="secondary" className="text-xs">
                    {role.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {user.clearance_level < clearanceRange.min || user.clearance_level > clearanceRange.max ? (
            <div className="flex items-start space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-md dark:bg-amber-900/20 dark:border-amber-800">
              <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
              <div className="text-sm">
                <p className="text-amber-800 dark:text-amber-200 font-medium">Clearance Level Notice</p>
                <p className="text-amber-700 dark:text-amber-300">
                  Your current clearance level is outside the typical range for your assigned roles.
                </p>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Document Access Rights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-500" />
            <span>Document Access Rights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400 mb-4">
            You can access documents and matters with these security classifications:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map((securityClass) => {
              const canAccess = user.clearance_level >= securityClass;
              const accessibleClass = accessibleClasses.find(ac => ac.level === securityClass);
              
              return (
                <div 
                  key={securityClass}
                  className={`p-3 rounded-lg border ${
                    canAccess 
                      ? 'border-green-600 bg-green-900/20 text-green-300' 
                      : 'border-slate-600 bg-slate-800/30 text-slate-500'
                  }`}
                >
                  <div className="text-center">
                    <div className={`text-lg font-bold ${canAccess ? 'text-green-400' : 'text-slate-500'}`}>
                      {securityClass}
                    </div>
                    <div className="text-xs font-medium">
                      {securityClassLabels[securityClass as keyof typeof securityClassLabels]}
                    </div>
                    {canAccess && accessibleClass?.matterCount !== undefined && (
                      <div className="text-xs mt-1 opacity-80">
                        {accessibleClass.matterCount} matters
                      </div>
                    )}
                    <div className="mt-1">
                      {canAccess ? (
                        <Badge className="text-xs bg-green-600 text-white">Accessible</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Restricted</Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md dark:bg-blue-900/20 dark:border-blue-800">
            <div className="flex items-start space-x-2">
              <Info className="h-4 w-4 text-blue-500 mt-0.5" />
              <div className="text-sm">
                <p className="text-blue-800 dark:text-blue-200 font-medium">Access Rule</p>
                <p className="text-blue-700 dark:text-blue-300">
                  Your clearance level {user.clearance_level} allows access to security class {user.clearance_level} and below.
                  Higher security classes require elevated clearance.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Clearance History */}
      {recentClearanceHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-purple-500" />
              <span>Recent Clearance Changes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentClearanceHistory.slice(0, 5).map((entry, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <ClearanceLevelDisplay level={entry.old_clearance} size="sm" showLabel={false} />
                      <span className="text-slate-400">→</span>
                      <ClearanceLevelDisplay level={entry.new_clearance} size="sm" showLabel={false} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Clearance updated by {entry.changed_by}
                      </p>
                      {entry.reason && (
                        <p className="text-xs text-slate-400">Reason: {entry.reason}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(entry.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Helper Label component if not imported
const Label = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={className}>{children}</div>
);
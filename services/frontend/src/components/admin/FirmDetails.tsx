import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Edit,
  Building,
  Users,
  FileText,
  Briefcase,
  Calendar,
  Activity,
  HardDrive,
  TrendingUp,
  Loader2,
} from 'lucide-react';

interface FirmStats {
  firm: {
    id: string;
    name: string;
    external_ref?: string;
    created_at: string;
    settings: Record<string, any>;
  };
  users: {
    total: number;
    active: number;
    by_role: Record<string, number>;
  };
  clients: {
    total: number;
    active: number;
  };
  matters: {
    total: number;
    by_status: Record<string, number>;
  };
  documents: {
    total: number;
    total_size_gb: number;
    by_status: Record<string, number>;
  };
  activity: {
    documents_uploaded_last_30_days: number;
    matters_created_last_30_days: number;
    users_created_last_30_days: number;
  };
}

export const FirmDetails: React.FC = () => {
  const { firmId } = useParams<{ firmId: string }>();
  const navigate = useNavigate();
  const [firmStats, setFirmStats] = useState<FirmStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (firmId) {
      fetchFirmStats();
    }
  }, [firmId]);

  const fetchFirmStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/firms/${firmId}/stats`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const stats = await response.json();
        setFirmStats(stats);
      } else {
        setError('Failed to fetch firm statistics');
      }
    } catch (error) {
      console.error('Error fetching firm stats:', error);
      setError('Failed to fetch firm statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToFirms = () => {
    navigate('/admin?tab=firms');
  };

  const handleEditFirm = () => {
    navigate(`/admin/firms/${firmId}/edit`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500 mx-auto" />
          <p className="mt-2 text-slate-400">Loading firm details...</p>
        </div>
      </div>
    );
  }

  if (error || !firmStats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleBackToFirms}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Firms
          </Button>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <Building className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-100 mb-2">Error Loading Firm Details</h3>
            <p className="text-slate-400">{error || 'Firm not found'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleBackToFirms}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Firms
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center">
              <Building className="h-6 w-6 mr-3 text-amber-500" />
              {firmStats.firm.name}
            </h1>
            <div className="flex items-center space-x-4 mt-1">
              {firmStats.firm.external_ref && (
                <Badge variant="outline" className="text-xs">
                  {firmStats.firm.external_ref}
                </Badge>
              )}
              <p className="text-slate-400 text-sm">
                Created {new Date(firmStats.firm.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
        
        <Button onClick={handleEditFirm}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Firm
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-amber-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-300">Users</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-slate-100">{firmStats.users.total}</p>
                  <span className="ml-2 text-sm text-green-600">
                    ({firmStats.users.active} active)
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-300">Clients</p>
                <div className="flex items-center">
                  <p className="text-2xl font-bold text-slate-100">{firmStats.clients.total}</p>
                  <span className="ml-2 text-sm text-green-600">
                    ({firmStats.clients.active} active)
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Briefcase className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-300">Matters</p>
                <p className="text-2xl font-bold text-slate-100">{firmStats.matters.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-300">Documents</p>
                <p className="text-2xl font-bold text-slate-100">{firmStats.documents.total.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by Role */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2 text-amber-500" />
              Users by Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(firmStats.users.by_role).map(([role, count]) => (
                <div key={role} className="flex justify-between items-center">
                  <span className="text-slate-300 capitalize">{role.replace('_', ' ')}</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {count}
                    </Badge>
                    <div className="w-20 bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-amber-500 h-2 rounded-full" 
                        style={{ width: `${Math.max(10, (count / firmStats.users.total) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Matter Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-green-500" />
              Matters by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(firmStats.matters.by_status).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <span className="text-slate-300 capitalize">{status.replace('_', ' ')}</span>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {count}
                    </Badge>
                    <div className="w-20 bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${Math.max(10, (count / firmStats.matters.total) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Storage Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <HardDrive className="h-5 w-5 mr-2 text-purple-500" />
              Storage Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">
                  {firmStats.documents.total_size_gb.toFixed(1)} GB
                </div>
                <div className="text-sm text-slate-400">Total storage used</div>
              </div>
              
              {Object.entries(firmStats.documents.by_status).length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-slate-300">Documents by Status</h4>
                  {Object.entries(firmStats.documents.by_status).map(([status, count]) => (
                    <div key={status} className="flex justify-between text-sm">
                      <span className="text-slate-400 capitalize">{status.replace('_', ' ')}</span>
                      <span className="text-slate-100">{count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-blue-500" />
              Recent Activity (30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-blue-400" />
                  <span className="text-slate-300">Documents uploaded</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-blue-400">
                    {firmStats.activity.documents_uploaded_last_30_days}
                  </Badge>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Briefcase className="h-4 w-4 text-green-400" />
                  <span className="text-slate-300">Matters created</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-green-400">
                    {firmStats.activity.matters_created_last_30_days}
                  </Badge>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-amber-400" />
                  <span className="text-slate-300">Users created</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-amber-400">
                    {firmStats.activity.users_created_last_30_days}
                  </Badge>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Firm Settings Preview */}
      {firmStats.firm.settings && Object.keys(firmStats.firm.settings).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-slate-400" />
              Firm Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(firmStats.firm.settings).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <div className="text-sm font-medium text-slate-300 capitalize">
                    {key.replace(/_/g, ' ')}
                  </div>
                  <div className="text-sm text-slate-400">
                    {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
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
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Archive, 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  AlertTriangle,
  FileText,
  Shield,
  Search
} from 'lucide-react';
// Table component not available - using div-based layout instead
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';

interface RetentionPolicy {
  id: string;
  name: string;
  description?: string;
  retention_years: number;
  auto_delete: boolean;
  legal_hold_override: boolean;
  created_at: string;
  updated_at: string;
  document_count?: number;
  firm_id: string;
  minio_policy?: Record<string, any>;
}


export const RetentionPolicies = () => {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState<RetentionPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const response = await fetch('/api/admin/retention-classes', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        // Backend returns array directly, not wrapped in retention_classes
        setPolicies(Array.isArray(data) ? data : data.retention_classes || []);
      } else {
        console.error('Failed to fetch retention policies:', response.status, response.statusText);
        toast({
          title: 'Error',
          description: 'Failed to load retention policies',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching retention policies:', error);
      toast({
        title: 'Error',
        description: 'Failed to load retention policies',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };


  const handleDeletePolicy = async (policyId: string) => {
    if (!confirm('Are you sure you want to delete this retention policy?')) return;

    try {
      const response = await fetch(`/api/admin/retention-classes/${policyId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        await fetchPolicies();
        toast({
          title: 'Success',
          description: 'Retention policy deleted successfully',
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast({
          title: 'Error',
          description: errorData.message || 'Failed to delete retention policy',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting policy:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete retention policy',
        variant: 'destructive',
      });
    }
  };


  const filteredPolicies = policies.filter(policy =>
    policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (policy.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-2 text-slate-400">Loading retention policies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center">
            <Archive className="h-6 w-6 mr-2" />
            Retention Policy Management
          </h2>
          <p className="text-slate-400">
            Configure document lifecycle and automated retention policies
          </p>
        </div>
        
        <Button onClick={() => navigate('/admin/retention/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Policy
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search policies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Archive className="h-5 w-5 text-blue-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-slate-300">Total Policies</p>
                <p className="text-2xl font-bold text-slate-100">
                  {policies.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-green-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-slate-300">Managed Documents</p>
                <p className="text-2xl font-bold text-slate-100">
                  {policies.reduce((sum, p) => sum + (p.document_count || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Policies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Retention Policies ({filteredPolicies.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Table Header */}
            <div className="grid grid-cols-6 gap-4 pb-2 border-b border-slate-700 text-sm font-medium text-slate-300">
              <div>Policy Name</div>
              <div>Retention Period</div>
              <div>Auto Delete</div>
              <div>Documents</div>
              <div>Created</div>
              <div>Actions</div>
            </div>
            
            {/* Table Body */}
            {filteredPolicies.map((policy) => (
              <div key={policy.id} className="grid grid-cols-6 gap-4 py-4 border-b border-slate-800 items-center">
                <div>
                  <div className="font-medium text-slate-100">{policy.name}</div>
                  {policy.description && (
                    <div className="text-sm text-slate-400">{policy.description}</div>
                  )}
                </div>
                <div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-slate-400 mr-1" />
                    {policy.retention_years === 0 ? 'Indefinite' : `${policy.retention_years} years`}
                  </div>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="outline"
                      className={policy.auto_delete 
                        ? 'text-red-400 border-red-600 bg-red-900/30' 
                        : 'text-slate-400 border-slate-600 bg-slate-900/30'
                      }
                    >
                      {policy.auto_delete ? 'Enabled' : 'Disabled'}
                    </Badge>
                    {policy.legal_hold_override && (
                      <Badge variant="outline" className="text-xs text-orange-400 border-orange-600 bg-orange-900/30">
                        <Shield className="h-3 w-3 mr-1" />
                        Override holds
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-slate-300">
                    {(policy.document_count || 0).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">
                    {new Date(policy.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/admin/retention/${policy.id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeletePolicy(policy.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredPolicies.length === 0 && (
            <div className="text-center py-12">
              <Archive className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-100 mb-2">No retention policies found</h3>
              <p className="text-slate-400">
                {searchTerm ? 'Try adjusting your search terms.' : 'Create your first retention policy to get started.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Retention Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
            Retention Policy Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 text-left flex-col items-start"
              onClick={() => handleEnforceRetention()}
            >
              <div className="flex items-center mb-2">
                <Clock className="h-5 w-5 mr-2 text-blue-500" />
                <span className="font-medium">Enforce Retention Policies</span>
              </div>
              <span className="text-sm text-slate-400">
                Manually trigger retention policy evaluation and document cleanup
              </span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 text-left flex-col items-start"
              onClick={() => handleViewEligibleDocuments()}
            >
              <div className="flex items-center mb-2">
                <FileText className="h-5 w-5 mr-2 text-yellow-500" />
                <span className="font-medium">View Eligible Documents</span>
              </div>
              <span className="text-sm text-slate-400">
                See documents that are eligible for deletion under current policies
              </span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto p-4 text-left flex-col items-start"
              onClick={() => handleCleanupSoftDeleted()}
            >
              <div className="flex items-center mb-2">
                <Trash2 className="h-5 w-5 mr-2 text-red-500" />
                <span className="font-medium">Cleanup Soft-Deleted</span>
              </div>
              <span className="text-sm text-slate-400">
                Permanently remove documents that were soft-deleted 30+ days ago
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  async function handleEnforceRetention() {
    try {
      const response = await fetch('/api/retention/enforce', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        const result = await response.json();
        toast({
          title: 'Retention Enforcement Completed',
          description: `Evaluated: ${result.documentsEvaluated}, Deleted: ${result.documentsDeleted}`,
        });
      } else {
        throw new Error('Failed to enforce retention policies');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to enforce retention policies',
        variant: 'destructive',
      });
    }
  }

  async function handleViewEligibleDocuments() {
    try {
      const response = await fetch('/api/retention/eligible-for-deletion', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const documents = await response.json();
        toast({
          title: 'Eligible Documents',
          description: `${documents.length} documents are eligible for deletion`,
        });
        // TODO: Could open a modal showing the list
      } else {
        throw new Error('Failed to fetch eligible documents');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch eligible documents',
        variant: 'destructive',
      });
    }
  }

  async function handleCleanupSoftDeleted() {
    if (!confirm('This will permanently delete all soft-deleted documents older than 30 days. Are you sure?')) {
      return;
    }

    try {
      const response = await fetch('/api/retention/cleanup-soft-deleted', {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        const result = await response.json();
        toast({
          title: 'Cleanup Completed',
          description: `${result.deleted_count} documents permanently deleted`,
        });
      } else {
        throw new Error('Failed to cleanup soft-deleted documents');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cleanup soft-deleted documents',
        variant: 'destructive',
      });
    }
  }
};
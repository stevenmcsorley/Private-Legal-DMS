import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
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
  description: string;
  retention_period_years: number;
  trigger_event: 'matter_close' | 'document_creation' | 'last_access';
  auto_delete: boolean;
  legal_hold_override: boolean;
  created_at: string;
  updated_at: string;
  document_count: number;
  status: 'active' | 'inactive';
}

interface CreateRetentionPolicyData {
  name: string;
  description: string;
  retention_period_years: number;
  trigger_event: 'matter_close' | 'document_creation' | 'last_access';
  auto_delete: boolean;
  legal_hold_override: boolean;
}

export const RetentionPolicies = () => {
  const [policies, setPolicies] = useState<RetentionPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<RetentionPolicy | null>(null);
  const [formData, setFormData] = useState<CreateRetentionPolicyData>({
    name: '',
    description: '',
    retention_period_years: 7,
    trigger_event: 'matter_close',
    auto_delete: false,
    legal_hold_override: false,
  });

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const response = await fetch('/api/admin/retention-policies', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setPolicies(data.policies || []);
      } else {
        // Mock data for development
        setPolicies([
          {
            id: '1',
            name: 'Standard Legal Documents',
            description: 'Standard retention for legal documents and correspondence',
            retention_period_years: 7,
            trigger_event: 'matter_close',
            auto_delete: false,
            legal_hold_override: true,
            created_at: '2025-01-15T10:30:00Z',
            updated_at: '2025-01-15T10:30:00Z',
            document_count: 1247,
            status: 'active',
          },
          {
            id: '2', 
            name: 'Client Communications',
            description: 'Email and communication records with clients',
            retention_period_years: 5,
            trigger_event: 'last_access',
            auto_delete: true,
            legal_hold_override: true,
            created_at: '2025-01-10T14:20:00Z',
            updated_at: '2025-02-01T09:15:00Z',
            document_count: 892,
            status: 'active',
          },
          {
            id: '3',
            name: 'Draft Documents',
            description: 'Working drafts and temporary documents',
            retention_period_years: 2,
            trigger_event: 'document_creation',
            auto_delete: true,
            legal_hold_override: false,
            created_at: '2025-01-05T16:45:00Z',
            updated_at: '2025-01-05T16:45:00Z',
            document_count: 234,
            status: 'inactive',
          },
        ]);
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

  const handleCreatePolicy = async () => {
    try {
      const response = await fetch('/api/admin/retention-policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchPolicies();
        setShowCreateDialog(false);
        resetForm();
        toast({
          title: 'Success',
          description: 'Retention policy created successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to create retention policy',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating policy:', error);
      toast({
        title: 'Error',
        description: 'Failed to create retention policy',
        variant: 'destructive',
      });
    }
  };

  const handleDeletePolicy = async (policyId: string) => {
    if (!confirm('Are you sure you want to delete this retention policy?')) return;

    try {
      const response = await fetch(`/api/admin/retention-policies/${policyId}`, {
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
        toast({
          title: 'Error',
          description: 'Failed to delete retention policy',
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

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      retention_period_years: 7,
      trigger_event: 'matter_close',
      auto_delete: false,
      legal_hold_override: false,
    });
    setEditingPolicy(null);
  };

  const startEdit = (policy: RetentionPolicy) => {
    setEditingPolicy(policy);
    setFormData({
      name: policy.name,
      description: policy.description,
      retention_period_years: policy.retention_period_years,
      trigger_event: policy.trigger_event,
      auto_delete: policy.auto_delete,
      legal_hold_override: policy.legal_hold_override,
    });
    setShowCreateDialog(true);
  };

  const filteredPolicies = policies.filter(policy =>
    policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTriggerEventLabel = (event: string) => {
    switch (event) {
      case 'matter_close': return 'Matter Close';
      case 'document_creation': return 'Document Creation';
      case 'last_access': return 'Last Access';
      default: return event;
    }
  };

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
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Create Policy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingPolicy ? 'Edit Retention Policy' : 'Create Retention Policy'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Policy Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Standard Legal Documents"
                  />
                </div>
                <div>
                  <Label htmlFor="retention-period">Retention Period (Years)</Label>
                  <Input
                    id="retention-period"
                    type="number"
                    min="1"
                    max="50"
                    value={formData.retention_period_years}
                    onChange={(e) => setFormData({...formData, retention_period_years: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe what this policy covers..."
                />
              </div>
              
              <div>
                <Label htmlFor="trigger">Retention Trigger Event</Label>
                <Select 
                  value={formData.trigger_event} 
                  onValueChange={(value: any) => setFormData({...formData, trigger_event: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="matter_close">Matter Close Date</SelectItem>
                    <SelectItem value="document_creation">Document Creation Date</SelectItem>
                    <SelectItem value="last_access">Last Access Date</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.auto_delete}
                    onChange={(e) => setFormData({...formData, auto_delete: e.target.checked})}
                    className="rounded border-slate-300"
                  />
                  <span className="text-sm">Auto-delete after retention period</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.legal_hold_override}
                    onChange={(e) => setFormData({...formData, legal_hold_override: e.target.checked})}
                    className="rounded border-slate-300"
                  />
                  <span className="text-sm">Override legal holds</span>
                </label>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePolicy}>
                {editingPolicy ? 'Update Policy' : 'Create Policy'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
                <p className="text-sm font-medium text-slate-300">Active Policies</p>
                <p className="text-2xl font-bold text-slate-100">
                  {policies.filter(p => p.status === 'active').length}
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
                  {policies.reduce((sum, p) => sum + p.document_count, 0).toLocaleString()}
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
              <div>Trigger Event</div>
              <div>Documents</div>
              <div>Status</div>
              <div>Actions</div>
            </div>
            
            {/* Table Body */}
            {filteredPolicies.map((policy) => (
              <div key={policy.id} className="grid grid-cols-6 gap-4 py-4 border-b border-slate-800 items-center">
                <div>
                  <div className="font-medium text-slate-100">{policy.name}</div>
                  <div className="text-sm text-slate-400">{policy.description}</div>
                </div>
                <div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 text-slate-400 mr-1" />
                    {policy.retention_period_years} years
                  </div>
                </div>
                <div>
                  <Badge variant="outline">
                    {getTriggerEventLabel(policy.trigger_event)}
                  </Badge>
                </div>
                <div>
                  <div className="text-slate-300">
                    {policy.document_count.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="space-y-1">
                    <Badge 
                      className={policy.status === 'active' 
                        ? 'border-green-700 bg-green-900/30 text-green-400' 
                        : 'border-gray-700 bg-gray-900/30 text-gray-400'
                      }
                    >
                      {policy.status}
                    </Badge>
                    <div className="flex items-center space-x-2 text-xs text-slate-500">
                      {policy.auto_delete && (
                        <Badge variant="outline" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Auto-delete
                        </Badge>
                      )}
                      {policy.legal_hold_override && (
                        <Badge variant="outline" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          Override holds
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => startEdit(policy)}
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
    </div>
  );
};
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Plus, 
  Filter,
  Building,
  Edit,
  Trash2,
  Users,
  Loader2,
  Calendar,
  BarChart3,
  CheckCircle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';

interface Firm {
  id: string;
  name: string;
  external_ref?: string;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
  users?: {
    id: string;
    display_name: string;
    is_active: boolean;
  }[];
}

interface FirmStats {
  firm: {
    id: string;
    name: string;
    created_at: string;
    external_ref?: string;
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

interface CreateFirmFormData {
  name: string;
  external_ref: string;
  settings: Record<string, any>;
}

export const FirmManagement = () => {
  const [firms, setFirms] = useState<Firm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingFirm, setEditingFirm] = useState<Firm | null>(null);
  const [selectedFirmStats, setSelectedFirmStats] = useState<FirmStats | null>(null);
  const [createFirmForm, setCreateFirmForm] = useState<CreateFirmFormData>({
    name: '',
    external_ref: '',
    settings: {},
  });
  const [editFirmForm, setEditFirmForm] = useState<CreateFirmFormData>({
    name: '',
    external_ref: '',
    settings: {},
  });

  useEffect(() => {
    fetchFirms();
  }, []);

  const fetchFirms = async () => {
    try {
      const response = await fetch('/api/admin/firms', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setFirms(data || []);
      }
    } catch (error) {
      console.error('Error fetching firms:', error);
    } finally {
      setLoading(false);
    }
  };

  const createFirm = async () => {
    if (!createFirmForm.name) {
      alert('Please fill in the firm name');
      return;
    }

    setIsCreating(true);
    
    try {
      const response = await fetch('/api/admin/firms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(createFirmForm),
      });

      if (response.ok) {
        const newFirm = await response.json();
        setFirms([...firms, newFirm]);
        setShowCreateDialog(false);
        setCreateFirmForm({
          name: '',
          external_ref: '',
          settings: {},
        });
        alert('Firm created successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to create firm: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating firm:', error);
      alert('Failed to create firm. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const updateFirm = async () => {
    if (!editingFirm) return;
    
    if (!editFirmForm.name) {
      alert('Please fill in the firm name');
      return;
    }

    setIsEditing(true);
    
    try {
      const response = await fetch(`/api/admin/firms/${editingFirm.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(editFirmForm),
      });

      if (response.ok) {
        const updatedFirm = await response.json();
        setFirms(firms.map(f => f.id === editingFirm.id ? updatedFirm : f));
        setShowEditDialog(false);
        setEditingFirm(null);
        alert('Firm updated successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to update firm: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating firm:', error);
      alert('Failed to update firm. Please try again.');
    } finally {
      setIsEditing(false);
    }
  };

  const deleteFirm = async (firmId: string) => {
    if (!confirm('Are you sure you want to delete this firm? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/firms/${firmId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setFirms(firms.filter(f => f.id !== firmId));
        alert('Firm deleted successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to delete firm: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting firm:', error);
      alert('Failed to delete firm. Please try again.');
    }
  };

  const openEditDialog = (firm: Firm) => {
    setEditingFirm(firm);
    setEditFirmForm({
      name: firm.name,
      external_ref: firm.external_ref || '',
      settings: firm.settings || {},
    });
    setShowEditDialog(true);
  };

  const fetchFirmStats = async (firmId: string) => {
    try {
      const response = await fetch(`/api/admin/firms/${firmId}/stats`, {
        credentials: 'include',
      });
      if (response.ok) {
        const stats = await response.json();
        setSelectedFirmStats(stats);
        setShowStatsDialog(true);
      }
    } catch (error) {
      console.error('Error fetching firm stats:', error);
      alert('Failed to fetch firm statistics.');
    }
  };

  const filteredFirms = firms.filter((firm) => {
    return firm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (firm.external_ref && firm.external_ref.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-2 text-slate-400">Loading firms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center space-x-2">
            <Building className="h-5 w-5 text-amber-500" />
            <span>Firm Management</span>
          </h2>
          <p className="text-slate-400">Manage law firms and their settings</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Firm
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Firm</DialogTitle>
            </DialogHeader>
            
            <form className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Firm Name *</Label>
                <Input
                  id="name"
                  placeholder="Smith & Associates Law Firm"
                  value={createFirmForm.name}
                  onChange={(e) => setCreateFirmForm({...createFirmForm, name: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="external_ref">External Reference</Label>
                <Input
                  id="external_ref"
                  placeholder="SA-LAW-001"
                  value={createFirmForm.external_ref}
                  onChange={(e) => setCreateFirmForm({...createFirmForm, external_ref: e.target.value})}
                />
              </div>
            </form>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={createFirm}
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Firm'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search firms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center text-sm text-slate-400">
        <Filter className="h-4 w-4 mr-2" />
        Showing {filteredFirms.length} of {firms.length} firms
      </div>

      {/* Firms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFirms.map((firm) => (
          <Card key={firm.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Building className="h-5 w-5 text-amber-500" />
                  <h3 className="font-semibold text-lg">{firm.name}</h3>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchFirmStats(firm.id)}
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(firm)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteFirm(firm.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {firm.external_ref && (
                <div className="mb-3">
                  <Badge variant="outline" className="text-xs">
                    {firm.external_ref}
                  </Badge>
                </div>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Users:</span>
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3 text-slate-400" />
                    <span>{firm.users?.length || 0}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Created:</span>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    <span>{new Date(firm.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Status:</span>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-3 w-3 text-green-400" />
                    <span className="text-green-400">Active</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFirms.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Building className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-100 mb-2">No firms found</h3>
            <p className="text-slate-400">
              {searchTerm 
                ? 'Try adjusting your search to see more results.'
                : 'No firms have been created yet.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Firm Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Firm</DialogTitle>
          </DialogHeader>
          
          {editingFirm && (
            <form className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Firm Name *</Label>
                <Input
                  id="edit-name"
                  placeholder="Smith & Associates Law Firm"
                  value={editFirmForm.name}
                  onChange={(e) => setEditFirmForm({...editFirmForm, name: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-external_ref">External Reference</Label>
                <Input
                  id="edit-external_ref"
                  placeholder="SA-LAW-001"
                  value={editFirmForm.external_ref}
                  onChange={(e) => setEditFirmForm({...editFirmForm, external_ref: e.target.value})}
                />
              </div>
            </form>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowEditDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={updateFirm}
              disabled={isEditing}
            >
              {isEditing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Firm'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Firm Stats Dialog */}
      <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Firm Statistics</DialogTitle>
          </DialogHeader>
          
          {selectedFirmStats && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-amber-400">
                    {selectedFirmStats.users.total}
                  </div>
                  <div className="text-sm text-slate-400">Total Users</div>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">
                    {selectedFirmStats.clients.total}
                  </div>
                  <div className="text-sm text-slate-400">Total Clients</div>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">
                    {selectedFirmStats.matters.total}
                  </div>
                  <div className="text-sm text-slate-400">Total Matters</div>
                </div>
                <div className="bg-slate-800 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">
                    {selectedFirmStats.documents.total}
                  </div>
                  <div className="text-sm text-slate-400">Total Documents</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Users by Role</h4>
                  <div className="space-y-2">
                    {Object.entries(selectedFirmStats.users.by_role).map(([role, count]) => (
                      <div key={role} className="flex justify-between text-sm">
                        <span className="text-slate-400 capitalize">{role.replace('_', ' ')}</span>
                        <span className="text-slate-100">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-slate-300 mb-3">Recent Activity (30 days)</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Documents uploaded</span>
                      <span className="text-slate-100">{selectedFirmStats.activity.documents_uploaded_last_30_days}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Matters created</span>
                      <span className="text-slate-100">{selectedFirmStats.activity.matters_created_last_30_days}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Users created</span>
                      <span className="text-slate-100">{selectedFirmStats.activity.users_created_last_30_days}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-3">Storage</h4>
                <div className="bg-slate-800 p-4 rounded-lg">
                  <div className="text-lg font-semibold">
                    {selectedFirmStats.documents.total_size_gb} GB
                  </div>
                  <div className="text-sm text-slate-400">Total storage used</div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setShowStatsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
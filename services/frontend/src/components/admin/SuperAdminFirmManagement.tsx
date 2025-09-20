import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Users, 
  Plus, 
  Settings, 
  Calendar,
  UserPlus,
  Eye,
  Edit
} from 'lucide-react';

interface Firm {
  id: string;
  name: string;
  external_ref?: string;
  created_at: string;
  users?: User[];
  _count?: {
    users: number;
    documents: number;
    matters: number;
  };
}

interface User {
  id: string;
  email: string;
  display_name: string;
  roles: string[];
  is_active: boolean;
  created_at: string;
}

interface CreateFirmData {
  name: string;
  external_ref: string;
  admin_email: string;
  admin_name: string;
}

export const SuperAdminFirmManagement = () => {
  const [firms, setFirms] = useState<Firm[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedFirm, setSelectedFirm] = useState<Firm | null>(null);
  const [createData, setCreateData] = useState<CreateFirmData>({
    name: '',
    external_ref: '',
    admin_email: '',
    admin_name: ''
  });

  useEffect(() => {
    fetchFirms();
  }, []);

  const fetchFirms = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/super-admin/firms', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setFirms(data);
      }
    } catch (error) {
      console.error('Error fetching firms:', error);
    } finally {
      setLoading(false);
    }
  };

  const createFirm = async () => {
    try {
      const response = await fetch('/api/super-admin/firms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(createData),
      });
      
      if (response.ok) {
        await fetchFirms();
        setShowCreateForm(false);
        setCreateData({ name: '', external_ref: '', admin_email: '', admin_name: '' });
      } else {
        console.error('Failed to create firm');
      }
    } catch (error) {
      console.error('Error creating firm:', error);
    }
  };

  const getFirmStatus = (firm: Firm) => {
    const userCount = firm._count?.users || 0;
    const docCount = firm._count?.documents || 0;
    
    if (userCount === 0) return { status: 'pending', color: 'bg-yellow-100 text-yellow-800' };
    if (userCount <= 3 || docCount <= 10) return { status: 'trial', color: 'bg-blue-100 text-blue-800' };
    return { status: 'active', color: 'bg-green-100 text-green-800' };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
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
          <h3 className="text-lg font-semibold flex items-center">
            <Building2 className="h-5 w-5 mr-2 text-blue-500" />
            Firm Management
          </h3>
          <p className="text-slate-400">Manage law firms and create firm administrators</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Firm
        </Button>
      </div>

      {/* Create Firm Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Firm</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Firm Name</Label>
                <Input
                  value={createData.name}
                  onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
                  placeholder="e.g. Smith & Associates Law Firm"
                />
              </div>
              <div>
                <Label>External Reference</Label>
                <Input
                  value={createData.external_ref}
                  onChange={(e) => setCreateData({ ...createData, external_ref: e.target.value })}
                  placeholder="e.g. SA001 or contact@smithlaw.com"
                />
              </div>
              <div>
                <Label>Firm Admin Email</Label>
                <Input
                  type="email"
                  value={createData.admin_email}
                  onChange={(e) => setCreateData({ ...createData, admin_email: e.target.value })}
                  placeholder="admin@smithlaw.com"
                />
              </div>
              <div>
                <Label>Firm Admin Name</Label>
                <Input
                  value={createData.admin_name}
                  onChange={(e) => setCreateData({ ...createData, admin_name: e.target.value })}
                  placeholder="John Smith"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={createFirm} disabled={!createData.name || !createData.admin_email}>
                <Building2 className="h-4 w-4 mr-2" />
                Create Firm & Admin
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Firms Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Building2 className="h-5 w-5 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-300">Total Firms</p>
                <p className="text-2xl font-bold text-slate-100">{firms.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-5 w-5 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-300">Active Firms</p>
                <p className="text-2xl font-bold text-slate-100">
                  {firms.filter(f => getFirmStatus(f).status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Settings className="h-5 w-5 text-yellow-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-300">Trial Firms</p>
                <p className="text-2xl font-bold text-slate-100">
                  {firms.filter(f => getFirmStatus(f).status === 'trial').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-slate-300">Pending Setup</p>
                <p className="text-2xl font-bold text-slate-100">
                  {firms.filter(f => getFirmStatus(f).status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Firms List */}
      <Card>
        <CardHeader>
          <CardTitle>All Firms</CardTitle>
        </CardHeader>
        <CardContent>
          {firms.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400">No firms created yet</p>
              <Button className="mt-4" onClick={() => setShowCreateForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Firm
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {firms.map((firm) => {
                const status = getFirmStatus(firm);
                return (
                  <div key={firm.id} className="border border-slate-700 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-semibold text-lg">{firm.name}</h4>
                          <Badge className={status.color}>
                            {status.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm">
                          <div>
                            <p className="text-slate-400">External Reference</p>
                            <p className="font-medium">{firm.external_ref || 'Not set'}</p>
                          </div>
                          <div>
                            <p className="text-slate-400">Users</p>
                            <p className="font-medium">{firm._count?.users || 0}</p>
                          </div>
                          <div>
                            <p className="text-slate-400">Created</p>
                            <p className="font-medium">
                              {new Date(firm.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        {firm._count && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 text-sm">
                            <div>
                              <p className="text-slate-400">Documents</p>
                              <p className="font-medium">{firm._count.documents || 0}</p>
                            </div>
                            <div>
                              <p className="text-slate-400">Matters</p>
                              <p className="font-medium">{firm._count.matters || 0}</p>
                            </div>
                            <div></div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedFirm(firm)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <UserPlus className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Firm Details Modal/Panel */}
      {selectedFirm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Firm Details: {selectedFirm.name}</span>
              <Button variant="outline" onClick={() => setSelectedFirm(null)}>
                Close
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h5 className="font-medium mb-2">Firm Administrators</h5>
                {selectedFirm.users && selectedFirm.users.length > 0 ? (
                  <div className="space-y-2">
                    {selectedFirm.users
                      .filter(user => user.roles.includes('firm_admin'))
                      .map(user => (
                        <div key={user.id} className="flex items-center justify-between p-2 border border-slate-700 rounded">
                          <div>
                            <p className="font-medium">{user.display_name}</p>
                            <p className="text-sm text-slate-400">{user.email}</p>
                          </div>
                          <Badge className={user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-slate-400">No firm administrators found</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
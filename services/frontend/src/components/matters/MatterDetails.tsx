import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft,
  Edit,
  FileText,
  Users,
  Calendar,
  User,
  Building,
  Clock,
  Share2,
  Archive,
} from 'lucide-react';
import { DocumentList } from '@/components/documents/DocumentList';

interface Matter {
  id: string;
  firm_id: string;
  client_id: string;
  title: string;
  description?: string;
  status: string;
  security_class: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  client?: {
    id: string;
    name: string;
    contact_email?: string;
  };
  created_by_user?: {
    id: string;
    display_name: string;
    email?: string;
  };
  documents?: Document[];
}

interface Document {
  id: string;
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
  uploaded_by: {
    display_name: string;
  };
  version: number;
  is_confidential: boolean;
}

interface TeamMember {
  id: string;
  user_id: string;
  user: {
    display_name: string;
    email: string;
  };
  role: string;
  access_level: string;
  added_at: string;
}

interface AuditEntry {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  user: {
    display_name: string;
  };
  timestamp: string;
  details?: any;
}

export const MatterDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [matter, setMatter] = useState<Matter | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<any[]>([]);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('observer');
  const [selectedAccessLevel, setSelectedAccessLevel] = useState('read_only');
  const [addingMember, setAddingMember] = useState(false);

  useEffect(() => {
    if (id) {
      fetchMatterDetails();
      fetchDocuments();
      fetchTeamMembers();
      fetchAuditEntries();
      fetchUsers();
    }
  }, [id]);

  const fetchMatterDetails = async () => {
    try {
      const response = await fetch(`/api/matters/${id}`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setMatter(data);
      }
    } catch (error) {
      console.error('Error fetching matter:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`/api/matters/${id}/documents`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setDocuments(Array.isArray(data.documents) ? data.documents : []);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocuments([]);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch(`/api/matters/${id}/team`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(Array.isArray(data) ? data : []);
      } else {
        console.log('Failed to fetch team members');
        setTeamMembers([]);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
      setTeamMembers([]);
    }
  };

  const fetchAuditEntries = async () => {
    try {
      const response = await fetch(`/api/audit/matter/${id}`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setAuditEntries(data.logs || []);
      } else if (response.status === 404) {
        console.log('Audit endpoint not implemented yet');
        setAuditEntries([]);
      }
    } catch (error) {
      console.error('Error fetching audit entries:', error);
      setAuditEntries([]);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        console.log('Users API response:', data);
        setUsers(Array.isArray(data) ? data : data.users || []);
      } else {
        console.log('Users API failed with status:', response.status);
        // If admin endpoint fails, create dummy data for testing
        setUsers([
          { id: '11111111-2222-3333-4444-555555555001', display_name: 'John Legal', email: 'lawyer@firm1.com' },
          { id: '11111111-2222-3333-4444-555555555002', display_name: 'Sarah Manager', email: 'manager@firm1.com' },
          { id: '6cad6b70-1a00-435c-bae3-86078903a491', display_name: 'Test User', email: 'testuser' },
        ]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      // Fallback to dummy data for testing
      setUsers([
        { id: '11111111-2222-3333-4444-555555555001', display_name: 'John Legal', email: 'lawyer@firm1.com' },
        { id: '11111111-2222-3333-4444-555555555002', display_name: 'Sarah Manager', email: 'manager@firm1.com' },
        { id: '6cad6b70-1a00-435c-bae3-86078903a491', display_name: 'Test User', email: 'testuser' },
      ]);
    }
  };

  const addTeamMember = async () => {
    if (!selectedUser) return;
    
    setAddingMember(true);
    try {
      const response = await fetch(`/api/matters/${id}/team`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          user_id: selectedUser,
          role: selectedRole,
          access_level: selectedAccessLevel,
        }),
      });

      if (response.ok) {
        // Refresh team members
        await fetchTeamMembers();
        // Reset form
        setSelectedUser('');
        setSelectedRole('observer');
        setSelectedAccessLevel('read_only');
        setAddMemberOpen(false);
      } else {
        const error = await response.json();
        console.error('Error adding team member:', error);
        alert('Failed to add team member: ' + (error.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error adding team member:', error);
      alert('Failed to add team member');
    } finally {
      setAddingMember(false);
    }
  };

  // Document upload, preview, and listing handled by DocumentList in the Documents tab

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-600 text-white border-green-500';
      case 'closed': return 'bg-slate-600 text-white border-slate-500';
      case 'on_hold': return 'bg-yellow-600 text-white border-yellow-500';
      case 'cancelled': return 'bg-red-600 text-white border-red-500';
      default: return 'bg-slate-600 text-white border-slate-500';
    }
  };


  if (loading || !matter) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-2 text-slate-300">Loading matter details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link to="/matters">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Matters
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center">
              {matter.title}
            </h1>
            <p className="text-slate-400 font-mono">Matter ID: {matter.id.slice(0, 8)}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="border-orange-500 text-orange-300 hover:bg-orange-500 hover:text-white" asChild>
            <Link to={`/matters/${matter.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button variant="outline" className="border-slate-500 text-slate-300 hover:bg-slate-500 hover:text-white">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Matter Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building className="h-5 w-5 text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white">Client</p>
                <p className="text-sm text-slate-300">{matter.client?.name || 'Unknown Client'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <User className="h-5 w-5 text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white">Created By</p>
                <p className="text-sm text-slate-300">
                  {matter.created_by_user?.display_name || 'Unknown'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-5 w-5 text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white">Documents</p>
                <p className="text-sm text-slate-300">{documents.length} files</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-5 w-5 text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white">Created</p>
                <p className="text-sm text-slate-300">
                  {new Date(matter.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-slate-300">Overview</TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-slate-300">Documents ({documents.length})</TabsTrigger>
          <TabsTrigger value="people" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-slate-300">People ({teamMembers.length})</TabsTrigger>
          <TabsTrigger value="audit" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-slate-300">Audit ({auditEntries.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Matter Details */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Matter Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Status</label>
                  <div>
                    <Badge className={`${getStatusColor(matter.status)} px-3 py-1 rounded-full`}>
                      {matter.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Security Class</label>
                  <div>
                    <Badge variant="outline" className="border-slate-500 text-slate-300">
                      Level {matter.security_class}
                    </Badge>
                  </div>
                </div>
                
                {matter.description && (
                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">Description</label>
                    <p className="text-sm text-slate-300 leading-relaxed bg-slate-700 p-3 rounded-lg border border-slate-600">
                      {matter.description}
                    </p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">Created</label>
                    <p className="text-sm text-slate-300 bg-slate-700 p-2 rounded border border-slate-600">
                      {new Date(matter.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">Last Updated</label>
                    <p className="text-sm text-slate-300 bg-slate-700 p-2 rounded border border-slate-600">
                      {new Date(matter.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Client Information */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Client Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Name</label>
                  <p className="text-sm text-slate-300 bg-slate-700 p-3 rounded-lg border border-slate-600">{matter.client?.name || 'Unknown Client'}</p>
                </div>
                
                {matter.client?.contact_email && (
                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">Email</label>
                    <p className="text-sm text-slate-300 bg-slate-700 p-3 rounded-lg border border-slate-600">{matter.client.contact_email}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Client ID</label>
                  <p className="text-sm text-slate-400 font-mono bg-slate-700 p-3 rounded-lg border border-slate-600">{matter.client?.id || matter.client_id}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <DocumentList matterId={matter.id} />
        </TabsContent>

        <TabsContent value="people" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-white">Team Members</h3>
            <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Team Member</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="user">User</Label>
                    <Select value={selectedUser} onValueChange={setSelectedUser}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.display_name} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lead_lawyer">Lead Lawyer</SelectItem>
                        <SelectItem value="associate">Associate</SelectItem>
                        <SelectItem value="paralegal">Paralegal</SelectItem>
                        <SelectItem value="legal_assistant">Legal Assistant</SelectItem>
                        <SelectItem value="observer">Observer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="access">Access Level</Label>
                    <Select value={selectedAccessLevel} onValueChange={setSelectedAccessLevel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Full Access</SelectItem>
                        <SelectItem value="read_write">Read & Write</SelectItem>
                        <SelectItem value="read_only">Read Only</SelectItem>
                        <SelectItem value="limited">Limited</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setAddMemberOpen(false)}
                      disabled={addingMember}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={addTeamMember}
                      disabled={!selectedUser || addingMember}
                    >
                      {addingMember ? 'Adding...' : 'Add Member'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-2">
            {teamMembers.map((member) => (
              <Card key={member.id} className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-slate-600 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-slate-300" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {member.user.display_name}
                        </p>
                        <p className="text-xs text-slate-400">{member.user.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="border-orange-500 text-orange-300">{member.role.replace('_', ' ')}</Badge>
                      <Badge variant="outline" className="border-slate-500 text-slate-300">{member.access_level.replace('_', ' ')}</Badge>
                      <span className="text-xs text-slate-400">
                        Added {new Date(member.added_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <h3 className="text-lg font-medium text-white">Audit Trail</h3>
          
          <div className="space-y-2">
            {auditEntries.map((entry) => (
              <Card key={entry.id} className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Clock className="h-4 w-4 text-slate-400 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-white">
                        <span className="font-medium">{entry.user.display_name}</span> {entry.action}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(entry.timestamp).toLocaleString()}
                      </p>
                      {entry.details && (
                        <pre className="text-xs text-slate-400 mt-2 bg-slate-700 p-2 rounded border border-slate-600">
                          {JSON.stringify(entry.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {auditEntries.length === 0 && (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="text-center py-12">
                <Archive className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No audit entries</h3>
                <p className="text-slate-400">Audit trail will appear here as actions are performed.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

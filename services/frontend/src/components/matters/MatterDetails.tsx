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
        setAuditEntries(Array.isArray(data) ? data : []);
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
      case 'active': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };


  if (loading || !matter) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading matter details...</p>
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
            <h1 className="text-2xl font-bold flex items-center">
              {matter.title}
            </h1>
            <p className="text-muted-foreground font-mono">Matter ID: {matter.id.slice(0, 8)}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link to={`/matters/${matter.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Matter Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building className="h-5 w-5 text-gray-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-foreground">Client</p>
                <p className="text-sm text-muted-foreground">{matter.client?.name || 'Unknown Client'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-foreground">Created By</p>
                <p className="text-sm text-muted-foreground">
                  {matter.created_by_user?.display_name || 'Unknown'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-foreground">Documents</p>
                <p className="text-sm text-muted-foreground">{documents.length} files</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-foreground">Created</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(matter.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
          <TabsTrigger value="people">People ({teamMembers.length})</TabsTrigger>
          <TabsTrigger value="audit">Audit ({auditEntries.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Matter Details */}
            <Card>
              <CardHeader>
                <CardTitle>Matter Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Status</label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(matter.status)}>
                      {matter.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground">Security Class</label>
                  <div className="mt-1">
                    <Badge variant="outline">
                      Level {matter.security_class}
                    </Badge>
                  </div>
                </div>
                
                {matter.description && (
                  <div>
                    <label className="text-sm font-medium text-foreground">Description</label>
                    <p className="mt-1 text-sm text-foreground">{matter.description}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-foreground">Created</label>
                  <p className="mt-1 text-sm text-foreground">
                    {new Date(matter.created_at).toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground">Last Updated</label>
                  <p className="mt-1 text-sm text-foreground">
                    {new Date(matter.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Client Information */}
            <Card>
              <CardHeader>
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Name</label>
                  <p className="mt-1 text-sm text-foreground">{matter.client?.name || 'Unknown Client'}</p>
                </div>
                
                {matter.client?.contact_email && (
                  <div>
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <p className="mt-1 text-sm text-foreground">{matter.client.contact_email}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-foreground">Client ID</label>
                  <p className="mt-1 text-sm text-muted-foreground font-mono">{matter.client?.id || matter.client_id}</p>
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
            <h3 className="text-lg font-medium">Team Members</h3>
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
              <Card key={member.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {member.user.display_name}
                        </p>
                        <p className="text-xs text-muted-foreground">{member.user.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">{member.role}</Badge>
                      <Badge variant="outline">{member.access_level}</Badge>
                      <span className="text-xs text-muted-foreground">
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
          <h3 className="text-lg font-medium">Audit Trail</h3>
          
          <div className="space-y-2">
            {auditEntries.map((entry) => (
              <Card key={entry.id}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Clock className="h-4 w-4 text-gray-400 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm text-foreground">
                        <span className="font-medium">{entry.user.display_name}</span> {entry.action}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleString()}
                      </p>
                      {entry.details && (
                        <pre className="text-xs text-muted-foreground mt-2 bg-muted p-2 rounded">
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
            <Card>
              <CardContent className="text-center py-12">
                <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No audit entries</h3>
                <p className="text-muted-foreground">Audit trail will appear here as actions are performed.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

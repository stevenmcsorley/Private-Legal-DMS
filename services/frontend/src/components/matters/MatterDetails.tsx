import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  Edit,
  FileText,
  Users,
  AlertCircle,
  Calendar,
  User,
  Building,
  Clock,
  Download,
  Share2,
  Archive,
  Eye
} from 'lucide-react';

interface Matter {
  id: string;
  matter_number: string;
  title: string;
  description?: string;
  client_id: string;
  client: {
    id: string;
    name: string;
    email: string;
  };
  matter_type: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  assigned_lawyer?: {
    id: string;
    display_name: string;
    email: string;
  };
  legal_hold_active: boolean;
  retention_years: number;
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

  useEffect(() => {
    if (id) {
      fetchMatterDetails();
      fetchDocuments();
      fetchTeamMembers();
      fetchAuditEntries();
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
        setDocuments(data);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch(`/api/matters/${id}/team`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const fetchAuditEntries = async () => {
    try {
      const response = await fetch(`/api/audit/matter/${id}`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setAuditEntries(data);
      }
    } catch (error) {
      console.error('Error fetching audit entries:', error);
    }
  };

  const downloadDocument = async (document: Document) => {
    try {
      const response = await fetch(`/api/documents/${document.id}/download`, { credentials: 'include' });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = window.document.createElement('a');
        link.href = url;
        link.download = document.original_filename;
        link.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading || !matter) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading matter details...</p>
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
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              {matter.title}
              {matter.legal_hold_active && (
                <AlertCircle className="h-6 w-6 text-red-500 ml-2" />
              )}
            </h1>
            <p className="text-gray-600 font-mono">{matter.matter_number}</p>
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
                <p className="text-sm font-medium text-gray-900">Client</p>
                <p className="text-sm text-gray-600">{matter.client.name}</p>
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
                <p className="text-sm font-medium text-gray-900">Assigned Lawyer</p>
                <p className="text-sm text-gray-600">
                  {matter.assigned_lawyer?.display_name || 'Unassigned'}
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
                <p className="text-sm font-medium text-gray-900">Documents</p>
                <p className="text-sm text-gray-600">{documents.length} files</p>
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
                <p className="text-sm font-medium text-gray-900">Created</p>
                <p className="text-sm text-gray-600">
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
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(matter.status)}>
                      {matter.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Priority</label>
                  <div className="mt-1">
                    <Badge className={getPriorityColor(matter.priority)}>
                      {matter.priority}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Matter Type</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {matter.matter_type.replace('_', ' ')}
                  </p>
                </div>
                
                {matter.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <p className="mt-1 text-sm text-gray-900">{matter.description}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Retention Period</label>
                  <p className="mt-1 text-sm text-gray-900">{matter.retention_years} years</p>
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
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-sm text-gray-900">{matter.client.name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{matter.client.email}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Client ID</label>
                  <p className="mt-1 text-sm text-gray-900 font-mono">{matter.client.id}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Documents</h3>
            <Button asChild>
              <Link to={`/matters/${matter.id}/documents/upload`}>
                <FileText className="h-4 w-4 mr-2" />
                Upload Document
              </Link>
            </Button>
          </div>

          <div className="space-y-2">
            {documents.map((doc) => (
              <Card key={doc.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {doc.original_filename}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>v{doc.version}</span>
                            <span>{formatFileSize(doc.file_size)}</span>
                            <span>Uploaded by {doc.uploaded_by.display_name}</span>
                            <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {doc.is_confidential && (
                        <Badge variant="destructive" className="text-xs">
                          Confidential
                        </Badge>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(`/documents/${doc.id}/view`, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => downloadDocument(doc)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {documents.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No documents</h3>
                <p className="text-gray-600 mb-4">Upload documents to get started.</p>
                <Button asChild>
                  <Link to={`/matters/${matter.id}/documents/upload`}>
                    <FileText className="h-4 w-4 mr-2" />
                    Upload First Document
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="people" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Team Members</h3>
            <Button variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Add Member
            </Button>
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
                        <p className="text-sm font-medium text-gray-900">
                          {member.user.display_name}
                        </p>
                        <p className="text-xs text-gray-500">{member.user.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">{member.role}</Badge>
                      <Badge variant="outline">{member.access_level}</Badge>
                      <span className="text-xs text-gray-500">
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
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{entry.user.display_name}</span> {entry.action}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(entry.timestamp).toLocaleString()}
                      </p>
                      {entry.details && (
                        <pre className="text-xs text-gray-600 mt-2 bg-gray-50 p-2 rounded">
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">No audit entries</h3>
                <p className="text-gray-600">Audit trail will appear here as actions are performed.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

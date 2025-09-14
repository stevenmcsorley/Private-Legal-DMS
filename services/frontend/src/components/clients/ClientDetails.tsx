import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  Edit,
  Building,
  Mail,
  Phone,
  MapPin,
  User,
  Calendar,
  Archive,
  FileText,
  Plus
} from 'lucide-react';

interface Client {
  id: string;
  name: string;
  contact_email?: string;
  contact_phone?: string;
  address?: any;
  metadata?: {
    contact_person?: string;
    client_type?: string;
    status?: string;
    notes?: string;
    tax_id?: string;
    billing_address?: string;
    preferred_communication?: string;
  };
  external_ref?: string;
  created_at: string;
  updated_at: string;
  firm_id: string;
}

interface Matter {
  id: string;
  matter_number: string;
  title: string;
  matter_type: string;
  status: string;
  priority: string;
  created_at: string;
  assigned_lawyer?: {
    display_name: string;
  };
  document_count: number;
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
  matter: {
    title: string;
    matter_number: string;
  };
  version: number;
  is_confidential: boolean;
}

export const ClientDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [matters, setMatters] = useState<Matter[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (id) {
      fetchClientDetails();
      fetchClientMatters();
      fetchClientDocuments();
    }
  }, [id]);

  const fetchClientDetails = async () => {
    try {
      const response = await fetch(`/api/clients/${id}`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setClient(data);
      }
    } catch (error) {
      console.error('Error fetching client:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientMatters = async () => {
    try {
      const response = await fetch(`/api/clients/${id}/matters`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setMatters(data);
      }
    } catch (error) {
      console.error('Error fetching matters:', error);
    }
  };

  const fetchClientDocuments = async () => {
    try {
      const response = await fetch(`/api/clients/${id}/documents`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
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
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'prospect': return 'bg-blue-100 text-blue-800';
      case 'former': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'individual': return 'bg-purple-100 text-purple-800';
      case 'corporation': return 'bg-blue-100 text-blue-800';
      case 'partnership': return 'bg-green-100 text-green-800';
      case 'llc': return 'bg-orange-100 text-orange-800';
      case 'non_profit': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMatterStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading || !client) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading client details...</p>
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
            <Link to="/clients">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Clients
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Building className="h-6 w-6 mr-3" />
              {client.name}
            </h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge className={getStatusColor(client.metadata?.status || 'active')}>
                {client.metadata?.status || 'active'}
              </Badge>
              <Badge className={getTypeColor(client.metadata?.client_type || 'individual')}>
                {(client.metadata?.client_type || 'individual').replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" asChild>
            <Link to={`/clients/${client.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button asChild>
            <Link to={`/matters/new?client_id=${client.id}`}>
              <Plus className="h-4 w-4 mr-2" />
              New Matter
            </Link>
          </Button>
        </div>
      </div>

      {/* Client Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Archive className="h-5 w-5 text-gray-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Active Matters</p>
                <p className="text-2xl font-bold text-gray-900">
                  {matters.filter(m => m.status === 'active').length}
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
                <p className="text-sm font-medium text-gray-900">Total Documents</p>
                <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
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
                <p className="text-sm font-medium text-gray-900">Client Since</p>
                <p className="text-sm text-gray-900">
                  {new Date(client.created_at).toLocaleDateString()}
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
          <TabsTrigger value="matters">Matters ({matters.length})</TabsTrigger>
          <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {client.contact_email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <p className="text-sm text-gray-900">{client.contact_email}</p>
                    </div>
                  </div>
                )}
                
                {client.contact_phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div>
                      <label className="text-sm font-medium text-gray-700">Phone</label>
                      <p className="text-sm text-gray-900">{client.contact_phone}</p>
                    </div>
                  </div>
                )}
                
                {client.metadata?.contact_person && (
                  <div className="flex items-center space-x-3">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <label className="text-sm font-medium text-gray-700">Contact Person</label>
                      <p className="text-sm text-gray-900">{client.metadata.contact_person}</p>
                    </div>
                  </div>
                )}
                
                {client.address && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                    <div>
                      <label className="text-sm font-medium text-gray-700">Address</label>
                      <p className="text-sm text-gray-900 whitespace-pre-line">
                        {typeof client.address === 'string' ? client.address : client.address.street}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Details */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {client.metadata?.tax_id && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Tax ID</label>
                    <p className="mt-1 text-sm text-gray-900 font-mono">{client.metadata.tax_id}</p>
                  </div>
                )}
                
                {client.metadata?.billing_address && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Billing Address</label>
                    <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">{client.metadata.billing_address}</p>
                  </div>
                )}
                
                {client.metadata?.preferred_communication && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Preferred Communication</label>
                    <p className="mt-1 text-sm text-gray-900">{client.metadata.preferred_communication}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Last Updated</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(client.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {client.metadata?.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-900 whitespace-pre-line">{client.metadata.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="matters" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Matters</h3>
            <Button asChild>
              <Link to={`/matters/new?client_id=${client.id}`}>
                <Plus className="h-4 w-4 mr-2" />
                New Matter
              </Link>
            </Button>
          </div>

          <div className="space-y-2">
            {matters.map((matter) => (
              <Card key={matter.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <Archive className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            <Link 
                              to={`/matters/${matter.id}`}
                              className="hover:text-blue-600 transition-colors"
                            >
                              {matter.title}
                            </Link>
                          </h4>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span className="font-mono">{matter.matter_number}</span>
                            <span>{matter.matter_type.replace('_', ' ')}</span>
                            {matter.assigned_lawyer && (
                              <span>Assigned: {matter.assigned_lawyer.display_name}</span>
                            )}
                            <span>{new Date(matter.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 ml-4">
                      <Badge className={getMatterStatusColor(matter.status)}>
                        {matter.status.replace('_', ' ')}
                      </Badge>
                      <div className="text-xs text-gray-500">
                        {matter.document_count} docs
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {matters.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No matters</h3>
                <p className="text-gray-600 mb-4">Create the first matter for this client.</p>
                <Button asChild>
                  <Link to={`/matters/new?client_id=${client.id}`}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Matter
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <h3 className="text-lg font-medium">Recent Documents</h3>
          
          <div className="space-y-2">
            {documents.slice(0, 10).map((doc) => (
              <Card key={doc.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <FileText className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {doc.original_filename}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                          <span>v{doc.version}</span>
                          <span>{formatFileSize(doc.file_size)}</span>
                          <span>{doc.matter.title} ({doc.matter.matter_number})</span>
                          <span>by {doc.uploaded_by.display_name}</span>
                          <span>{new Date(doc.uploaded_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {doc.is_confidential && (
                        <Badge variant="destructive" className="text-xs">
                          Confidential
                        </Badge>
                      )}
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
                <p className="text-gray-600">Documents will appear here when matters are created and documents are uploaded.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

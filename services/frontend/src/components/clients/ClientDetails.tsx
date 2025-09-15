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
      case 'active': return 'bg-green-600 text-white border-green-500';
      case 'inactive': return 'bg-slate-600 text-white border-slate-500';
      case 'prospect': return 'bg-blue-600 text-white border-blue-500';
      case 'former': return 'bg-yellow-600 text-white border-yellow-500';
      default: return 'bg-slate-600 text-white border-slate-500';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'individual': return 'bg-purple-600 text-white border-purple-500';
      case 'corporation': return 'bg-blue-600 text-white border-blue-500';
      case 'partnership': return 'bg-green-600 text-white border-green-500';
      case 'llc': return 'bg-orange-600 text-white border-orange-500';
      case 'non_profit': return 'bg-teal-600 text-white border-teal-500';
      default: return 'bg-slate-600 text-white border-slate-500';
    }
  };

  const getMatterStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-600 text-white border-green-500';
      case 'closed': return 'bg-slate-600 text-white border-slate-500';
      case 'on_hold': return 'bg-yellow-600 text-white border-yellow-500';
      case 'cancelled': return 'bg-red-600 text-white border-red-500';
      default: return 'bg-slate-600 text-white border-slate-500';
    }
  };

  if (loading || !client) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-2 text-slate-300">Loading client details...</p>
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
            <h1 className="text-2xl font-bold flex items-center text-white">
              <Building className="h-6 w-6 mr-3 text-orange-400" />
              {client.name}
            </h1>
            <div className="flex items-center space-x-2 mt-1">
              <Badge className={`${getStatusColor(client.metadata?.status || 'active')} px-3 py-1 rounded-full`}>
                {(client.metadata?.status || 'active').toUpperCase()}
              </Badge>
              <Badge className={`${getTypeColor(client.metadata?.client_type || 'individual')} px-3 py-1 rounded-full`}>
                {(client.metadata?.client_type || 'individual').replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="border-orange-500 text-orange-300 hover:bg-orange-500 hover:text-white" asChild>
            <Link to={`/clients/${client.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button className="bg-orange-600 hover:bg-orange-700 text-white" asChild>
            <Link to={`/matters/new?client_id=${client.id}`}>
              <Plus className="h-4 w-4 mr-2" />
              New Matter
            </Link>
          </Button>
        </div>
      </div>

      {/* Client Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Archive className="h-5 w-5 text-orange-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-white">Active Matters</p>
                <p className="text-2xl font-bold text-white">
                  {matters.filter(m => m.status === 'active').length}
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
                <p className="text-sm font-medium text-white">Total Documents</p>
                <p className="text-2xl font-bold text-white">{documents.length}</p>
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
                <p className="text-sm font-medium text-white">Client Since</p>
                <p className="text-sm text-slate-300">
                  {new Date(client.created_at).toLocaleDateString()}
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
          <TabsTrigger value="matters" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-slate-300">Matters ({matters.length})</TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white text-slate-300">Documents ({documents.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Information */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {client.contact_email && (
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-orange-400" />
                    <div>
                      <label className="text-sm font-medium text-white mb-1 block">Email</label>
                      <p className="text-sm text-slate-300 bg-slate-700 p-2 rounded border border-slate-600">{client.contact_email}</p>
                    </div>
                  </div>
                )}
                
                {client.contact_phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-orange-400" />
                    <div>
                      <label className="text-sm font-medium text-white mb-1 block">Phone</label>
                      <p className="text-sm text-slate-300 bg-slate-700 p-2 rounded border border-slate-600">{client.contact_phone}</p>
                    </div>
                  </div>
                )}
                
                {client.metadata?.contact_person && (
                  <div className="flex items-center space-x-3">
                    <User className="h-4 w-4 text-orange-400" />
                    <div>
                      <label className="text-sm font-medium text-white mb-1 block">Contact Person</label>
                      <p className="text-sm text-slate-300 bg-slate-700 p-2 rounded border border-slate-600">{client.metadata.contact_person}</p>
                    </div>
                  </div>
                )}
                
                {client.address && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-4 w-4 text-orange-400 mt-1" />
                    <div>
                      <label className="text-sm font-medium text-white mb-1 block">Address</label>
                      <p className="text-sm text-slate-300 bg-slate-700 p-3 rounded border border-slate-600 whitespace-pre-line">
                        {typeof client.address === 'string' ? client.address : client.address.street}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Details */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Additional Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {client.metadata?.tax_id && (
                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">Tax ID</label>
                    <p className="text-sm text-slate-400 font-mono bg-slate-700 p-2 rounded border border-slate-600">{client.metadata.tax_id}</p>
                  </div>
                )}
                
                {client.metadata?.billing_address && (
                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">Billing Address</label>
                    <p className="text-sm text-slate-300 bg-slate-700 p-3 rounded border border-slate-600 whitespace-pre-line">{client.metadata.billing_address}</p>
                  </div>
                )}
                
                {client.metadata?.preferred_communication && (
                  <div>
                    <label className="text-sm font-medium text-white mb-2 block">Preferred Communication</label>
                    <p className="text-sm text-slate-300 bg-slate-700 p-2 rounded border border-slate-600">{client.metadata.preferred_communication}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-white mb-2 block">Last Updated</label>
                  <p className="text-sm text-slate-300 bg-slate-700 p-2 rounded border border-slate-600">
                    {new Date(client.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {client.metadata?.notes && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300 bg-slate-700 p-3 rounded border border-slate-600 whitespace-pre-line">{client.metadata.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="matters" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-white">Matters</h3>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white" asChild>
              <Link to={`/matters/new?client_id=${client.id}`}>
                <Plus className="h-4 w-4 mr-2" />
                New Matter
              </Link>
            </Button>
          </div>

          <div className="space-y-2">
            {matters.map((matter) => (
              <Card key={matter.id} className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <Archive className="h-5 w-5 text-orange-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white truncate">
                            <Link 
                              to={`/matters/${matter.id}`}
                              className="hover:text-orange-400 transition-colors"
                            >
                              {matter.title}
                            </Link>
                          </h4>
                          <div className="flex items-center space-x-4 text-xs text-slate-400 mt-1">
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
                      <Badge className={`${getMatterStatusColor(matter.status)} px-3 py-1 rounded-full`}>
                        {matter.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <div className="text-xs text-slate-400">
                        {matter.document_count} docs
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {matters.length === 0 && (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="text-center py-12">
                <Archive className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No matters</h3>
                <p className="text-slate-400 mb-4">Create the first matter for this client.</p>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white" asChild>
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
          <h3 className="text-lg font-medium text-white">Recent Documents</h3>
          
          <div className="space-y-2">
            {documents.slice(0, 10).map((doc) => (
              <Card key={doc.id} className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <FileText className="h-5 w-5 text-orange-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {doc.original_filename}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-slate-400 mt-1">
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
                        <Badge className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
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
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No documents</h3>
                <p className="text-slate-400">Documents will appear here when matters are created and documents are uploaded.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Archive, 
  Upload,
  Download,
  Eye,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Building,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DocumentViewer } from '@/components/documents/DocumentViewer';

interface ClientMatter {
  id: string;
  matter_number: string;
  title: string;
  matter_type: string;
  status: string;
  created_at: string;
  assigned_lawyer?: {
    display_name: string;
    email: string;
  };
  description?: string;
  document_count: number;
}

interface ClientDocument {
  id: string;
  filename: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
  matter: {
    title: string;
    matter_number: string;
  };
  version: number;
  is_client_accessible: boolean;
  requires_signature?: boolean;
  signed_at?: string;
}

export const ClientPortal = () => {
  const { user } = useAuth();
  const [matters, setMatters] = useState<ClientMatter[]>([]);
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('matters');
  const [selectedDocument, setSelectedDocument] = useState<ClientDocument | null>(null);

  useEffect(() => {
    fetchClientData();
  }, []);

  const fetchClientData = async () => {
    try {
      const [mattersResponse, documentsResponse] = await Promise.all([
        fetch('/api/client-portal/matters', { credentials: 'include' }),
        fetch('/api/client-portal/documents', { credentials: 'include' })
      ]);

      if (mattersResponse.ok) {
        const mattersData = await mattersResponse.json();
        setMatters(mattersData.matters || []);
      }

      if (documentsResponse.ok) {
        const documentsData = await documentsResponse.json();
        setDocuments(documentsData.documents || []);
      }
    } catch (error) {
      console.error('Error fetching client data:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadDocument = async (doc: ClientDocument) => {
    try {
      const response = await fetch(`/api/client-portal/documents/${doc.id}/download`, {
        credentials: 'include',
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = doc.original_filename;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    if (typeof bytes !== 'number' || isNaN(bytes)) return 'Unknown size';
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
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFileTypeIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word')) return '📝';
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
    if (mimeType.includes('image')) return '🖼️';
    return '📄';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading your information...</p>
        </div>
      </div>
    );
  }

  // If viewing a document, show the document viewer
  if (selectedDocument) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => setSelectedDocument(null)}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Documents
          </Button>
          <div>
            <h1 className="text-xl font-semibold">{selectedDocument.original_filename}</h1>
            <p className="text-muted-foreground text-sm">
              {selectedDocument.matter.title} • {formatFileSize(selectedDocument.file_size)}
            </p>
          </div>
        </div>
        
        <DocumentViewer
          documentId={selectedDocument.id}
          documentName={selectedDocument.original_filename}
          mimeType={selectedDocument.mime_type}
          previewUrl={`/api/client-portal/documents/${selectedDocument.id}/preview`}
          downloadUrl={`/api/client-portal/documents/${selectedDocument.id}/download`}
          className="min-h-[600px]"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <Building className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Welcome, {user?.display_name}</h1>
            <p className="text-blue-100">Client Portal - Legal DMS</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setActiveTab('matters')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Archive className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-foreground">Your Matters</p>
                <p className="text-2xl font-bold text-foreground">{matters.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setActiveTab('documents')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-foreground">Available Documents</p>
                <p className="text-2xl font-bold text-foreground">{documents.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setActiveTab('documents')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-orange-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-foreground">Pending Signatures</p>
                <p className="text-2xl font-bold text-foreground">
                  {documents.filter(d => d.requires_signature && !d.signed_at).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="matters">My Matters ({matters.length})</TabsTrigger>
          <TabsTrigger value="documents">My Documents ({documents.length})</TabsTrigger>
          <TabsTrigger value="upload">Upload Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="matters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Legal Matters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {matters.map((matter) => (
                  <Card key={matter.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <Archive className="h-5 w-5 text-blue-500 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-lg font-medium text-foreground truncate">
                                {matter.title}
                              </h4>
                              <p className="text-sm text-muted-foreground font-mono">
                                {matter.matter_number}
                              </p>
                            </div>
                          </div>
                          
                          {matter.description && (
                            <p className="text-sm text-muted-foreground mb-3">
                              {matter.description}
                            </p>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <Badge className={getStatusColor(matter.status)}>
                              {matter.status?.replace('_', ' ') || 'Unknown Status'}
                            </Badge>
                            <span>{matter.matter_type?.replace('_', ' ') || 'General Matter'}</span>
                            {matter.assigned_lawyer && (
                              <span className="flex items-center">
                                <User className="h-4 w-4 mr-1" />
                                {matter.assigned_lawyer.display_name}
                              </span>
                            )}
                            <span className="flex items-center">
                              <FileText className="h-4 w-4 mr-1" />
                              {matter.document_count || 0} documents
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              Created {matter.created_at ? new Date(matter.created_at).toLocaleDateString() : 'Unknown date'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {matters.length === 0 && (
                  <div className="text-center py-12">
                    <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No matters yet</h3>
                    <p className="text-gray-600">
                      Your legal matters will appear here once they are created.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {documents.map((doc) => (
                  <Card key={doc.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          <div className="flex-shrink-0 text-2xl">
                            {getFileTypeIcon(doc.mime_type)}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="text-sm font-medium text-foreground truncate">
                                {doc.original_filename || doc.filename || 'Unnamed Document'}
                              </h4>
                              {doc.requires_signature && !doc.signed_at && (
                                <Badge variant="destructive" className="text-xs">
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Signature Required
                                </Badge>
                              )}
                              {doc.signed_at && (
                                <Badge className="bg-green-100 text-green-800 text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Signed
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>v{doc.version || 1}</span>
                              <span>{formatFileSize(doc.file_size)}</span>
                              <span>{doc.matter?.title || 'Unknown Matter'} ({doc.matter?.matter_number || 'N/A'})</span>
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : 'Unknown date'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedDocument(doc)}
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
                
                {documents.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
                    <p className="text-gray-600">
                      Documents shared with you will appear here.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Upload Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Documents</h3>
                <p className="text-gray-600 mb-4">
                  Document upload functionality would be implemented here.
                  This would allow clients to securely upload documents to their matters.
                </p>
                <Button disabled>
                  <Upload className="h-4 w-4 mr-2" />
                  Select Files to Upload
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
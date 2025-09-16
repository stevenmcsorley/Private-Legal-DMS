import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
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
  ArrowLeft,
  X,
  File
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
  const location = useLocation();
  const navigate = useNavigate();
  const [matters, setMatters] = useState<ClientMatter[]>([]);
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<ClientDocument | null>(null);
  
  // Upload state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedMatterId, setSelectedMatterId] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  // const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  
  // Determine initial tab based on current route
  const getInitialTab = () => {
    if (location.pathname.includes('/portal/documents')) return 'documents';
    if (location.pathname.includes('/portal/upload')) return 'upload';
    if (location.pathname.includes('/portal/matters')) return 'matters';
    return 'matters'; // default
  };
  
  const [activeTab, setActiveTab] = useState(getInitialTab());

  useEffect(() => {
    fetchClientData();
  }, []);

  // Update active tab when route changes
  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location.pathname]);

  // Handle tab changes by navigating to appropriate route
  const handleTabChange = (tab: string) => {
    switch (tab) {
      case 'matters':
        navigate('/portal/matters');
        break;
      case 'documents':
        navigate('/portal/documents');
        break;
      case 'upload':
        navigate('/portal/upload');
        break;
    }
    setActiveTab(tab);
  };

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

  // File upload handlers
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async () => {
    if (!selectedMatterId || selectedFiles.length === 0) return;

    setUploading(true);
    try {
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('matter_id', selectedMatterId);

        // TODO: This endpoint needs to be implemented in backend
        const response = await fetch('/api/client-portal/documents/upload', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }
      }

      // Reset form
      setSelectedFiles([]);
      setSelectedMatterId('');
      
      // Refresh documents list
      fetchClientData();
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-slate-700 rounded-lg flex items-center justify-center">
              <Building className="h-8 w-8 text-slate-300" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white mb-1">Welcome back, {user?.display_name}</h1>
              <p className="text-slate-400">Your secure legal document portal</p>
            </div>
          </div>
          <div className="text-right text-slate-400">
            <p className="text-sm">Last login</p>
            <p className="text-slate-300">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          className="cursor-pointer hover:bg-slate-700/50 transition-colors bg-slate-800 border border-slate-700"
          onClick={() => handleTabChange('matters')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 uppercase tracking-wide">Your Matters</p>
                <p className="text-2xl font-bold text-white">{matters.length}</p>
                <p className="text-xs text-slate-500">
                  {matters.filter(m => m.status === 'active').length} active
                </p>
              </div>
              <div className="h-12 w-12 bg-slate-700 rounded-lg flex items-center justify-center">
                <Archive className="h-6 w-6 text-slate-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:bg-slate-700/50 transition-colors bg-slate-800 border border-slate-700"
          onClick={() => handleTabChange('documents')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 uppercase tracking-wide">Available Documents</p>
                <p className="text-2xl font-bold text-white">{documents.length}</p>
                <p className="text-xs text-slate-500">
                  {documents.filter(d => d.uploaded_at && new Date(d.uploaded_at) > new Date(Date.now() - 7*24*60*60*1000)).length} recent
                </p>
              </div>
              <div className="h-12 w-12 bg-slate-700 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-slate-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:bg-slate-700/50 transition-colors bg-slate-800 border border-slate-700"
          onClick={() => handleTabChange('documents')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 uppercase tracking-wide">Pending Signatures</p>
                <p className="text-2xl font-bold text-white">
                  {documents.filter(d => d.requires_signature && !d.signed_at).length}
                </p>
                <p className="text-xs text-slate-500">
                  {documents.filter(d => d.requires_signature && !d.signed_at).length > 0 ? 'Action required' : 'All up to date'}
                </p>
              </div>
              <div className="h-12 w-12 bg-slate-700 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-slate-300" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="bg-slate-800 rounded-lg border border-slate-700">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <div className="border-b border-slate-700 px-6 pt-4">
            <TabsList className="grid w-full grid-cols-3 bg-slate-900 p-1 rounded-lg">
              <TabsTrigger 
                value="matters" 
                className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400 flex items-center gap-2"
              >
                <Archive className="h-4 w-4" />
                My Matters ({matters.length})
              </TabsTrigger>
              <TabsTrigger 
                value="documents"
                className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400 flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                My Documents ({documents.length})
              </TabsTrigger>
              <TabsTrigger 
                value="upload"
                className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400 flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload Documents
              </TabsTrigger>
            </TabsList>
          </div>

        <TabsContent value="matters" className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Your Legal Matters</h2>
              <p className="text-slate-400 text-sm mt-1">Track the progress of your legal cases</p>
            </div>
            <Badge variant="secondary" className="bg-slate-700 text-slate-300 border-slate-600">
              {matters.length} Total
            </Badge>
          </div>

          <div className="space-y-3">
            {matters.map((matter) => (
              <Card key={matter.id} className="hover:bg-slate-700/50 transition-colors bg-slate-700 border border-slate-600">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="h-8 w-8 bg-slate-600 rounded-lg flex items-center justify-center">
                          <Archive className="h-4 w-4 text-slate-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-medium text-white truncate">
                            {matter.title}
                          </h4>
                          <p className="text-sm text-slate-400 font-mono">
                            {matter.matter_number}
                          </p>
                        </div>
                      </div>
                      
                      {matter.description && (
                        <p className="text-slate-300 mb-3 text-sm leading-relaxed">
                          {matter.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <Badge className={`${getStatusColor(matter.status)} text-xs`}>
                          {matter.status?.replace('_', ' ') || 'Unknown Status'}
                        </Badge>
                        <span className="text-slate-400 bg-slate-600 px-2 py-1 rounded">
                          {matter.matter_type?.replace('_', ' ') || 'General Matter'}
                        </span>
                        {matter.assigned_lawyer && (
                          <span className="flex items-center text-slate-400 bg-slate-600 px-2 py-1 rounded">
                            <User className="h-3 w-3 mr-1" />
                            {matter.assigned_lawyer.display_name}
                          </span>
                        )}
                        <span className="flex items-center text-slate-400 bg-slate-600 px-2 py-1 rounded">
                          <FileText className="h-3 w-3 mr-1" />
                          {matter.document_count || 0} documents
                        </span>
                        <span className="flex items-center text-slate-400 bg-slate-600 px-2 py-1 rounded">
                          <Clock className="h-3 w-3 mr-1" />
                          {matter.created_at ? new Date(matter.created_at).toLocaleDateString() : 'Unknown date'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {matters.length === 0 && (
              <div className="text-center py-12 bg-slate-700 rounded-lg border border-slate-600">
                <div className="h-12 w-12 bg-slate-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Archive className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No matters yet</h3>
                <p className="text-slate-400 text-sm max-w-md mx-auto">
                  Your legal matters will appear here once they are created by your legal team.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="documents" className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Your Documents</h2>
              <p className="text-slate-400 text-sm mt-1">Access and download your legal documents</p>
            </div>
            <Badge variant="secondary" className="bg-slate-700 text-slate-300 border-slate-600">
              {documents.length} Total
            </Badge>
          </div>

          <div className="space-y-3">
            {documents.map((doc) => (
              <Card key={doc.id} className="hover:bg-slate-700/50 transition-colors bg-slate-700 border border-slate-600">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className="h-10 w-10 bg-slate-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5 text-slate-300" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-white font-medium truncate">
                            {doc.original_filename || doc.filename || 'Unnamed Document'}
                          </h4>
                          {doc.requires_signature && !doc.signed_at && (
                            <Badge variant="destructive" className="text-xs bg-red-900 text-red-200">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Signature Required
                            </Badge>
                          )}
                          {doc.signed_at && (
                            <Badge className="bg-green-900 text-green-200 text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Signed
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-xs text-slate-400">
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
                    
                    <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-slate-600 border-slate-500 text-slate-300 hover:bg-slate-500"
                        onClick={() => setSelectedDocument(doc)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="bg-slate-600 border-slate-500 text-slate-300 hover:bg-slate-500"
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
              <div className="text-center py-12 bg-slate-700 rounded-lg border border-slate-600">
                <div className="h-12 w-12 bg-slate-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <FileText className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No documents yet</h3>
                <p className="text-slate-400 text-sm max-w-md mx-auto">
                  Documents shared with you will appear here when they become available.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="upload" className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Upload Documents</h2>
              <p className="text-slate-400 text-sm mt-1">Securely upload documents to your matters</p>
            </div>
          </div>

          {/* Matter Selection */}
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="matter-select" className="text-white font-medium">
                    Select Matter <span className="text-red-400">*</span>
                  </Label>
                  <p className="text-sm text-slate-400 mt-1">Choose which matter these documents belong to</p>
                </div>
                
                <Select value={selectedMatterId} onValueChange={setSelectedMatterId}>
                  <SelectTrigger id="matter-select" className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Choose a matter..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {matters.map((matter) => (
                      <SelectItem key={matter.id} value={matter.id} className="text-white hover:bg-slate-600">
                        <div className="flex flex-col">
                          <span className="font-medium">{matter.title}</span>
                          <span className="text-sm text-slate-400">{matter.matter_number}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {matters.length === 0 && (
                  <div className="text-center py-4 text-slate-400">
                    <p className="text-sm">No matters available. Contact your legal team to get started.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* File Upload Area */}
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-white font-medium">Upload Files</Label>
                  <p className="text-sm text-slate-400 mt-1">Drag and drop files or click to browse</p>
                </div>

                {/* Drag & Drop Zone */}
                <div
                  className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-orange-500 transition-colors cursor-pointer"
                  onDrop={handleFileDrop}
                  onDragOver={handleDragOver}
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-white mb-2">Drop files here or click to browse</p>
                  <p className="text-sm text-slate-400">
                    Supports: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Max 10MB each)
                  </p>
                  <input
                    id="file-input"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  />
                </div>

                {/* Selected Files List */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-white font-medium">Selected Files ({selectedFiles.length})</Label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedFiles.map((file, index) => (
                        <div key={`${file.name}-${index}`} className="flex items-center justify-between bg-slate-700 p-3 rounded-lg border border-slate-600">
                          <div className="flex items-center space-x-3">
                            <File className="h-5 w-5 text-slate-300" />
                            <div>
                              <p className="text-white font-medium">{file.name}</p>
                              <p className="text-sm text-slate-400">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="text-slate-400 hover:text-red-400 hover:bg-slate-600"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                <div className="flex justify-end pt-4">
                  <Button
                    onClick={uploadFiles}
                    disabled={!selectedMatterId || selectedFiles.length === 0 || uploading}
                    className="bg-orange-600 hover:bg-orange-700 text-white border-orange-500"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload {selectedFiles.length} {selectedFiles.length === 1 ? 'File' : 'Files'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upload Tips */}
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <h3 className="text-white font-medium mb-3">Upload Guidelines</h3>
              <div className="space-y-2 text-sm text-slate-400">
                <p>• Files will be securely stored and accessible only to your legal team</p>
                <p>• Supported formats: PDF, Word documents, Excel files, and images</p>
                <p>• Maximum file size: 10MB per file</p>
                <p>• All uploads are encrypted and logged for security</p>
                <p>• You'll receive confirmation once files are successfully uploaded</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
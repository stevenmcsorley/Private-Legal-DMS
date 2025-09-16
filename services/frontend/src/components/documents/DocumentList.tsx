import React, { useState, useEffect, useRef } from 'react';
import { Search, Filter, Upload, FileText, Eye, Download, Calendar, Tag, AlertTriangle, User } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { DocumentViewer } from './DocumentViewer';
import { toast } from '../ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
// Using built-in date formatting instead of date-fns

interface DocumentMeta {
  document_type?: string;
  tags?: string[];
  parties?: string[];
  jurisdiction?: string;
  document_date?: string;
  effective_date?: string;
  expiry_date?: string;
  confidential?: boolean;
  privileged?: boolean;
  work_product?: boolean;
  custom_fields?: Record<string, any>;
}

interface Document {
  id: string;
  original_filename: string;
  mime_type: string;
  size_bytes: number;
  version: number;
  matter_id: string;
  firm_id: string;
  client_id: string;
  created_by: string;
  legal_hold: boolean;
  legal_hold_reason?: string;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  title?: string;
  description?: string;
  metadata?: DocumentMeta;
  uploaded_by_type: 'client' | 'legal_staff';
  uploaded_by_user_id?: string;
  matter?: {
    id: string;
    title: string;
    status: string;
  };
  client?: {
    id: string;
    name: string;
  };
  created_by_user?: {
    id: string;
    display_name: string;
    email: string;
  };
}

interface DocumentQuery {
  page?: number;
  limit?: number;
  search?: string;
  matter_id?: string;
  client_id?: string;
  document_type?: string;
  tags?: string[];
  confidential?: boolean;
  legal_hold?: boolean;
  uploaded_by_type?: string;
}

interface DocumentListProps {
  matterId?: string;
  clientId?: string;
  className?: string;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  matterId,
  clientId,
  className = '',
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showViewer, setShowViewer] = useState<boolean>(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalDocuments, setTotalDocuments] = useState<number>(0);
  const limit = 20;
  
  // Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [documentType, setDocumentType] = useState<string>('');
  const [showConfidential, setShowConfidential] = useState<boolean | null>(null);
  const [showLegalHold, setShowLegalHold] = useState<boolean | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [uploadType, setUploadType] = useState<string>('');
  
  // Filter panel
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [showMatterPicker, setShowMatterPicker] = useState<boolean>(false);
  const [matters, setMatters] = useState<Array<{ id: string; title: string; matter_number?: string }>>([]);
  const [loadingMatters, setLoadingMatters] = useState<boolean>(false);
  const [selectedMatterId, setSelectedMatterId] = useState<string>('');

  useEffect(() => {
    fetchDocuments();
  }, [currentPage, matterId, clientId, searchTerm, documentType, showConfidential, showLegalHold, selectedTags, uploadType]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      
      const query: DocumentQuery = {
        page: currentPage,
        limit,
        ...(searchTerm && { search: searchTerm }),
        ...(matterId && { matter_id: matterId }),
        ...(clientId && { client_id: clientId }),
        ...(documentType && { document_type: documentType }),
        ...(selectedTags.length > 0 && { tags: selectedTags }),
        ...(showConfidential !== null && { confidential: showConfidential }),
        ...(showLegalHold !== null && { legal_hold: showLegalHold }),
        ...(uploadType && { uploaded_by_type: uploadType }),
      };

      const queryParams = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            queryParams.append(key, value.join(','));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });

      const response = await fetch(`/api/documents?${queryParams}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }

      const data = await response.json();
      setDocuments(data.documents);
      setTotalDocuments(data.total);
      setTotalPages(Math.ceil(data.total / limit));
      setError('');
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError('Failed to load documents');
      toast({
        title: 'Error',
        description: 'Failed to load documents',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return '🖼️';
    } else if (mimeType === 'application/pdf') {
      return '📄';
    } else if (mimeType.includes('word') || mimeType.includes('document')) {
      return '📝';
    } else if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
      return '📊';
    } else if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) {
      return '📋';
    }
    return '📁';
  };

  const viewDocument = (document: Document) => {
    setSelectedDocument(document);
    setShowViewer(true);
  };

  const downloadDocument = async (doc: Document) => {
    try {
      const response = await fetch(`/api/documents/${doc.id}/download`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to download document');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.original_filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: 'Success',
        description: 'Document downloaded successfully',
      });
    } catch (error) {
      console.error('Error downloading document:', error);
      toast({
        title: 'Error',
        description: 'Failed to download document',
        variant: 'destructive',
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDocumentType('');
    setShowConfidential(null);
    setShowLegalHold(null);
    setSelectedTags([]);
    setUploadType('');
    setCurrentPage(1);
  };

  if (showViewer && selectedDocument) {
    return (
      <DocumentViewer
        documentId={selectedDocument.id}
        documentName={selectedDocument.title || selectedDocument.original_filename}
        mimeType={selectedDocument.mime_type}
        onClose={() => setShowViewer(false)}
        className={className}
      />
    );
  }

  return (
    <>
    <Card className={`w-full ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documents
            {totalDocuments > 0 && (
              <Badge variant="secondary">{totalDocuments}</Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              size="sm"
            >
              <Filter className="h-4 w-4 mr-1" />
              Filters
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
                const inputEl = fileInputRef.current;
                const file = e.target.files?.[0];
                if (!file) return;
                const targetMatterId = matterId || selectedMatterId;
                console.log('Upload attempt - matterId:', matterId, 'selectedMatterId:', selectedMatterId, 'targetMatterId:', targetMatterId);
                console.log('typeof targetMatterId:', typeof targetMatterId, 'length:', targetMatterId?.length);
                
                const uuidLike = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
                if (!targetMatterId || typeof targetMatterId !== 'string' || targetMatterId.trim() === '' || !uuidLike.test(targetMatterId)) {
                  console.log('UUID validation failed - targetMatterId:', JSON.stringify(targetMatterId));
                  toast({ title: 'Invalid matter selection', description: 'Please select a valid matter first.' , variant: 'destructive' });
                  if (inputEl) inputEl.value = '';
                  return;
                }
                try {
                  setUploading(true);
                  const form = new FormData();
                  form.append('file', file);
                  // DEBUG: Let's see what we're actually appending
                  console.log('Appending matter_id to form:', targetMatterId, 'Type:', typeof targetMatterId);
                  form.append('matter_id', targetMatterId);
                  form.append('title', file.name);
                  console.log('Sending form data - matter_id:', targetMatterId);

                  const response = await fetch('/api/documents/upload', {
                    method: 'POST',
                    body: form,
                    credentials: 'include',
                  });

                  if (!response.ok) {
                    const text = await response.text().catch(() => '');
                    throw new Error(text || 'Upload failed');
                  }

                  toast({ title: 'Uploaded', description: `${file.name} uploaded.` });
                  await fetchDocuments();
                } catch (err: any) {
                  console.error('Upload error:', err);
                  toast({
                    title: 'Upload failed',
                    description: err?.message || 'Could not upload document',
                    variant: 'destructive',
                  });
                } finally {
                  setUploading(false);
                  if (inputEl) inputEl.value = '';
                  setShowMatterPicker(false);
                }
              }}
            />
            <Button
              size="sm"
              onClick={() => {
                if (!matterId) {
                  // Open matter picker dialog
                  setShowMatterPicker(true);
                  if (matters.length === 0) {
                    // Fetch matters for selection
                    (async () => {
                      try {
                        setLoadingMatters(true);
                        const resp = await fetch('/api/matters?page=1&limit=50', { credentials: 'include' });
                        if (resp.ok) {
                          const data = await resp.json();
                          const items = (data?.matters || data?.items || data?.results || []) as any[];
                          const mapped = items.map((m) => ({ id: m.id, title: m.title || m.matter?.title || 'Untitled', matter_number: m.matter_number }));
                          console.log('Loaded matters:', mapped);
                          setMatters(mapped);
                        } else {
                          toast({ title: 'Failed to load matters', description: `Status ${resp.status}`, variant: 'destructive' });
                        }
                      } catch (err) {
                        console.error('Failed to load matters', err);
                        toast({ title: 'Failed to load matters', variant: 'destructive' });
                      } finally {
                        setLoadingMatters(false);
                      }
                    })();
                  }
                } else {
                  fileInputRef.current?.click();
                }
              }}
              disabled={uploading}
            >
              <Upload className="h-4 w-4 mr-1" />
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </div>
        
        {/* Search Bar with filter capabilities */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-slate-900 rounded-lg border border-slate-800">
            <div>
              <label className="block text-sm font-medium mb-2">Document Type</label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="agreement">Agreement</SelectItem>
                  <SelectItem value="memo">Memo</SelectItem>
                  <SelectItem value="correspondence">Correspondence</SelectItem>
                  <SelectItem value="filing">Filing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Upload Source</label>
              <Select value={uploadType} onValueChange={setUploadType}>
                <SelectTrigger>
                  <SelectValue placeholder="All uploads" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All uploads</SelectItem>
                  <SelectItem value="client">Client uploads</SelectItem>
                  <SelectItem value="legal_staff">Legal staff uploads</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">Attributes</label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="confidential"
                  checked={showConfidential === true}
                  onCheckedChange={(checked) => setShowConfidential(checked ? true : null)}
                />
                <label htmlFor="confidential" className="text-sm">Confidential</label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="legal-hold"
                  checked={showLegalHold === true}
                  onCheckedChange={(checked) => setShowLegalHold(checked ? true : null)}
                />
                <label htmlFor="legal-hold" className="text-sm">Legal Hold</label>
              </div>
            </div>
            
            <div className="flex items-end">
              <Button onClick={clearFilters} variant="outline" size="sm">
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-2"></div>
            <p className="text-slate-400">Loading documents...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-2">{error}</p>
            <Button onClick={fetchDocuments} variant="outline">
              Retry
            </Button>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-slate-500 mx-auto mb-2" />
            <p className="text-slate-400">No documents found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((document) => (
              <div
                key={document.id}
                className="flex items-center justify-between p-4 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="text-2xl">{getFileIcon(document.mime_type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-slate-100 truncate">
                        {document.title || document.original_filename}
                      </h3>
                      {document.legal_hold && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Legal Hold
                        </Badge>
                      )}
                      {document.metadata?.confidential && (
                        <Badge variant="secondary" className="text-xs">
                          Confidential
                        </Badge>
                      )}
                      {document.uploaded_by_type === 'client' && (
                        <Badge variant="outline" className="text-xs bg-blue-600/20 text-blue-300 border-blue-500">
                          <User className="h-3 w-3 mr-1" />
                          Client Upload
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-slate-400 space-x-4">
                      <span>{formatFileSize(document.size_bytes)}</span>
                      <span>
                        <Calendar className="h-3 w-3 inline mr-1" />
{new Date(document.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric',
                          month: 'short', 
                          day: 'numeric'
                        })}
                      </span>
                      {document.matter && (
                        <span>Matter: {document.matter.title}</span>
                      )}
                      {document.created_by_user && (
                        <span>by {document.created_by_user.display_name}</span>
                      )}
                    </div>
                    {document.metadata?.tags && document.metadata.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {document.metadata.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            <Tag className="h-2 w-2 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => viewDocument(document)}
                    variant="ghost"
                    size="sm"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => downloadDocument(document)}
                    variant="ghost"
                    size="sm"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-slate-400">
                  Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, totalDocuments)} of {totalDocuments} documents
                </p>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm font-medium">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
    </CardContent>
    </Card>

    {/* Matter Picker Dialog for uploads from global view */}
    <Dialog open={showMatterPicker} onOpenChange={setShowMatterPicker}>
      <DialogContent aria-describedby="matter-picker-desc">
        <DialogHeader>
          <DialogTitle>Select a matter for upload</DialogTitle>
        </DialogHeader>
        <div id="matter-picker-desc" className="sr-only">Choose the matter this document belongs to.</div>
        <div className="space-y-3">
          {loadingMatters ? (
            <div className="text-sm text-slate-400">Loading matters...</div>
          ) : matters.length === 0 ? (
            <div className="text-sm text-slate-400">No matters available.</div>
          ) : (
            <div className="max-h-64 overflow-auto divide-y divide-slate-800 border border-slate-800 rounded">
              {matters.map((m) => (
                <button
                  key={m.id}
                  className={`w-full text-left px-3 py-2 hover:bg-slate-800 ${selectedMatterId === m.id ? 'bg-slate-800' : ''}`}
                  onClick={() => {
                    console.log('Selected matter:', m.id, m.title);
                    setSelectedMatterId(m.id);
                  }}
                >
                  <div className="font-medium text-slate-100">{m.title}</div>
                  {m.matter_number && (
                    <div className="text-xs text-slate-400">{m.matter_number}</div>
                  )}
                </button>
              ))}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => {
              setSelectedMatterId('');
              setShowMatterPicker(false);
            }}>Cancel</Button>
            <Button onClick={() => {
              if (!selectedMatterId) {
                toast({ title: 'Select a matter', description: 'Choose a matter to continue.', variant: 'destructive' });
                return;
              }
              console.log('Continue clicked with selectedMatterId:', selectedMatterId);
              setShowMatterPicker(false);
              // Directly trigger file picker
              console.log('Opening file picker...');
              fileInputRef.current?.click();
            }}>Continue</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};

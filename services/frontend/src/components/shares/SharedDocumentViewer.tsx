import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  ArrowLeft, 
  Shield, 
  Building,
  AlertTriangle 
} from 'lucide-react';
import { DocumentViewer } from '../documents/DocumentViewer';

interface SharedDocument {
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
  isWatermarked?: boolean;
}

interface ShareInfo {
  id: string;
  shared_by_firm_name: string;
  shared_with_firm_name: string;
  role: string;
  status: string;
  expires_at?: string;
}

export const SharedDocumentViewer: React.FC = () => {
  const { shareId, documentId } = useParams<{ shareId: string; documentId: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<SharedDocument | null>(null);
  const [shareInfo, setShareInfo] = useState<ShareInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (shareId) {
      fetchDocumentInfo();
    }
  }, [shareId, documentId]);

  const fetchDocumentInfo = async () => {
    try {
      setLoading(true);
      
      // Try to fetch real share data from API, fallback to error handling
      let shareData;
      try {
        const shareResponse = await fetch(`/api/shares/${shareId}`, {
          credentials: 'include'
        });
        
        if (shareResponse.ok) {
          shareData = await shareResponse.json();
        } else {
          throw new Error('Share API endpoint not available');
        }
      } catch (apiError) {
        // API endpoint not available, show error message
        setError('Share details cannot be loaded. The share detail API endpoint needs to be implemented.');
        setLoading(false);
        return;
      }
      
      // Use the first document if documentId is not specified in URL
      const targetDocument = documentId 
        ? shareData.documents.find((doc: any) => doc.id === documentId)
        : shareData.documents[0];
        
      if (!targetDocument) {
        throw new Error('Document not found in share');
      }
      
      setDocument({
        id: targetDocument.id,
        filename: targetDocument.filename,
        original_filename: targetDocument.original_filename,
        file_size: targetDocument.file_size,
        mime_type: targetDocument.mime_type,
        uploaded_at: targetDocument.uploaded_at,
        matter: {
          title: shareData.matter.title,
          matter_number: shareData.matter.matter_number,
        },
        isWatermarked: shareData.is_external,
      });

      setShareInfo({
        id: shareData.id,
        shared_by_firm_name: shareData.shared_by_firm_name,
        shared_with_firm_name: shareData.shared_with_firm_name,
        role: shareData.role,
        status: shareData.status,
        expires_at: shareData.expires_at,
      });

    } catch (error) {
      console.error('Error fetching shared document:', error);
      setError('Failed to load shared document');
    } finally {
      setLoading(false);
    }
  };

  const downloadDocument = async () => {
    if (!shareId || !documentId) return;

    try {
      // Use the watermarked download endpoint for external shares
      const response = await fetch(`/api/shares/${shareId}/documents/${documentId}/download`, {
        credentials: 'include',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = window.document.createElement('a');
        link.href = url;
        
        // Check if document was watermarked
        const filename = response.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1] || 'document.pdf';
        
        link.download = filename;
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        setError('Failed to download document');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      setError('Failed to download document');
    }
  };

  const getPreviewUrl = () => {
    if (!shareId || !document) return '';
    // Use the watermarked stream endpoint for external shares
    return `/api/shares/${shareId}/documents/${document.id}/stream`;
  };

  const getDownloadUrl = () => {
    if (!shareId || !document) return '';
    // Use the watermarked download endpoint for external shares
    return `/api/shares/${shareId}/documents/${document.id}/download`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <Card className="w-full h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading shared document...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-2">{error}</p>
            <Button onClick={() => navigate(-1)} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!document || !shareInfo) {
    return (
      <Card className="w-full h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-gray-600">Document not found</p>
            <Button onClick={() => navigate(-1)} variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with share info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Cross-Firm Shared Document
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Shared by {shareInfo.shared_by_firm_name} with {shareInfo.shared_with_firm_name}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant={shareInfo.status === 'active' ? 'default' : 'secondary'}>
                {shareInfo.status}
              </Badge>
              <Badge variant="outline" className="flex items-center">
                <Shield className="h-3 w-3 mr-1" />
                {shareInfo.role}
              </Badge>
              {document.isWatermarked && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <Shield className="h-3 w-3 mr-1" />
                  Watermarked
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Document info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                📄
              </div>
              <div>
                <h3 className="font-medium">{document.original_filename}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>{formatFileSize(document.file_size)}</span>
                  <span>•</span>
                  <span>{document.matter.title} ({document.matter.matter_number})</span>
                  <span>•</span>
                  <span>Uploaded {new Date(document.uploaded_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={downloadDocument}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security notice for watermarked documents */}
      {document.isWatermarked && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Watermarked Document</h4>
                <p className="text-sm text-blue-700 mt-1">
                  This document contains watermarks identifying the sharing firm and recipient. 
                  All access is logged and monitored for security compliance.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document viewer */}
      <DocumentViewer
        documentId={document.id}
        documentName={document.original_filename}
        mimeType={document.mime_type}
        className="min-h-[800px]"
        // Override both URLs to use the watermarked endpoints
        previewUrl={getPreviewUrl()}
        downloadUrl={getDownloadUrl()}
      />
    </div>
  );
};
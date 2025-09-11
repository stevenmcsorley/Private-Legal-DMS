import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { toast } from '../ui/use-toast';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface DocumentViewerProps {
  documentId: string;
  documentName: string;
  mimeType: string;
  onClose?: () => void;
  className?: string;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documentId,
  documentName,
  mimeType,
  onClose,
  className = '',
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetchPreviewUrl();
  }, [documentId]);

  const fetchPreviewUrl = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/documents/${documentId}/preview`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch preview URL');
      }
      
      const data = await response.json();
      setPreviewUrl(data.url);
    } catch (error) {
      console.error('Error fetching preview URL:', error);
      setError('Failed to load document preview');
      toast({
        title: 'Error',
        description: 'Failed to load document preview',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setError('');
  };

  const onDocumentLoadError = (error: Error) => {
    console.error('Error loading document:', error);
    setError('Failed to load document');
    toast({
      title: 'Error',
      description: 'Failed to load document',
      variant: 'destructive',
    });
  };

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(numPages, prev + 1));
  };

  const zoomIn = () => {
    setScale(prev => Math.min(3.0, prev + 0.2));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(0.5, prev - 0.2));
  };

  const downloadDocument = async () => {
    try {
      const response = await fetch(`/api/documents/${documentId}/download`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to download document');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = documentName;
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

  const isPDF = mimeType === 'application/pdf';

  if (loading) {
    return (
      <Card className={`w-full h-96 ${className}`}>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Loading document...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`w-full h-96 ${className}`}>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-red-600 mb-2">{error}</p>
            <Button onClick={fetchPreviewUrl} variant="outline">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium truncate">{documentName}</CardTitle>
          <div className="flex items-center gap-2">
            {isPDF && (
              <>
                <Button
                  onClick={zoomOut}
                  variant="outline"
                  size="sm"
                  disabled={scale <= 0.5}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium min-w-[4rem] text-center">
                  {Math.round(scale * 100)}%
                </span>
                <Button
                  onClick={zoomIn}
                  variant="outline"
                  size="sm"
                  disabled={scale >= 3.0}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button onClick={downloadDocument} variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
            {onClose && (
              <Button onClick={onClose} variant="outline" size="sm">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {isPDF && numPages > 0 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <Button
              onClick={goToPrevPage}
              variant="outline"
              size="sm"
              disabled={pageNumber <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              Page {pageNumber} of {numPages}
            </span>
            <Button
              onClick={goToNextPage}
              variant="outline"
              size="sm"
              disabled={pageNumber >= numPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="border rounded-lg bg-gray-50 min-h-[600px] flex items-center justify-center overflow-auto">
          {isPDF ? (
            <Document
              file={previewUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-600">Loading PDF...</p>
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                loading={
                  <div className="text-center p-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-gray-600">Loading page...</p>
                  </div>
                }
              />
            </Document>
          ) : mimeType.startsWith('image/') ? (
            <img
              src={previewUrl}
              alt={documentName}
              className="max-w-full max-h-full object-contain"
              style={{ transform: `scale(${scale})` }}
            />
          ) : (
            <div className="text-center p-8">
              <p className="text-gray-600 mb-4">Preview not available for this file type</p>
              <p className="text-sm text-gray-500 mb-4">File type: {mimeType}</p>
              <Button onClick={downloadDocument}>
                <Download className="h-4 w-4 mr-2" />
                Download to view
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
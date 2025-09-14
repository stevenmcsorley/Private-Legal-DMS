import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { toast } from '../ui/use-toast';

// Set up PDF.js worker (CSP-safe: load locally via Vite)
// Using Vite asset import to avoid external CDN blocked by CSP
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Vite's ?url returns a string URL at build time
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker as unknown as string;

// Suppress PDF.js font warnings (TT: undefined function errors)
const originalConsoleWarn = console.warn;
console.warn = (...args: any[]) => {
  const message = args[0];
  if (typeof message === 'string' && message.includes('TT: undefined function')) {
    return; // Suppress these harmless PDF.js font warnings
  }
  originalConsoleWarn.apply(console, args);
};

interface DocumentViewerProps {
  documentId: string;
  documentName: string;
  mimeType: string;
  onClose?: () => void;
  className?: string;
  previewUrl?: string; // Optional custom preview URL for watermarked documents
  downloadUrl?: string; // Optional custom download URL for watermarked documents
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documentId,
  documentName,
  mimeType,
  onClose,
  className = '',
  previewUrl: customPreviewUrl,
  downloadUrl: customDownloadUrl,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);
  const isPDF = mimeType === 'application/pdf';

  useEffect(() => {
    // Reset to initial load state when document changes
    setIsInitialLoad(true);
    setPageNumber(1);
    
    if (customPreviewUrl) {
      // Use custom preview URL directly (for watermarked documents)
      setPreviewUrl(customPreviewUrl);
      setLoading(false);
    } else {
      fetchPreviewUrl();
    }
  }, [documentId, customPreviewUrl]);

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isPDF || numPages === 0) return;
      
      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault();
          goToPrevPage();
          break;
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault();
          goToNextPage();
          break;
        case 'Home':
          event.preventDefault();
          setPageNumber(1);
          break;
        case 'End':
          event.preventDefault();
          setPageNumber(numPages);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPDF, numPages, pageNumber]);

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
    // Only reset to page 1 on the initial document load, not on re-renders
    if (isInitialLoad) {
      setPageNumber(1);
      setIsInitialLoad(false);
    }
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

  const fitToWidth = () => {
    setScale(1.0);
  };

  const downloadDocument = async () => {
    try {
      const downloadEndpoint = customDownloadUrl || `/api/documents/${documentId}/download`;
      const response = await fetch(downloadEndpoint, {
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
                  title="Zoom Out (Ctrl+-)"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                  onClick={fitToWidth}
                  variant="outline"
                  size="sm"
                  title="Fit to Width"
                  className="px-2"
                >
                  <span className="text-xs">Fit</span>
                </Button>
                <span className="text-sm font-medium min-w-[4rem] text-center">
                  {Math.round(scale * 100)}%
                </span>
                <Button
                  onClick={zoomIn}
                  variant="outline"
                  size="sm"
                  disabled={scale >= 3.0}
                  title="Zoom In (Ctrl++)"
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
          <div className="flex items-center justify-center gap-4 pt-3 border-t border-slate-200">
            <Button
              onClick={goToPrevPage}
              variant="outline"
              size="sm"
              disabled={pageNumber <= 1}
              className="bg-white hover:bg-slate-50"
              title="Previous Page (Left Arrow)"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-600">Page</span>
              <input
                type="number"
                min="1"
                max={numPages}
                value={pageNumber}
                onChange={(e) => {
                  const page = parseInt(e.target.value);
                  if (page >= 1 && page <= numPages) {
                    setPageNumber(page);
                  }
                }}
                className="w-16 px-2 py-1 text-sm text-center border border-slate-300 rounded"
              />
              <span className="text-sm text-slate-600">of {numPages}</span>
            </div>
            <Button
              onClick={goToNextPage}
              variant="outline"
              size="sm"
              disabled={pageNumber >= numPages}
              className="bg-white hover:bg-slate-50"
              title="Next Page (Right Arrow)"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="border rounded-lg bg-white min-h-[600px] flex items-center justify-center overflow-auto">
          {isPDF ? (
            <Document
              file={previewUrl}
              options={{ 
                withCredentials: true,
                verbosity: 0, // Suppress warnings
                standardFontDataUrl: undefined, // Prevent font loading warnings
              }}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-2"></div>
                  <p className="text-slate-600">Loading PDF...</p>
                </div>
              }
              className="flex flex-col items-center"
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                loading={
                  <div className="text-center p-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500 mx-auto mb-2"></div>
                    <p className="text-slate-600">Loading page...</p>
                  </div>
                }
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="border border-gray-200 shadow-sm"
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

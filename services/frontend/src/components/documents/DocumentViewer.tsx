import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, X, Move, RotateCw } from 'lucide-react';
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

// Helper function to determine document type
const getDocumentType = (mimeType: string): 'pdf' | 'office' | 'image' | 'unsupported' => {
  if (mimeType === 'application/pdf') return 'pdf';
  
  if (mimeType.includes('officedocument') || 
      mimeType.includes('msword') ||
      mimeType.includes('ms-excel') ||
      mimeType.includes('ms-powerpoint') ||
      mimeType.includes('vnd.oasis.opendocument')) {
    return 'office';
  }
  
  if (mimeType.startsWith('image/')) return 'image';
  
  return 'unsupported';
};

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
  const [onlyOfficeUrl, setOnlyOfficeUrl] = useState<string>('');
  
  // Image viewer state
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);
  
  const documentType = getDocumentType(mimeType);

  useEffect(() => {
    // Reset to initial load state when document changes
    setIsInitialLoad(true);
    setPageNumber(1);
    
    if (customPreviewUrl) {
      // Use custom preview URL directly (for watermarked documents)
      setPreviewUrl(customPreviewUrl);
      setLoading(false);
    } else if (documentType === 'office') {
      fetchOnlyOfficeUrl();
    } else {
      fetchPreviewUrl();
    }
  }, [documentId, customPreviewUrl, documentType]);

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (documentType !== 'pdf' || numPages === 0) return;
      
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
  }, [documentType, numPages, pageNumber]);

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

  const fetchOnlyOfficeUrl = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/documents/${documentId}/onlyoffice-url`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch OnlyOffice configuration');
      }
      
      const data = await response.json();
      
      console.log('OnlyOffice response data:', data);
      
      // Use the config object from the response
      if (data.config) {
        console.log('Initializing OnlyOffice with config:', data.config);
        initializeOnlyOffice(data.config);
      } else {
        console.error('No config found in OnlyOffice response');
        throw new Error('Invalid OnlyOffice configuration response');
      }
    } catch (error) {
      console.error('Error fetching OnlyOffice configuration:', error);
      setError('Failed to load document for editing');
      toast({
        title: 'Error',
        description: 'Failed to load document for editing',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const initializeOnlyOffice = (config: any) => {
    console.log('Initializing OnlyOffice with config:', config);
    
    // Load OnlyOffice Document API script
    const script = document.createElement('script');
    script.src = `http://localhost:8082/web-apps/apps/api/documents/api.js`;
    
    console.log('Loading OnlyOffice API from:', script.src);
    
    script.onload = () => {
      console.log('OnlyOffice API script loaded');
      if ((window as any).DocsAPI) {
        console.log('DocsAPI is available, initializing editor...');
        const editorId = `onlyoffice-editor-${documentId}`;
        
        // Set state first to trigger re-render, then initialize OnlyOffice
        setOnlyOfficeUrl('api-loaded');
        
        // Use setTimeout to ensure React has rendered the container after state update
        setTimeout(() => {
          const container = document.getElementById(editorId);
          if (container) {
            console.log('Found container element:', editorId);
            container.innerHTML = '';
            
            // Initialize OnlyOffice editor
            console.log('Creating DocsAPI.DocEditor with config:', config);
            try {
              new (window as any).DocsAPI.DocEditor(editorId, config);
              setOnlyOfficeUrl('initialized');
              console.log('OnlyOffice editor initialized successfully');
            } catch (err) {
              console.error('Error initializing OnlyOffice editor:', err);
              setError('Failed to initialize OnlyOffice editor');
            }
          } else {
            console.error('Container element still not found after state update:', editorId);
            setError('OnlyOffice container not available');
          }
        }, 0);
      } else {
        console.error('DocsAPI not available after script load');
        setError('OnlyOffice API not available');
      }
    };
    
    script.onerror = (err) => {
      console.error('Failed to load OnlyOffice API script:', err);
      setError('Failed to load OnlyOffice API');
    };
    
    document.head.appendChild(script);
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

  // Image manipulation functions
  const resetImageView = () => {
    setScale(1.0);
    setImagePosition({ x: 0, y: 0 });
    setRotation(0);
  };

  const rotateImage = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  // Mouse/touch handlers for image panning
  const handleImageMouseDown = useCallback((e: React.MouseEvent) => {
    if (documentType === 'image' && scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - imagePosition.x,
        y: e.clientY - imagePosition.y
      });
      e.preventDefault();
    }
  }, [documentType, scale, imagePosition]);

  const handleImageMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && documentType === 'image') {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, documentType, dragStart]);

  const handleImageMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Wheel zoom for images
  const handleImageWheel = useCallback((e: React.WheelEvent) => {
    if (documentType === 'image' && e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale(prev => Math.max(0.1, Math.min(5.0, prev + delta)));
    }
  }, [documentType]);

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
      <Card className={`w-full h-96 bg-slate-800 border-slate-700 ${className}`}>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
            <p className="text-slate-300">Loading document...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`w-full h-96 bg-slate-800 border-slate-700 ${className}`}>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-red-400 mb-2">{error}</p>
            <Button onClick={fetchPreviewUrl} variant="outline" className="border-orange-500 text-orange-300 hover:bg-orange-500 hover:text-white">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full bg-slate-800 border-slate-700 ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium truncate text-white">{documentName}</CardTitle>
          <div className="flex items-center gap-2">
            {(documentType === 'pdf' || documentType === 'image') && (
              <>
                <Button
                  onClick={zoomOut}
                  variant="outline"
                  size="sm"
                  disabled={scale <= (documentType === 'image' ? 0.1 : 0.5)}
                  title="Zoom Out (Ctrl+-)"
                  className="border-slate-500 text-slate-300 hover:bg-slate-500 hover:text-white"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                  onClick={documentType === 'image' ? resetImageView : fitToWidth}
                  variant="outline"
                  size="sm"
                  title={documentType === 'image' ? "Reset View" : "Fit to Width"}
                  className="px-2 border-slate-500 text-slate-300 hover:bg-slate-500 hover:text-white"
                >
                  <span className="text-xs">{documentType === 'image' ? 'Reset' : 'Fit'}</span>
                </Button>
                <span className="text-sm font-medium min-w-[4rem] text-center text-white bg-slate-700 px-2 py-1 rounded border border-slate-600">
                  {Math.round(scale * 100)}%
                </span>
                <Button
                  onClick={zoomIn}
                  variant="outline"
                  size="sm"
                  disabled={scale >= (documentType === 'image' ? 5.0 : 3.0)}
                  title="Zoom In (Ctrl++)"
                  className="border-slate-500 text-slate-300 hover:bg-slate-500 hover:text-white"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </>
            )}
            {documentType === 'image' && (
              <>
                <Button
                  onClick={rotateImage}
                  variant="outline"
                  size="sm"
                  title="Rotate 90°"
                  className="border-slate-500 text-slate-300 hover:bg-slate-500 hover:text-white"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
                {scale > 1 && (
                  <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded border border-slate-600">
                    <Move className="h-3 w-3" />
                    <span>Drag to pan</span>
                  </div>
                )}
              </>
            )}
            <Button onClick={downloadDocument} variant="outline" size="sm" className="border-orange-500 text-orange-300 hover:bg-orange-500 hover:text-white">
              <Download className="h-4 w-4" />
            </Button>
            {onClose && (
              <Button onClick={onClose} variant="outline" size="sm" className="border-red-500 text-red-300 hover:bg-red-500 hover:text-white">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {documentType === 'pdf' && numPages > 0 && (
          <div className="flex items-center justify-center gap-4 pt-3 border-t border-slate-600">
            <Button
              onClick={goToPrevPage}
              variant="outline"
              size="sm"
              disabled={pageNumber <= 1}
              className="border-slate-500 text-slate-300 hover:bg-slate-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              title="Previous Page (Left Arrow)"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center gap-2 bg-slate-700 px-3 py-2 rounded-lg border border-slate-600">
              <span className="text-sm text-white font-medium">Page</span>
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
                className="w-16 px-2 py-1 text-sm text-center bg-slate-600 border border-slate-500 rounded text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <span className="text-sm text-slate-300">of</span>
              <span className="text-sm text-white font-medium">{numPages}</span>
            </div>
            <Button
              onClick={goToNextPage}
              variant="outline"
              size="sm"
              disabled={pageNumber >= numPages}
              className="border-slate-500 text-slate-300 hover:bg-slate-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              title="Next Page (Right Arrow)"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className="border border-slate-600 rounded-lg bg-slate-900 min-h-[600px] flex items-center justify-center overflow-auto">
          {documentType === 'pdf' ? (
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
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
                  <p className="text-slate-300">Loading PDF...</p>
                </div>
              }
              className="flex flex-col items-center"
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                loading={
                  <div className="text-center p-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto mb-2"></div>
                    <p className="text-slate-300">Loading page...</p>
                  </div>
                }
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="border border-slate-600 shadow-lg bg-white"
              />
            </Document>
          ) : documentType === 'office' && (onlyOfficeUrl === 'api-loaded' || onlyOfficeUrl === 'initialized') ? (
            <div 
              id={`onlyoffice-editor-${documentId}`}
              className="w-full h-[600px] bg-white"
              style={{ minHeight: '600px' }}
            />
          ) : documentType === 'image' ? (
            <div 
              ref={imageContainerRef}
              className="w-full h-full flex items-center justify-center overflow-hidden relative"
              onMouseDown={handleImageMouseDown}
              onMouseMove={handleImageMouseMove}
              onMouseUp={handleImageMouseUp}
              onMouseLeave={handleImageMouseUp}
              onWheel={handleImageWheel}
              style={{ 
                cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
              }}
            >
              <img
                src={previewUrl}
                alt={documentName}
                className="max-w-none max-h-none object-contain select-none"
                style={{ 
                  transform: `
                    translate(${imagePosition.x}px, ${imagePosition.y}px) 
                    scale(${scale}) 
                    rotate(${rotation}deg)
                  `,
                  transformOrigin: 'center center',
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                }}
                draggable={false}
              />
              {scale <= 1 && (
                <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  Use Ctrl+Scroll or zoom buttons to zoom in
                </div>
              )}
            </div>
          ) : documentType === 'office' ? (
            <div className="text-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
              <p className="text-slate-300">Loading Office document...</p>
            </div>
          ) : (
            <div className="text-center p-8">
              <p className="text-slate-300 mb-4">Preview not available for this file type</p>
              <p className="text-sm text-slate-400 mb-4">File type: {mimeType}</p>
              <Button onClick={downloadDocument} className="bg-orange-600 hover:bg-orange-700 text-white">
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

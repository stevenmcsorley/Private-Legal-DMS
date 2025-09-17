import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter,
  FileText,
  Building,
  Eye,
  Download,
  AlertCircle,
  X,
  RefreshCw,
  Folder,
  Calendar
} from 'lucide-react';
import { DocumentViewer } from '@/components/documents/DocumentViewer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Link } from 'react-router-dom';

interface SearchResult {
  type: 'document' | 'matter' | 'client';
  id: string;
  title: string;
  snippet: string;
  score: number;
  metadata: any;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  estimatedPage?: number;
  totalPages?: number;
}

interface DocumentResult extends SearchResult {
  type: 'document';
  metadata: {
    firm_id?: string;
    matter_id?: string;
    client_id?: string;
    filename?: string;
    file_size?: number;
    mime_type?: string;
    tags?: string[];
    created_at?: string;
    updated_at?: string;
    created_by?: string;
    is_confidential?: boolean;
    legal_hold_active?: boolean;
    retention_class?: string;
    matter?: {
      title: string;
      matter_number?: string;
    };
    client?: {
      name: string;
    };
  };
}

interface MatterResult extends SearchResult {
  type: 'matter';
  metadata: {
    firm_id?: string;
    matter_id?: string;
    client_id?: string;
    tags?: string[];
    created_at?: string;
    updated_at?: string;
    created_by?: string;
    is_confidential?: boolean;
    matter_number?: string;
    matter_type?: string;
    status?: string;
    priority?: string;
    client?: {
      name: string;
    };
    assigned_lawyer?: string;
    document_count?: number;
  };
}

interface ClientResult extends SearchResult {
  type: 'client';
  metadata: {
    firm_id?: string;
    client_id?: string;
    tags?: string[];
    created_at?: string;
    updated_at?: string;
    email?: string;
    client_type?: string;
    status?: string;
    contact_person?: string;
    matter_count?: number;
    document_count?: number;
  };
}

type AnySearchResult = DocumentResult | MatterResult | ClientResult;

export const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<AnySearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState<string>('all');
  const [confidentialFilter, setConfidentialFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<DocumentResult | null>(null);
  const [reindexing, setReindexing] = useState(false);

  const performSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: searchQuery,
        type: searchType,
        sort: sortBy,
        ...(dateRange !== 'all' && { date_range: dateRange }),
        ...(confidentialFilter !== 'all' && { confidential: confidentialFilter }),
      });

      const response = await fetch(`/api/search?${params}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
      }
    } catch (error) {
      console.error('Error performing search:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, searchType, sortBy, dateRange, confidentialFilter]);

  const getSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const params = new URLSearchParams({ q: query });
      const response = await fetch(`/api/search/suggestions?${params}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.slice(0, 5)); // Show top 5 suggestions
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    }
  }, []);

  useEffect(() => {
    if (searchQuery.length >= 3) {
      const debounceTimeout = setTimeout(() => {
        getSuggestions(searchQuery);
      }, 500);
      return () => clearTimeout(debounceTimeout);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, getSuggestions]);

  // Remove automatic search on typing - only search on submit or filter changes
  useEffect(() => {
    if (searchQuery.trim() && searchQuery.length >= 3) {
      // Only auto-search when filters change, not when typing
      const debounceTimeout = setTimeout(() => {
        performSearch();
      }, 800);
      return () => clearTimeout(debounceTimeout);
    } else if (!searchQuery.trim()) {
      setResults([]);
    }
  }, [searchType, sortBy, dateRange, confidentialFilter, performSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  const downloadDocument = async (docId: string, filename: string) => {
    try {
      const response = await fetch(`/api/documents/${docId}/download`, {
        credentials: 'include',
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const viewDocument = (document: DocumentResult) => {
    setViewingDocument(document);
  };

  const closeDocumentViewer = () => {
    setViewingDocument(null);
  };

  const triggerReindex = async () => {
    setReindexing(true);
    try {
      const response = await fetch('/api/search/reindex', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Reindex completed:', data);
        alert('Reindexing completed successfully! All existing documents have been indexed for search.');
      } else {
        const error = await response.text();
        console.error('Reindex failed:', error);
        alert('Reindexing failed. You may need super admin permissions.');
      }
    } catch (error) {
      console.error('Error during reindex:', error);
      alert('Failed to trigger reindexing. Please try again.');
    } finally {
      setReindexing(false);
    }
  };

  const filterResultsByType = (type: string) => {
    if (type === 'all') return results;
    return results.filter(result => result.type === type);
  };

  const getResultCounts = () => {
    const documents = results.filter(r => r.type === 'document').length;
    const matters = results.filter(r => r.type === 'matter').length;
    const clients = results.filter(r => r.type === 'client').length;
    return { documents, matters, clients, total: results.length };
  };

  const counts = getResultCounts();
  const filteredResults = filterResultsByType(activeTab);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-orange-400 mb-2">Search</h1>
            <p className="text-slate-300">Search across documents, matters, and clients</p>
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            <Button 
              variant="outline" 
              onClick={triggerReindex}
              disabled={reindexing}
              className="bg-orange-600 border-orange-500 text-white hover:bg-orange-700"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${reindexing ? 'animate-spin' : ''}`} />
              {reindexing ? 'Reindexing...' : 'Reindex Files'}
            </Button>
          </div>
        </div>

        {/* Search Form */}
        <Card className="bg-slate-800 border-slate-700 mb-8">
          <CardContent className="p-6">
            <form onSubmit={handleSearchSubmit} className="space-y-6">
              <div className="relative flex">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    placeholder='Enter at least 3 characters to search... "contract terms"~5, title:merger, attorney OR lawyer'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchQuery.length >= 3) {
                        e.preventDefault();
                        performSearch();
                      }
                    }}
                    className="pl-12 pr-4 text-lg py-4 bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-orange-500 focus:ring-orange-500"
                  />
                  
                  {/* Search Suggestions Dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-slate-700 border border-slate-600 rounded-md shadow-xl z-10 mt-1">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          className="w-full text-left px-4 py-3 hover:bg-slate-600 focus:bg-slate-600 text-sm text-white flex items-center"
                          onClick={() => {
                            setSearchQuery(suggestion);
                            setShowSuggestions(false);
                            if (suggestion.length >= 3) {
                              performSearch();
                            }
                          }}
                        >
                          <Search className="h-3 w-3 mr-3 text-slate-400" />
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={searchQuery.length < 3 || loading}
                  className="ml-3 px-6 py-4 bg-orange-600 hover:bg-orange-700 text-white disabled:bg-slate-600 disabled:text-slate-400"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>
              
              {/* Advanced Search Hints */}
              <div className="text-sm text-slate-400 space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-medium text-slate-300">Advanced search tips:</span>
                  <Badge variant="secondary" className="bg-slate-700 text-slate-300 hover:bg-slate-600">
                    "exact phrase"
                  </Badge>
                  <Badge variant="secondary" className="bg-slate-700 text-slate-300 hover:bg-slate-600">
                    "nearby words"~5
                  </Badge>
                  <Badge variant="secondary" className="bg-slate-700 text-slate-300 hover:bg-slate-600">
                    title:merger
                  </Badge>
                  <Badge variant="secondary" className="bg-slate-700 text-slate-300 hover:bg-slate-600">
                    attorney OR lawyer
                  </Badge>
                  <Badge variant="secondary" className="bg-slate-700 text-slate-300 hover:bg-slate-600">
                    contract* (wildcard)
                  </Badge>
                </div>
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-700 rounded-lg border border-slate-600">
                  <Select value={searchType} onValueChange={setSearchType}>
                    <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
                      <SelectValue placeholder="Search Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600 text-white">
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="document">Documents</SelectItem>
                      <SelectItem value="matter">Matters</SelectItem>
                      <SelectItem value="client">Clients</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600 text-white">
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
                      <SelectValue placeholder="Date Range" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600 text-white">
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={confidentialFilter} onValueChange={setConfidentialFilter}>
                    <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
                      <SelectValue placeholder="Confidentiality" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600 text-white">
                      <SelectItem value="all">All Documents</SelectItem>
                      <SelectItem value="true">Confidential Only</SelectItem>
                      <SelectItem value="false">Non-Confidential</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Results Section */}
        {searchQuery && (
          <div className="space-y-6">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Search Results</h2>
                <p className="text-slate-300">
                  {loading ? 'Searching...' : `${counts.total} results found`}
                </p>
              </div>
            </div>

            {loading ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-slate-300 text-lg">Searching...</p>
                  </div>
                </CardContent>
              </Card>
            ) : results.length > 0 ? (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-slate-800 border border-slate-700">
                  <TabsTrigger value="all" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
                    All ({counts.total})
                  </TabsTrigger>
                  <TabsTrigger value="document" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
                    Documents ({counts.documents})
                  </TabsTrigger>
                  <TabsTrigger value="matter" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
                    Matters ({counts.matters})
                  </TabsTrigger>
                  <TabsTrigger value="client" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
                    Clients ({counts.clients})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4 mt-6">
                  {filteredResults.map((result) => (
                    <SearchResultItem key={`${result.type}-${result.id}`} result={result} onDownload={downloadDocument} onViewDocument={viewDocument} />
                  ))}
                </TabsContent>

                <TabsContent value="document" className="space-y-4 mt-6">
                  {filteredResults.map((result) => (
                    <SearchResultItem key={`${result.type}-${result.id}`} result={result} onDownload={downloadDocument} onViewDocument={viewDocument} />
                  ))}
                </TabsContent>

                <TabsContent value="matter" className="space-y-4 mt-6">
                  {filteredResults.map((result) => (
                    <SearchResultItem key={`${result.type}-${result.id}`} result={result} onDownload={downloadDocument} onViewDocument={viewDocument} />
                  ))}
                </TabsContent>

                <TabsContent value="client" className="space-y-4 mt-6">
                  {filteredResults.map((result) => (
                    <SearchResultItem key={`${result.type}-${result.id}`} result={result} onDownload={downloadDocument} onViewDocument={viewDocument} />
                  ))}
                </TabsContent>
              </Tabs>
            ) : (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="text-center py-16">
                  <Search className="h-16 w-16 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">No results found</h3>
                  <p className="text-slate-400">
                    Try adjusting your search terms or filters. Use quotes for exact phrases or wildcards (*) for broader matches.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {!searchQuery && (
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="text-center py-20">
              <Search className="h-16 w-16 text-orange-400 mx-auto mb-6" />
              <h3 className="text-2xl font-medium text-white mb-3">Start searching</h3>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                Enter a search term above to find documents, matters, and clients across your firm. 
                Use advanced search features for precise results.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Document Viewer Modal */}
        {viewingDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden border border-slate-700">
              <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-700">
                <h2 className="text-lg font-semibold text-white">
                  Document Viewer - {viewingDocument.title}
                </h2>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={closeDocumentViewer}
                  className="bg-slate-600 border-slate-500 text-white hover:bg-slate-500"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-4">
                <DocumentViewer
                  documentId={viewingDocument.id}
                  documentName={viewingDocument.title}
                  mimeType={viewingDocument.metadata.mime_type || 'application/octet-stream'}
                  onClose={closeDocumentViewer}
                  className="max-h-[70vh]"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface SearchResultItemProps {
  result: AnySearchResult;
  onDownload: (docId: string, filename: string) => void;
  onViewDocument: (document: DocumentResult) => void;
}

const SearchResultItem = ({ result, onDownload, onViewDocument }: SearchResultItemProps) => {
  const getIcon = () => {
    switch (result.type) {
      case 'document':
        return <FileText className="h-5 w-5 text-blue-400" />;
      case 'matter':
        return <Folder className="h-5 w-5 text-green-400" />;
      case 'client':
        return <Building className="h-5 w-5 text-purple-400" />;
      default:
        return <FileText className="h-5 w-5 text-slate-400" />;
    }
  };

  const getLink = () => {
    switch (result.type) {
      case 'document':
        return `/documents/${result.id}`;
      case 'matter':
        return `/matters/${result.id}`;
      case 'client':
        return `/clients/${result.id}`;
      default:
        return '#';
    }
  };

  const renderMetadata = () => {
    switch (result.type) {
      case 'document':
        const docResult = result as DocumentResult;
        return (
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center bg-slate-700 px-2 py-1 rounded">
              {getFileTypeIcon(docResult.metadata.mime_type || '')}
              <span className="ml-1">{formatFileSize(docResult.metadata.file_size || 0)}</span>
            </span>
            {result.totalPages && (
              <span className="flex items-center bg-blue-900 px-2 py-1 rounded">
                <FileText className="h-3 w-3 mr-1" />
                <span>
                  {result.estimatedPage ? `Page ~${result.estimatedPage} of ${result.totalPages}` : `${result.totalPages} pages`}
                </span>
              </span>
            )}
            {docResult.metadata.matter?.title && (
              <span className="flex items-center">
                <Folder className="h-3 w-3 mr-1" />
                {docResult.metadata.matter.title} ({docResult.metadata.matter.matter_number || 'N/A'})
              </span>
            )}
            {docResult.metadata.client?.name && (
              <span className="flex items-center">
                <Building className="h-3 w-3 mr-1" />
                {docResult.metadata.client.name}
              </span>
            )}
            {(result.created_by || docResult.metadata.created_by) && (
              <span className="flex items-center">
                <span>by {result.created_by || docResult.metadata.created_by}</span>
              </span>
            )}
            <span className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(result.created_at || result.metadata?.created_at || new Date()).toLocaleDateString()}
            </span>
            {docResult.metadata.is_confidential && (
              <Badge variant="destructive" className="text-xs bg-red-600 text-white">Confidential</Badge>
            )}
            {docResult.metadata.legal_hold_active && (
              <Badge variant="destructive" className="text-xs bg-yellow-600 text-white flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                Legal Hold
              </Badge>
            )}
          </div>
        );

      case 'matter':
        const matterResult = result as MatterResult;
        return (
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            {matterResult.metadata?.client?.name && (
              <span className="flex items-center">
                <Building className="h-3 w-3 mr-1" />
                {matterResult.metadata.client.name}
              </span>
            )}
            {matterResult.metadata?.status && (
              <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                {matterResult.metadata.status}
              </Badge>
            )}
            {matterResult.metadata?.assigned_lawyer && (
              <span>Assigned: {matterResult.metadata.assigned_lawyer}</span>
            )}
            {matterResult.metadata?.document_count !== undefined && (
              <span>{matterResult.metadata.document_count} documents</span>
            )}
            <span className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(result.created_at || result.metadata?.created_at || new Date()).toLocaleDateString()}
            </span>
          </div>
        );

      case 'client':
        const clientResult = result as ClientResult;
        return (
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            {clientResult.metadata?.email && (
              <span>{clientResult.metadata.email}</span>
            )}
            {clientResult.metadata?.client_type && (
              <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                {clientResult.metadata.client_type.replace('_', ' ')}
              </Badge>
            )}
            {clientResult.metadata?.contact_person && (
              <span>Contact: {clientResult.metadata.contact_person}</span>
            )}
            {clientResult.metadata?.matter_count !== undefined && (
              <span>{clientResult.metadata.matter_count} matters</span>
            )}
            {clientResult.metadata?.document_count !== undefined && (
              <span>{clientResult.metadata.document_count} documents</span>
            )}
            <span className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(result.created_at || result.metadata?.created_at || new Date()).toLocaleDateString()}
            </span>
          </div>
        );
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700 hover:border-slate-600 hover:bg-slate-750 transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 mt-1 p-2 bg-slate-700 rounded-lg">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <Link 
                  to={getLink()} 
                  className="text-lg font-medium text-white hover:text-orange-400 transition-colors line-clamp-2 block"
                >
                  {result.title}
                </Link>
                <div className="flex items-center mt-1 space-x-2">
                  <Badge 
                    variant="outline" 
                    className="text-xs border-orange-500 text-orange-400 bg-orange-500/10"
                  >
                    {result.type}
                  </Badge>
                  <span className="text-xs text-slate-400">Score: {Math.round(result.score * 100)}%</span>
                </div>
              </div>
            </div>
            
            <div 
              className="text-sm text-slate-300 mb-4 line-clamp-3 leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: result.snippet.replace(
                  /<mark>/g, 
                  '<mark class="bg-yellow-400 text-gray-900 px-1 py-0.5 rounded font-medium">'
                )
              }}
            />
            
            {renderMetadata()}
          </div>
          
          {result.type === 'document' && (
            <div className="flex items-center space-x-2 ml-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const docResult = result as DocumentResult;
                  onViewDocument(docResult);
                }}
                className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover:text-white"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const docResult = result as DocumentResult;
                  onDownload(result.id, docResult.metadata.filename || 'document');
                }}
                className="bg-orange-600 border-orange-500 text-white hover:bg-orange-700"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const formatFileSize = (bytes: number) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileTypeIcon = (mimeType: string) => {
  if (mimeType?.includes('pdf')) return '📄';
  if (mimeType?.includes('word') || mimeType?.includes('document')) return '📝';
  if (mimeType?.includes('excel') || mimeType?.includes('spreadsheet')) return '📊';
  if (mimeType?.includes('powerpoint') || mimeType?.includes('presentation')) return '📋';
  if (mimeType?.includes('image')) return '🖼️';
  if (mimeType?.includes('text')) return '📃';
  return '📄';
};
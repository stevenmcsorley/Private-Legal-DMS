import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter,
  FileText,
  Archive,
  Building,
  Eye,
  Download,
  AlertCircle,
  Clock
} from 'lucide-react';
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
  created_at: string;
  updated_at: string;
}

interface DocumentResult extends SearchResult {
  type: 'document';
  metadata: {
    filename: string;
    file_size: number;
    mime_type: string;
    matter: {
      title: string;
      matter_number: string;
    };
    client: {
      name: string;
    };
    uploaded_by: string;
    is_confidential: boolean;
    legal_hold_active: boolean;
  };
}

interface MatterResult extends SearchResult {
  type: 'matter';
  metadata: {
    matter_number: string;
    matter_type: string;
    status: string;
    priority: string;
    client: {
      name: string;
    };
    assigned_lawyer?: string;
    document_count: number;
  };
}

interface ClientResult extends SearchResult {
  type: 'client';
  metadata: {
    email: string;
    client_type: string;
    status: string;
    contact_person?: string;
    matter_count: number;
    document_count: number;
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

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch();
    }, 300);

    return () => clearTimeout(timer);
  }, [performSearch]);

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Search</h1>
          <p className="text-gray-600">Search across documents, matters, and clients</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-4 w-4 mr-2" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </div>

      {/* Search Form */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search documents, matters, clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 text-lg py-6"
              />
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <Select value={searchType} onValueChange={setSearchType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Search Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="document">Documents</SelectItem>
                    <SelectItem value="matter">Matters</SelectItem>
                    <SelectItem value="client">Clients</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="date_desc">Newest First</SelectItem>
                    <SelectItem value="date_asc">Oldest First</SelectItem>
                    <SelectItem value="title">Title A-Z</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={confidentialFilter} onValueChange={setConfidentialFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Confidentiality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Items</SelectItem>
                    <SelectItem value="true">Confidential Only</SelectItem>
                    <SelectItem value="false">Non-Confidential Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchQuery && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                Search Results
                {counts.total > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {counts.total} results
                  </Badge>
                )}
              </span>
              {loading && (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              )}
            </CardTitle>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Searching...</p>
              </div>
            ) : results.length === 0 && searchQuery ? (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600">
                  Try adjusting your search terms or filters to find what you're looking for.
                </p>
              </div>
            ) : results.length > 0 ? (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">All ({counts.total})</TabsTrigger>
                  <TabsTrigger value="document">Documents ({counts.documents})</TabsTrigger>
                  <TabsTrigger value="matter">Matters ({counts.matters})</TabsTrigger>
                  <TabsTrigger value="client">Clients ({counts.clients})</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4 mt-6">
                  {filteredResults.map((result) => (
                    <SearchResultItem key={`${result.type}-${result.id}`} result={result} onDownload={downloadDocument} />
                  ))}
                </TabsContent>

                <TabsContent value="document" className="space-y-4 mt-6">
                  {filteredResults.map((result) => (
                    <SearchResultItem key={`${result.type}-${result.id}`} result={result} onDownload={downloadDocument} />
                  ))}
                </TabsContent>

                <TabsContent value="matter" className="space-y-4 mt-6">
                  {filteredResults.map((result) => (
                    <SearchResultItem key={`${result.type}-${result.id}`} result={result} onDownload={downloadDocument} />
                  ))}
                </TabsContent>

                <TabsContent value="client" className="space-y-4 mt-6">
                  {filteredResults.map((result) => (
                    <SearchResultItem key={`${result.type}-${result.id}`} result={result} onDownload={downloadDocument} />
                  ))}
                </TabsContent>
              </Tabs>
            ) : null}
          </CardContent>
        </Card>
      )}

      {!searchQuery && (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Start searching</h3>
            <p className="text-gray-600">
              Enter a search term above to find documents, matters, and clients across your firm.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

interface SearchResultItemProps {
  result: AnySearchResult;
  onDownload: (docId: string, filename: string) => void;
}

const SearchResultItem = ({ result, onDownload }: SearchResultItemProps) => {
  const getIcon = () => {
    switch (result.type) {
      case 'document':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'matter':
        return <Archive className="h-5 w-5 text-green-500" />;
      case 'client':
        return <Building className="h-5 w-5 text-purple-500" />;
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
    }
  };

  const renderMetadata = () => {
    switch (result.type) {
      case 'document':
        const docResult = result as DocumentResult;
        return (
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center">
              {getFileTypeIcon(docResult.metadata.mime_type)}
              <span className="ml-1">{formatFileSize(docResult.metadata.file_size)}</span>
            </span>
            <span>{docResult.metadata.matter.title} ({docResult.metadata.matter.matter_number})</span>
            <span>{docResult.metadata.client.name}</span>
            <span>by {docResult.metadata.uploaded_by}</span>
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {new Date(result.created_at).toLocaleDateString()}
            </span>
            {docResult.metadata.is_confidential && (
              <Badge variant="destructive" className="text-xs">Confidential</Badge>
            )}
            {docResult.metadata.legal_hold_active && (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
        );

      case 'matter':
        const matterResult = result as MatterResult;
        return (
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
            <Badge variant="outline">{matterResult.metadata.matter_number}</Badge>
            <span>{matterResult.metadata.matter_type.replace('_', ' ')}</span>
            <span>{matterResult.metadata.client.name}</span>
            {matterResult.metadata.assigned_lawyer && (
              <span>Assigned: {matterResult.metadata.assigned_lawyer}</span>
            )}
            <span>{matterResult.metadata.document_count} documents</span>
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {new Date(result.created_at).toLocaleDateString()}
            </span>
          </div>
        );

      case 'client':
        const clientResult = result as ClientResult;
        return (
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
            <span>{clientResult.metadata.email}</span>
            <span>{clientResult.metadata.client_type.replace('_', ' ')}</span>
            {clientResult.metadata.contact_person && (
              <span>Contact: {clientResult.metadata.contact_person}</span>
            )}
            <span>{clientResult.metadata.matter_count} matters</span>
            <span>{clientResult.metadata.document_count} documents</span>
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {new Date(result.created_at).toLocaleDateString()}
            </span>
          </div>
        );
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 mt-1">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <Link 
                to={getLink()} 
                className="text-lg font-medium text-gray-900 hover:text-blue-600 transition-colors truncate"
              >
                {result.title}
              </Link>
              <Badge variant="outline" className="ml-2 text-xs">
                {result.type}
              </Badge>
            </div>
            
            <p className="text-sm text-gray-700 mb-3 line-clamp-2">
              {result.snippet}
            </p>
            
            {renderMetadata()}
          </div>
          
          {result.type === 'document' && (
            <div className="flex items-center space-x-2 ml-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(`/documents/${result.id}/view`, '_blank')}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  const docResult = result as DocumentResult;
                  onDownload(result.id, docResult.metadata.filename);
                }}
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
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileTypeIcon = (mimeType: string) => {
  if (mimeType?.includes('pdf')) return '📄';
  if (mimeType?.includes('word')) return '📝';
  if (mimeType?.includes('excel') || mimeType?.includes('spreadsheet')) return '📊';
  if (mimeType?.includes('image')) return '🖼️';
  return '📄';
};
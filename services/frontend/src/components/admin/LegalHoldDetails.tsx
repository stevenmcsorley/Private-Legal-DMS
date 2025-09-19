import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Shield,
  FileText,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Settings,
} from 'lucide-react';

interface LegalHold {
  id: string;
  name: string;
  description: string;
  reason: string;
  type: 'litigation' | 'investigation' | 'audit' | 'regulatory' | 'other';
  status: 'active' | 'released' | 'expired';
  matter_id?: string;
  matter?: {
    id: string;
    title: string;
    matter_number: string;
    status: string;
  };
  firm_id: string;
  firm?: {
    id: string;
    name: string;
  };
  created_by: string;
  created_by_user?: {
    id: string;
    display_name: string;
    email: string;
  };
  released_by?: string;
  released_at?: string;
  release_reason?: string;
  expiry_date?: string;
  auto_apply_to_new_documents: boolean;
  custodian_instructions?: string;
  notification_settings?: {
    email_custodians?: boolean;
    email_legal_team?: boolean;
    reminder_frequency?: 'weekly' | 'monthly' | 'quarterly';
    escalation_days?: number;
  };
  search_criteria?: {
    keywords?: string[];
    date_range?: {
      start?: string;
      end?: string;
    };
    document_types?: string[];
    custodians?: string[];
    matters?: string[];
  };
  documents_count: number;
  custodians_count: number;
  last_notification_sent?: string;
  created_at: string;
  updated_at: string;
}

interface HoldDocument {
  id: string;
  title: string;
  file_path: string;
  file_size: number;
  file_type: string;
  created_at: string;
  updated_at: string;
  metadata?: any;
  matter?: {
    title: string;
    matter_number: string;
  };
}

interface HoldCustodian {
  id: string;
  name: string;
  email: string;
  department?: string;
  notified_at?: string;
  acknowledged_at?: string;
  status: 'notified' | 'acknowledged' | 'pending';
}

interface HoldAuditLog {
  id: string;
  action: string;
  details: string;
  user_name: string;
  timestamp: string;
}

export const LegalHoldDetails: React.FC = () => {
  const { holdId } = useParams<{ holdId: string }>();
  const navigate = useNavigate();
  
  const [hold, setHold] = useState<LegalHold | null>(null);
  const [documents, setDocuments] = useState<HoldDocument[]>([]);
  const [custodians, setCustodians] = useState<HoldCustodian[]>([]);
  const [auditLog, setAuditLog] = useState<HoldAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [documentSearch, setDocumentSearch] = useState('');

  useEffect(() => {
    if (holdId) {
      fetchHoldDetails();
    }
  }, [holdId]);

  const fetchHoldDetails = async () => {
    try {
      setLoading(true);

      // Fetch hold details
      const holdResponse = await fetch(`/api/legal-holds/${holdId}`, {
        credentials: 'include',
      });

      if (holdResponse.ok) {
        const holdData = await holdResponse.json();
        setHold(holdData);
      }

      // Fetch documents
      const docsResponse = await fetch(`/api/legal-holds/${holdId}/documents`, {
        credentials: 'include',
      });

      if (docsResponse.ok) {
        const docsData = await docsResponse.json();
        setDocuments(docsData.data || []);
      }

      // Fetch custodians
      const custodiansResponse = await fetch(`/api/legal-holds/${holdId}/custodians`, {
        credentials: 'include',
      });

      if (custodiansResponse.ok) {
        const custodiansData = await custodiansResponse.json();
        setCustodians(custodiansData.data || []);
      }

      // Fetch audit log
      const auditResponse = await fetch(`/api/legal-holds/${holdId}/audit`, {
        credentials: 'include',
      });

      if (auditResponse.ok) {
        const auditData = await auditResponse.json();
        setAuditLog(auditData.data || []);
      }
    } catch (error) {
      console.error('Error fetching hold details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToHolds = () => {
    navigate('/admin?tab=legal-holds');
  };

  const handleManageHold = () => {
    navigate(`/admin/legal-holds/${holdId}/manage`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'released': return 'bg-gray-500';
      case 'expired': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Shield className="h-3 w-3" />;
      case 'released': return <CheckCircle className="h-3 w-3" />;
      case 'expired': return <XCircle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'litigation': return 'text-red-400';
      case 'investigation': return 'text-orange-400';
      case 'audit': return 'text-blue-400';
      case 'regulatory': return 'text-purple-400';
      case 'other': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getCustodianStatusColor = (status: string) => {
    switch (status) {
      case 'acknowledged': return 'bg-green-500';
      case 'notified': return 'bg-yellow-500';
      case 'pending': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(documentSearch.toLowerCase()) ||
    doc.file_type.toLowerCase().includes(documentSearch.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-2 text-slate-400">Loading legal hold details...</p>
        </div>
      </div>
    );
  }

  if (!hold) {
    return (
      <div className="text-center py-12">
        <Shield className="h-12 w-12 text-slate-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-100 mb-2">Legal hold not found</h3>
        <Button onClick={handleBackToHolds}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Legal Holds
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleBackToHolds}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Legal Holds
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">{hold.name}</h1>
            <p className="text-slate-400">Legal Hold Details</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {hold.status === 'active' && (
            <Button onClick={handleManageHold}>
              <Settings className="h-4 w-4 mr-2" />
              Manage Hold
            </Button>
          )}
        </div>
      </div>

      {/* Hold Overview */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <h3 className="text-xl font-semibold">{hold.name}</h3>
                <Badge 
                  variant="outline" 
                  className={`${getStatusColor(hold.status)} text-white border-none`}
                >
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(hold.status)}
                    <span className="capitalize">{hold.status}</span>
                  </div>
                </Badge>
                <span className={`text-sm font-medium ${getTypeColor(hold.type)}`}>
                  {hold.type.charAt(0).toUpperCase() + hold.type.slice(1)}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-slate-400">Documents</p>
                <p className="text-xl font-bold text-slate-100">{hold.documents_count}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Users className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-slate-400">Custodians</p>
                <p className="text-xl font-bold text-slate-100">{hold.custodians_count}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-slate-400">Created</p>
                <p className="text-sm font-medium text-slate-100">
                  {new Date(hold.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            {hold.expiry_date && (
              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-slate-400">Expires</p>
                  <p className="text-sm font-medium text-slate-100">
                    {new Date(hold.expiry_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-slate-100 mb-2">Description</h4>
              <p className="text-slate-400">{hold.description}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-slate-100 mb-2">Reason</h4>
              <p className="text-slate-400">{hold.reason}</p>
            </div>
            
            {hold.custodian_instructions && (
              <div>
                <h4 className="font-medium text-slate-100 mb-2">Custodian Instructions</h4>
                <p className="text-slate-400">{hold.custodian_instructions}</p>
              </div>
            )}
          </div>

          {hold.matter && (
            <div className="mt-6 pt-6 border-t border-slate-700">
              <h4 className="font-medium text-slate-100 mb-2">Associated Matter</h4>
              <p className="text-slate-400">
                {hold.matter.title} ({hold.matter.matter_number})
              </p>
            </div>
          )}

          {hold.released_at && (
            <div className="mt-6 pt-6 border-t border-slate-700 bg-orange-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-orange-400 mb-2 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Release Information
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-slate-400">Released:</span>
                  <span className="ml-2 text-slate-100">{new Date(hold.released_at).toLocaleDateString()}</span>
                </div>
                {hold.release_reason && (
                  <div>
                    <span className="text-slate-400">Reason:</span>
                    <span className="ml-2 text-slate-100">{hold.release_reason}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="documents" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
          <TabsTrigger value="custodians">Custodians ({custodians.length})</TabsTrigger>
          <TabsTrigger value="criteria">Search Criteria</TabsTrigger>
          <TabsTrigger value="audit">Audit Log ({auditLog.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Documents on Hold</h3>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={documentSearch}
                    onChange={(e) => setDocumentSearch(e.target.value)}
                    className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                {filteredDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="font-medium text-slate-100">{doc.title}</p>
                          <div className="flex items-center space-x-4 text-sm text-slate-400">
                            <span>{doc.file_type.toUpperCase()}</span>
                            <span>{formatFileSize(doc.file_size)}</span>
                            <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                            {doc.matter && (
                              <span>Matter: {doc.matter.matter_number}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                {filteredDocuments.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                    <p className="text-slate-400">
                      {documentSearch ? 'No documents match your search.' : 'No documents found for this hold.'}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custodians" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Custodians</h3>
              
              <div className="space-y-3">
                {custodians.map((custodian) => (
                  <div key={custodian.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Users className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="font-medium text-slate-100">{custodian.name}</p>
                        <div className="flex items-center space-x-4 text-sm text-slate-400">
                          <span>{custodian.email}</span>
                          {custodian.department && <span>{custodian.department}</span>}
                          {custodian.notified_at && (
                            <span>Notified: {new Date(custodian.notified_at).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`${getCustodianStatusColor(custodian.status)} text-white border-none`}
                    >
                      {custodian.status.charAt(0).toUpperCase() + custodian.status.slice(1)}
                    </Badge>
                  </div>
                ))}
                
                {custodians.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                    <p className="text-slate-400">No custodians assigned to this hold.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="criteria" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Search Criteria</h3>
              
              {hold.search_criteria ? (
                <div className="space-y-4">
                  {hold.search_criteria.keywords && hold.search_criteria.keywords.length > 0 && (
                    <div>
                      <h4 className="font-medium text-slate-200 mb-2">Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {hold.search_criteria.keywords.map((keyword, index) => (
                          <Badge key={index} variant="outline" className="bg-blue-900/30 text-blue-300 border-blue-600">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {hold.search_criteria.document_types && hold.search_criteria.document_types.length > 0 && (
                    <div>
                      <h4 className="font-medium text-slate-200 mb-2">Document Types</h4>
                      <div className="flex flex-wrap gap-2">
                        {hold.search_criteria.document_types.map((type, index) => (
                          <Badge key={index} variant="outline" className="bg-green-900/30 text-green-300 border-green-600">
                            {type}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {hold.search_criteria.date_range && (hold.search_criteria.date_range.start || hold.search_criteria.date_range.end) && (
                    <div>
                      <h4 className="font-medium text-slate-200 mb-2">Date Range</h4>
                      <p className="text-slate-400">
                        {hold.search_criteria.date_range.start ? 
                          new Date(hold.search_criteria.date_range.start).toLocaleDateString() : 'No start date'
                        } - {hold.search_criteria.date_range.end ? 
                          new Date(hold.search_criteria.date_range.end).toLocaleDateString() : 'No end date'
                        }
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-medium text-slate-200 mb-2">Settings</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={hold.auto_apply_to_new_documents}
                          disabled
                          className="rounded"
                        />
                        <span className="text-slate-400">Auto-apply to new documents</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Settings className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-slate-400">No search criteria defined for this hold.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Audit Log</h3>
              
              <div className="space-y-3">
                {auditLog.map((log) => (
                  <div key={log.id} className="flex items-start space-x-3 p-3 bg-slate-800 rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-100">{log.action}</p>
                      <p className="text-sm text-slate-400">{log.details}</p>
                      <div className="flex items-center space-x-4 text-xs text-slate-500 mt-1">
                        <span>{log.user_name}</span>
                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {auditLog.length === 0 && (
                  <div className="text-center py-8">
                    <Clock className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                    <p className="text-slate-400">No audit log entries found.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
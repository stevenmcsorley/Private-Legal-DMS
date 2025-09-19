import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Plus, 
  Filter,
  Shield,
  Trash2,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Users,
  Calendar,
  Loader2,
  Eye,
  Ban,
  Settings,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

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

interface LegalHoldStats {
  total_holds: number;
  active_holds: number;
  released_holds: number;
  expired_holds: number;
  total_documents_on_hold: number;
  holds_by_type: Record<string, number>;
}


export const LegalHoldManagement = () => {
  const navigate = useNavigate();
  const [holds, setHolds] = useState<LegalHold[]>([]);
  const [stats, setStats] = useState<LegalHoldStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showReleaseDialog, setShowReleaseDialog] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const [viewingHold] = useState<LegalHold | null>(null);
  const [releasingHold, setReleasingHold] = useState<LegalHold | null>(null);
  const [releaseReason, setReleaseReason] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    fetchHolds();
    fetchStats();
  }, [currentPage, searchTerm, statusFilter, typeFilter]);

  const fetchHolds = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
      });

      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);

      const response = await fetch(`/api/legal-holds?${params}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setHolds(data.data || []);
        setTotalPages(data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching legal holds:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/legal-holds/statistics', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching legal hold statistics:', error);
    }
  };


  const releaseHold = async () => {
    if (!releasingHold || !releaseReason) {
      alert('Please provide a reason for releasing the hold');
      return;
    }

    setIsReleasing(true);
    
    try {
      const response = await fetch(`/api/legal-holds/${releasingHold.id}/release`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ reason: releaseReason }),
      });

      if (response.ok) {
        await fetchHolds();
        await fetchStats();
        setShowReleaseDialog(false);
        setReleasingHold(null);
        setReleaseReason('');
        alert('Legal hold released successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to release legal hold: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error releasing legal hold:', error);
      alert('Failed to release legal hold. Please try again.');
    } finally {
      setIsReleasing(false);
    }
  };

  const deleteHold = async (holdId: string) => {
    if (!confirm('Are you sure you want to delete this legal hold? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/legal-holds/${holdId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        await fetchHolds();
        await fetchStats();
        alert('Legal hold deleted successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to delete legal hold: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting legal hold:', error);
      alert('Failed to delete legal hold. Please try again.');
    }
  };


  const viewHoldDetails = (holdId: string) => {
    navigate(`/admin/legal-holds/${holdId}`);
  };

  const manageHold = (holdId: string) => {
    navigate(`/admin/legal-holds/${holdId}/manage`);
  };

  const createNewHold = () => {
    navigate('/admin/legal-holds/create');
  };


  const openReleaseDialog = (hold: LegalHold) => {
    setReleasingHold(hold);
    setShowReleaseDialog(true);
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

  const filteredHolds = holds;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-2 text-slate-400">Loading legal holds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center space-x-2">
            <Shield className="h-5 w-5 text-red-500" />
            <span>Legal Hold Management</span>
          </h2>
          <p className="text-slate-400">Manage legal holds and document preservation</p>
        </div>
        
        <Button onClick={createNewHold}>
          <Plus className="h-4 w-4 mr-2" />
          Create Legal Hold
        </Button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Shield className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-300">Total Holds</p>
                  <p className="text-2xl font-bold text-slate-100">{stats.total_holds}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-green-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-300">Active</p>
                  <p className="text-2xl font-bold text-green-400">{stats.active_holds}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-gray-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-300">Released</p>
                  <p className="text-2xl font-bold text-slate-100">{stats.released_holds}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <XCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-300">Expired</p>
                  <p className="text-2xl font-bold text-red-400">{stats.expired_holds}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-slate-300">Documents on Hold</p>
                  <p className="text-2xl font-bold text-blue-400">{stats.total_documents_on_hold}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search legal holds..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="released">Released</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="litigation">Litigation</SelectItem>
                <SelectItem value="investigation">Investigation</SelectItem>
                <SelectItem value="audit">Audit</SelectItem>
                <SelectItem value="regulatory">Regulatory</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center text-sm text-slate-400">
        <Filter className="h-4 w-4 mr-2" />
        Showing {filteredHolds.length} legal holds
      </div>

      {/* Legal Holds Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredHolds.map((hold) => (
          <Card key={hold.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-lg">{hold.name}</h3>
                    <Badge 
                      variant="outline" 
                      className={`${getStatusColor(hold.status)} text-white border-none`}
                    >
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(hold.status)}
                        <span className="capitalize">{hold.status}</span>
                      </div>
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`text-sm font-medium ${getTypeColor(hold.type)}`}>
                      {hold.type.charAt(0).toUpperCase() + hold.type.slice(1)}
                    </span>
                    {hold.matter && (
                      <span className="text-sm text-slate-400">
                        • {hold.matter.title}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                    {hold.description}
                  </p>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => viewHoldDetails(hold.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  {hold.status === 'active' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => manageHold(hold.id)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openReleaseDialog(hold)}
                        className="text-orange-600 hover:text-orange-700"
                      >
                        <Ban className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  
                  {hold.status !== 'active' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteHold(hold.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-1">
                  <FileText className="h-3 w-3 text-slate-400" />
                  <span className="text-slate-400">Documents:</span>
                  <span className="font-medium">{hold.documents_count}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3 text-slate-400" />
                  <span className="text-slate-400">Custodians:</span>
                  <span className="font-medium">{hold.custodians_count}</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3 text-slate-400" />
                  <span className="text-slate-400">Created:</span>
                  <span className="font-medium">{new Date(hold.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {hold.created_by_user && (
                <div className="mt-3 pt-3 border-t border-slate-700">
                  <div className="flex items-center text-xs text-slate-400">
                    <span>Created by: {hold.created_by_user.display_name}</span>
                    {hold.released_by && hold.released_at && (
                      <span className="ml-4">
                        Released: {new Date(hold.released_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredHolds.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-100 mb-2">No legal holds found</h3>
            <p className="text-slate-400">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your search filters to see more results.'
                : 'No legal holds have been created yet.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          <span className="text-sm text-slate-400">
            Page {currentPage} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* View Hold Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Legal Hold Details</DialogTitle>
          </DialogHeader>
          
          {viewingHold && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{viewingHold.name}</h3>
                <Badge 
                  variant="outline" 
                  className={`${getStatusColor(viewingHold.status)} text-white border-none`}
                >
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(viewingHold.status)}
                    <span className="capitalize">{viewingHold.status}</span>
                  </div>
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Type:</span>
                  <span className="ml-2 font-medium capitalize">{viewingHold.type}</span>
                </div>
                <div>
                  <span className="text-slate-400">Documents:</span>
                  <span className="ml-2 font-medium">{viewingHold.documents_count}</span>
                </div>
                <div>
                  <span className="text-slate-400">Custodians:</span>
                  <span className="ml-2 font-medium">{viewingHold.custodians_count}</span>
                </div>
                <div>
                  <span className="text-slate-400">Created:</span>
                  <span className="ml-2 font-medium">{new Date(viewingHold.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Description</h4>
                <p className="text-sm text-slate-400">{viewingHold.description}</p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Reason</h4>
                <p className="text-sm text-slate-400">{viewingHold.reason}</p>
              </div>

              {viewingHold.custodian_instructions && (
                <div>
                  <h4 className="font-medium mb-2">Custodian Instructions</h4>
                  <p className="text-sm text-slate-400">{viewingHold.custodian_instructions}</p>
                </div>
              )}

              {viewingHold.matter && (
                <div>
                  <h4 className="font-medium mb-2">Associated Matter</h4>
                  <p className="text-sm text-slate-400">
                    {viewingHold.matter.title} ({viewingHold.matter.matter_number})
                  </p>
                </div>
              )}

              {viewingHold.search_criteria && (
                <div>
                  <h4 className="font-medium mb-2">Search Criteria</h4>
                  <div className="space-y-2 text-sm">
                    {viewingHold.search_criteria.keywords && viewingHold.search_criteria.keywords.length > 0 && (
                      <div>
                        <span className="text-slate-400">Keywords:</span>
                        <span className="ml-2">{viewingHold.search_criteria.keywords.join(', ')}</span>
                      </div>
                    )}
                    {viewingHold.search_criteria.document_types && viewingHold.search_criteria.document_types.length > 0 && (
                      <div>
                        <span className="text-slate-400">Document Types:</span>
                        <span className="ml-2">{viewingHold.search_criteria.document_types.join(', ')}</span>
                      </div>
                    )}
                    {viewingHold.search_criteria.date_range && (viewingHold.search_criteria.date_range.start || viewingHold.search_criteria.date_range.end) && (
                      <div>
                        <span className="text-slate-400">Date Range:</span>
                        <span className="ml-2">
                          {viewingHold.search_criteria.date_range.start || 'Start'} - {viewingHold.search_criteria.date_range.end || 'End'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {viewingHold.released_at && (
                <div className="bg-slate-800 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 text-orange-400">Release Information</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-slate-400">Released:</span>
                      <span className="ml-2">{new Date(viewingHold.released_at).toLocaleDateString()}</span>
                    </div>
                    {viewingHold.release_reason && (
                      <div>
                        <span className="text-slate-400">Reason:</span>
                        <span className="ml-2">{viewingHold.release_reason}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setShowViewDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Release Hold Dialog */}
      <Dialog open={showReleaseDialog} onOpenChange={setShowReleaseDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Release Legal Hold</DialogTitle>
          </DialogHeader>
          
          {releasingHold && (
            <div className="space-y-4">
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
                  <div>
                    <h4 className="font-medium text-orange-800">Release Legal Hold</h4>
                    <p className="text-sm text-orange-600">
                      You are about to release "{releasingHold.name}". This will remove the hold from all {releasingHold.documents_count} documents.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="release_reason">Reason for Release *</Label>
                <Textarea
                  id="release_reason"
                  placeholder="Provide a reason for releasing this legal hold..."
                  value={releaseReason}
                  onChange={(e) => setReleaseReason(e.target.value)}
                  rows={3}
                  required
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowReleaseDialog(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={releaseHold}
              disabled={isReleasing || !releaseReason}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isReleasing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Releasing...
                </>
              ) : (
                'Release Hold'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Filter,
  Download,
  Shield,
  User,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AuditLog {
  id: string;
  user_id: string;
  firm_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  timestamp: string;
  ip_address: string;
  user_agent: string;
  risk_level: 'low' | 'medium' | 'high';
  outcome: 'success' | 'failure';
  details: Record<string, any>;
  user?: {
    id: string;
    email: string;
    display_name: string;
  };
}

interface AuditLogsResponse {
  audit_logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
}

export const AuditLogs = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(50);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedResourceType, setSelectedResourceType] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedOutcome, setSelectedOutcome] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    fetchAuditLogs();
  }, [currentPage, selectedAction, selectedResourceType, selectedUserId, selectedOutcome, fromDate, toDate]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(selectedAction && { action: selectedAction }),
        ...(selectedResourceType && { resource_type: selectedResourceType }),
        ...(selectedUserId && { user_id: selectedUserId }),
        ...(fromDate && { from_date: fromDate }),
        ...(toDate && { to_date: toDate }),
      });

      const response = await fetch(`/api/admin/audit-logs?${params}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data: AuditLogsResponse = await response.json();
        setAuditLogs(data.audit_logs || []);
        setTotal(data.total || 0);
      } else {
        console.error('Failed to fetch audit logs');
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportAuditLogs = async (format: 'csv' | 'json') => {
    try {
      const params = new URLSearchParams({
        ...(selectedAction && { action: selectedAction }),
        ...(selectedResourceType && { resource_type: selectedResourceType }),
        ...(selectedUserId && { user_id: selectedUserId }),
        ...(fromDate && { from_date: fromDate }),
        ...(toDate && { to_date: toDate }),
        format,
      });

      const response = await fetch(`/api/admin/audit-logs/export?${params}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting audit logs:', error);
    }
  };

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return 'bg-red-500/20 text-red-300 border-red-500/50';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
      case 'low': return 'bg-green-500/20 text-green-300 border-green-500/50';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/50';
    }
  };

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failure': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('read') || action.includes('view')) return <Eye className="h-4 w-4" />;
    if (action.includes('create') || action.includes('upload')) return <FileText className="h-4 w-4" />;
    return <Shield className="h-4 w-4" />;
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const filteredLogs = auditLogs.filter(log => 
    !searchTerm || 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.resource_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user?.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(log => 
    !selectedOutcome || log.outcome === selectedOutcome
  );

  const totalPages = Math.ceil(total / limit);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-2 text-slate-400">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center">
            <Shield className="h-6 w-6 mr-2" />
            Audit Logs
          </h2>
          <p className="text-slate-400">Monitor all system activities and access patterns</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => exportAuditLogs('csv')}
            className="flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button 
            variant="outline" 
            onClick={() => exportAuditLogs('json')}
            className="flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <div className="lg:col-span-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Search actions, users, resources..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>Action</Label>
              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All actions</SelectItem>
                  <SelectItem value="auth_login">Login</SelectItem>
                  <SelectItem value="auth_logout">Logout</SelectItem>
                  <SelectItem value="admin_create">Create</SelectItem>
                  <SelectItem value="admin_update">Update</SelectItem>
                  <SelectItem value="admin_delete">Delete</SelectItem>
                  <SelectItem value="document_upload">Upload</SelectItem>
                  <SelectItem value="document_download">Download</SelectItem>
                  <SelectItem value="document_view">View</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Resource</Label>
              <Select value={selectedResourceType} onValueChange={setSelectedResourceType}>
                <SelectTrigger>
                  <SelectValue placeholder="All resources" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All resources</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                  <SelectItem value="matter">Matter</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Outcome</Label>
              <Select value={selectedOutcome} onValueChange={setSelectedOutcome}>
                <SelectTrigger>
                  <SelectValue placeholder="All outcomes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All outcomes</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failure">Failure</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="from-date">From Date</Label>
              <Input
                id="from-date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="to-date">To Date</Label>
              <Input
                id="to-date"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-slate-400">
              Showing {filteredLogs.length} of {total} audit entries
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedAction('');
                setSelectedResourceType('');
                setSelectedUserId('');
                setSelectedOutcome('');
                setFromDate('');
                setToDate('');
                setSearchTerm('');
              }}
              className="flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800 border-b border-slate-700">
                <tr>
                  <th className="text-left py-4 px-6 text-slate-300 font-medium">Timestamp</th>
                  <th className="text-left py-4 px-6 text-slate-300 font-medium">User</th>
                  <th className="text-left py-4 px-6 text-slate-300 font-medium">Action</th>
                  <th className="text-left py-4 px-6 text-slate-300 font-medium">Resource</th>
                  <th className="text-left py-4 px-6 text-slate-300 font-medium">Outcome</th>
                  <th className="text-left py-4 px-6 text-slate-300 font-medium">Risk</th>
                  <th className="text-left py-4 px-6 text-slate-300 font-medium">IP Address</th>
                  <th className="text-left py-4 px-6 text-slate-300 font-medium">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/50">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-300 text-sm">
                          {formatTimestamp(log.timestamp)}
                        </span>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <div>
                          <p className="text-slate-300 text-sm font-medium">
                            {log.user?.display_name || 'Unknown User'}
                          </p>
                          <p className="text-slate-500 text-xs">
                            {log.user?.email || log.user_id}
                          </p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        {getActionIcon(log.action)}
                        <span className="text-slate-300 text-sm font-medium">
                          {log.action.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-slate-300 text-sm font-medium">
                          {log.resource_type.toUpperCase()}
                        </p>
                        <p className="text-slate-500 text-xs">
                          {log.resource_id !== 'unknown' ? log.resource_id : 'N/A'}
                        </p>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        {getOutcomeIcon(log.outcome)}
                        <span className={`text-sm font-medium ${
                          log.outcome === 'success' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {log.outcome.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <Badge 
                        variant="outline" 
                        className={getRiskBadgeColor(log.risk_level)}
                      >
                        {log.risk_level.toUpperCase()}
                      </Badge>
                    </td>
                    
                    <td className="py-4 px-6">
                      <span className="text-slate-400 text-sm font-mono">
                        {log.ip_address}
                      </span>
                    </td>
                    
                    <td className="py-4 px-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-slate-300"
                        onClick={() => {
                          alert(`Details: ${JSON.stringify(log.details, null, 2)}`);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-400">
                Page {currentPage} of {totalPages} ({total} total entries)
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredLogs.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-100 mb-2">No audit logs found</h3>
            <p className="text-slate-400">
              {searchTerm || selectedAction || selectedResourceType || selectedOutcome || fromDate || toDate
                ? 'Try adjusting your filters to see more results.'
                : 'No audit entries have been recorded yet.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
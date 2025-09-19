import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Building, 
  Calendar, 
  Clock, 
  Users, 
  Shield, 
  Activity,
  FileText,
  Eye,
  Download,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Archive
} from 'lucide-react';

interface ShareDetails {
  id: string;
  matter: {
    id: string;
    title: string;
    matter_number: string;
    client: { name: string };
  };
  shared_with_firm_name: string;
  shared_by: { display_name: string };
  role: string;
  status: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  permissions: Record<string, any>;
  restrictions: Record<string, any>;
  invitation_message?: string;
  access_count: number;
  last_accessed?: string;
  documents: Array<{
    id: string;
    title: string;
    file_name: string;
    file_size: number;
    mime_type: string;
    uploaded_at: string;
  }>;
  access_log: Array<{
    accessed_at: string;
    user_email: string;
    action: string;
    document_id?: string;
    document_title?: string;
  }>;
}

export const ShareDetails = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const navigate = useNavigate();
  const [share, setShare] = useState<ShareDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchShareDetails();
  }, [shareId]);

  const fetchShareDetails = async () => {
    try {
      const response = await fetch(`/api/shares/${shareId}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setShare(data);
      } else {
        setError('Failed to load share details');
      }
    } catch (error) {
      console.error('Error fetching share details:', error);
      setError('Failed to load share details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: 'bg-green-600', label: 'Active', icon: CheckCircle },
      pending: { color: 'bg-yellow-600', label: 'Pending', icon: Clock },
      declined: { color: 'bg-red-600', label: 'Declined', icon: XCircle },
      revoked: { color: 'bg-gray-600', label: 'Revoked', icon: Archive },
      expired: { color: 'bg-orange-600', label: 'Expired', icon: AlertTriangle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} text-white`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      viewer: { color: 'bg-blue-600', label: 'Viewer' },
      editor: { color: 'bg-green-600', label: 'Editor' },
      collaborator: { color: 'bg-purple-600', label: 'Collaborator' },
      partner_lead: { color: 'bg-red-600', label: 'Partner Lead' },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.viewer;

    return (
      <Badge className={`${config.color} text-white`}>
        <Shield className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
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
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-2 text-slate-400">Loading share details...</p>
        </div>
      </div>
    );
  }

  if (error || !share) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Error Loading Share</h2>
        <p className="text-slate-400 mb-4">{error || 'Share not found'}</p>
        <Button 
          onClick={() => navigate('/admin?tab=shares')}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Shares
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/admin?tab=shares')}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shares
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Share Details</h1>
            <p className="text-slate-400">Detailed information about this cross-firm share</p>
          </div>
        </div>
        <Button 
          onClick={() => navigate(`/admin/shares/${shareId}/manage`)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Settings className="h-4 w-4 mr-2" />
          Manage Share
        </Button>
      </div>

      {/* Share Overview */}
      <Card className="bg-slate-700 border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span>Share Overview</span>
            <div className="flex items-center space-x-2">
              {getStatusBadge(share.status)}
              {getRoleBadge(share.role)}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-1">Matter</h3>
                <p className="text-white font-medium">{share.matter.title}</p>
                <p className="text-slate-400 text-sm">{share.matter.matter_number} • {share.matter.client.name}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-1">Shared With</h3>
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-2 text-slate-400" />
                  <span className="text-white">{share.shared_with_firm_name}</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-1">Shared By</h3>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-slate-400" />
                  <span className="text-white">{share.shared_by.display_name}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-1">Created</h3>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                  <span className="text-white">{new Date(share.created_at).toLocaleString()}</span>
                </div>
              </div>

              {share.expires_at && (
                <div>
                  <h3 className="text-sm font-medium text-slate-300 mb-1">Expires</h3>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-slate-400" />
                    <span className="text-white">{new Date(share.expires_at).toLocaleString()}</span>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-slate-300 mb-1">Access Statistics</h3>
                <div className="flex items-center">
                  <Activity className="h-4 w-4 mr-2 text-slate-400" />
                  <span className="text-white">{share.access_count} total accesses</span>
                </div>
                {share.last_accessed && (
                  <p className="text-slate-400 text-sm mt-1">
                    Last accessed: {new Date(share.last_accessed).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {share.invitation_message && (
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-2">Invitation Message</h3>
              <div className="bg-slate-600 p-3 rounded-lg">
                <p className="text-white">{share.invitation_message}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documents */}
      <Card className="bg-slate-700 border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Shared Documents ({share.documents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {share.documents.length > 0 ? (
            <div className="space-y-3">
              {share.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-600 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-white">{doc.title}</h4>
                    <p className="text-slate-400 text-sm">
                      {doc.file_name} • {formatFileSize(doc.file_size)} • {new Date(doc.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="secondary" className="bg-slate-500 hover:bg-slate-400">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="secondary" className="bg-slate-500 hover:bg-slate-400">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <FileText className="h-12 w-12 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-400">No documents in this share</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Access Log */}
      <Card className="bg-slate-700 border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Access Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          {share.access_log.length > 0 ? (
            <div className="space-y-3">
              {share.access_log.slice(0, 10).map((log, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-600 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{log.action}</p>
                    <p className="text-slate-400 text-sm">
                      {log.user_email} • {new Date(log.accessed_at).toLocaleString()}
                    </p>
                    {log.document_title && (
                      <p className="text-slate-400 text-sm">Document: {log.document_title}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Activity className="h-12 w-12 text-slate-500 mx-auto mb-3" />
              <p className="text-slate-400">No access activity recorded</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
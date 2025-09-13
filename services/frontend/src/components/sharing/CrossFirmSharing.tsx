import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Share2, 
  Plus, 
  Search,
  Building,
  User,
  Clock,
  AlertCircle,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Archive
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Link } from 'react-router-dom';

interface Share {
  id: string;
  matter_id: string;
  matter: {
    title: string;
    matter_number: string;
    client: {
      name: string;
    };
  };
  shared_with_firm: string;
  shared_with_firm_name: string;
  shared_by: {
    display_name: string;
  };
  role: 'viewer' | 'collaborator' | 'reviewer';
  permissions: string[];
  status: 'pending' | 'active' | 'expired' | 'revoked';
  expires_at?: string;
  created_at: string;
  updated_at: string;
  access_count: number;
  last_accessed?: string;
  message?: string;
}

interface IncomingShare {
  id: string;
  matter_id: string;
  matter_title: string;
  matter_number: string;
  client_name: string;
  shared_by_firm: string;
  shared_by_firm_name: string;
  shared_by_user: string;
  role: string;
  permissions: string[];
  status: string;
  expires_at?: string;
  created_at: string;
  message?: string;
}

export const CrossFirmSharing = () => {
  const [outgoingShares, setOutgoingShares] = useState<Share[]>([]);
  const [incomingShares, setIncomingShares] = useState<IncomingShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('outgoing');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  useEffect(() => {
    fetchShares();
  }, []);

  const fetchShares = async () => {
    try {
      const [outgoingResponse, incomingResponse] = await Promise.all([
        fetch('/api/shares/outgoing', { credentials: 'include' }),
        fetch('/api/shares/incoming', { credentials: 'include' })
      ]);

      if (outgoingResponse.ok) {
        const outgoingData = await outgoingResponse.json();
        setOutgoingShares(outgoingData);
      } else if (outgoingResponse.status === 404) {
        // API not implemented yet (Phase 2 feature)
        setOutgoingShares([]);
      }

      if (incomingResponse.ok) {
        const incomingData = await incomingResponse.json();
        setIncomingShares(incomingData);
      } else if (incomingResponse.status === 404) {
        // API not implemented yet (Phase 2 feature)
        setIncomingShares([]);
      }
    } catch (error) {
      console.error('Error fetching shares:', error);
      // Set empty arrays on error to avoid showing loading state indefinitely
      setOutgoingShares([]);
      setIncomingShares([]);
    } finally {
      setLoading(false);
    }
  };

  const revokeShare = async (shareId: string) => {
    try {
      const response = await fetch(`/api/shares/${shareId}/revoke`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        setOutgoingShares(outgoingShares.map(share => 
          share.id === shareId ? { ...share, status: 'revoked' as const } : share
        ));
      }
    } catch (error) {
      console.error('Error revoking share:', error);
    }
  };

  const acceptShare = async (shareId: string) => {
    try {
      const response = await fetch(`/api/shares/${shareId}/accept`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        setIncomingShares(incomingShares.map(share => 
          share.id === shareId ? { ...share, status: 'active' } : share
        ));
      }
    } catch (error) {
      console.error('Error accepting share:', error);
    }
  };

  const declineShare = async (shareId: string) => {
    try {
      const response = await fetch(`/api/shares/${shareId}/decline`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        setIncomingShares(incomingShares.filter(share => share.id !== shareId));
      }
    } catch (error) {
      console.error('Error declining share:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'revoked': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'expired':
      case 'revoked':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'collaborator': return 'bg-blue-100 text-blue-800';
      case 'reviewer': return 'bg-purple-100 text-purple-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isExpiring = (expiresAt?: string) => {
    if (!expiresAt) return false;
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const daysDiff = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 7 && daysDiff > 0;
  };

  const filteredOutgoingShares = outgoingShares.filter((share) => {
    const matchesSearch = 
      share.matter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      share.shared_with_firm_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      share.matter.client.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || share.status === statusFilter;
    const matchesRole = roleFilter === 'all' || share.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const filteredIncomingShares = incomingShares.filter((share) => {
    const matchesSearch = 
      share.matter_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      share.shared_by_firm_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      share.client_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || share.status === statusFilter;
    const matchesRole = roleFilter === 'all' || share.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading shares...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Share2 className="h-6 w-6 mr-3 text-blue-600" />
            Cross-Firm Sharing
          </h1>
          <p className="text-gray-600">Manage sharing with other law firms</p>
        </div>
        <Button asChild>
          <Link to="/sharing/new">
            <Plus className="h-4 w-4 mr-2" />
            New Share
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Share2 className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Active Outgoing</p>
                <p className="text-2xl font-bold text-gray-900">
                  {outgoingShares.filter(s => s.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building className="h-5 w-5 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Active Incoming</p>
                <p className="text-2xl font-bold text-gray-900">
                  {incomingShares.filter(s => s.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {incomingShares.filter(s => s.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-900">Expiring Soon</p>
                <p className="text-2xl font-bold text-gray-900">
                  {outgoingShares.filter(s => isExpiring(s.expires_at)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search shares..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="revoked">Revoked</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
                <SelectItem value="collaborator">Collaborator</SelectItem>
                <SelectItem value="reviewer">Reviewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="outgoing">
            Outgoing Shares ({outgoingShares.length})
          </TabsTrigger>
          <TabsTrigger value="incoming">
            Incoming Shares ({incomingShares.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="outgoing" className="space-y-4">
          <div className="space-y-3">
            {filteredOutgoingShares.map((share) => (
              <Card key={share.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        {getStatusIcon(share.status)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="text-lg font-medium text-gray-900 truncate">
                            {share.matter.title}
                          </h4>
                          <Badge className={getStatusColor(share.status)}>
                            {share.status}
                          </Badge>
                          <Badge className={getRoleColor(share.role)}>
                            {share.role}
                          </Badge>
                          {isExpiring(share.expires_at) && (
                            <Badge variant="destructive" className="text-xs">
                              Expiring Soon
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Building className="h-4 w-4 mr-1" />
                            Shared with {share.shared_with_firm_name}
                          </span>
                          <span className="flex items-center">
                            <Archive className="h-4 w-4 mr-1" />
                            {share.matter.matter_number}
                          </span>
                          <span className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {share.matter.client.name}
                          </span>
                          <span className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {share.access_count} views
                          </span>
                          {share.expires_at && (
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Expires {new Date(share.expires_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        {share.message && (
                          <p className="text-sm text-gray-600 mt-2 italic">
                            "{share.message}"
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/sharing/${share.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/sharing/${share.id}/edit`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      {share.status === 'active' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => revokeShare(share.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredOutgoingShares.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Share2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No outgoing shares</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || statusFilter !== 'all' || roleFilter !== 'all'
                    ? 'Try adjusting your filters to see more results.'
                    : 'Start collaborating by sharing a matter with another firm.'}
                </p>
                <Button asChild>
                  <Link to="/sharing/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Share
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="incoming" className="space-y-4">
          <div className="space-y-3">
            {filteredIncomingShares.map((share) => (
              <Card key={share.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        {getStatusIcon(share.status)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="text-lg font-medium text-gray-900 truncate">
                            {share.matter_title}
                          </h4>
                          <Badge className={getStatusColor(share.status)}>
                            {share.status}
                          </Badge>
                          <Badge className={getRoleColor(share.role)}>
                            {share.role}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Building className="h-4 w-4 mr-1" />
                            From {share.shared_by_firm_name}
                          </span>
                          <span className="flex items-center">
                            <Archive className="h-4 w-4 mr-1" />
                            {share.matter_number}
                          </span>
                          <span className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {share.client_name}
                          </span>
                          {share.expires_at && (
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              Expires {new Date(share.expires_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        {share.message && (
                          <p className="text-sm text-gray-600 mt-2 italic">
                            "{share.message}"
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {share.status === 'pending' ? (
                        <>
                          <Button 
                            size="sm"
                            onClick={() => acceptShare(share.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Accept
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => declineShare(share.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <AlertCircle className="h-4 w-4 mr-2" />
                            Decline
                          </Button>
                        </>
                      ) : (
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredIncomingShares.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No incoming shares</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'all' || roleFilter !== 'all'
                    ? 'Try adjusting your filters to see more results.'
                    : 'Matters shared with your firm will appear here.'}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Share2,
  Plus,
  Search,
  BarChart3,
  Users,
  Building,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Edit,
  Shield,
  Settings,
  TrendingUp,
  Globe,
  Archive,
} from 'lucide-react';

interface Share {
  id: string;
  matter?: {
    title: string;
    matter_number: string;
    client: { name: string };
  };
  shared_with_firm_name: string;
  shared_by?: { display_name: string };
  role: string;
  status: string;
  expires_at?: string;
  created_at: string;
  access_count: number;
  last_accessed?: string;
}

interface ShareAnalytics {
  period: string;
  start_date: string;
  end_date: string;
  outgoing: {
    total: number;
    pending: number;
    accepted: number;
    declined: number;
    revoked: number;
    expired: number;
  };
  incoming: {
    total: number;
    pending: number;
    accepted: number;
  };
  top_shared_matters: Array<{
    matter_id: string;
    matter_title: string;
    share_count: number;
  }>;
  top_partners: Array<{
    firm_id: string;
    firm_name: string;
    share_count: number;
  }>;
}


export const ShareManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('outgoing');
  const [outgoingShares, setOutgoingShares] = useState<Share[]>([]);
  const [incomingShares, setIncomingShares] = useState<Share[]>([]);
  const [analytics, setAnalytics] = useState<ShareAnalytics | null>(null);
  const [, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('month');
  

  useEffect(() => {
    fetchData();
  }, [timeRange]);


  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchOutgoingShares(),
        fetchIncomingShares(),
        fetchAnalytics(),
      ]);
    } catch (error) {
      console.error('Error fetching share data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOutgoingShares = async () => {
    try {
      const response = await fetch('/api/shares/outgoing', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setOutgoingShares(data);
      }
    } catch (error) {
      console.error('Error fetching outgoing shares:', error);
    }
  };

  const fetchIncomingShares = async () => {
    try {
      const response = await fetch('/api/shares/incoming', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setIncomingShares(data);
      }
    } catch (error) {
      console.error('Error fetching incoming shares:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/shares/analytics/dashboard?timeRange=${timeRange}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };


  const createNewShare = () => {
    navigate('/admin/shares/create');
  };

  const revokeShare = async (shareId: string) => {
    try {
      const response = await fetch(`/api/shares/${shareId}/revoke`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        fetchOutgoingShares();
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
        fetchIncomingShares();
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
        fetchIncomingShares();
      }
    } catch (error) {
      console.error('Error declining share:', error);
    }
  };

  const viewShareDetails = (shareId: string) => {
    navigate(`/admin/shares/${shareId}`);
  };

  const manageShare = (shareId: string) => {
    navigate(`/admin/shares/${shareId}/manage`);
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
      viewer: { color: 'bg-blue-600', icon: Eye },
      editor: { color: 'bg-purple-600', icon: Edit },
      collaborator: { color: 'bg-indigo-600', icon: Users },
      partner_lead: { color: 'bg-emerald-600', icon: Shield },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.viewer;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} text-white`}>
        <Icon className="h-3 w-3 mr-1" />
        {role.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const filterShares = (shares: Share[]) => {
    return shares.filter(share => {
      const matchesSearch = !searchTerm || 
        share.matter?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        share.shared_with_firm_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        share.matter?.client?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || share.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  };

  const renderAnalyticsDashboard = () => {
    if (!analytics) return <div className="text-slate-400">Loading analytics...</div>;

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-700 border-slate-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Outgoing</p>
                  <p className="text-2xl font-bold text-white">{analytics.outgoing.total}</p>
                </div>
                <Share2 className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-700 border-slate-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Total Incoming</p>
                  <p className="text-2xl font-bold text-white">{analytics.incoming.total}</p>
                </div>
                <Globe className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-700 border-slate-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Active Shares</p>
                  <p className="text-2xl font-bold text-white">{analytics.outgoing.accepted}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-emerald-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-700 border-slate-600">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Partners</p>
                  <p className="text-2xl font-bold text-white">{analytics.top_partners.length}</p>
                </div>
                <Building className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Shared Matters */}
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-400" />
                Most Shared Matters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.top_shared_matters.slice(0, 5).map((matter, index) => (
                  <div key={matter.matter_id} className="flex items-center justify-between p-3 bg-slate-600 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-white font-medium truncate max-w-48">{matter.matter_title}</p>
                      </div>
                    </div>
                    <Badge className="bg-blue-600 text-white">
                      {matter.share_count} shares
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Partners */}
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Building className="h-5 w-5 mr-2 text-orange-400" />
                Top Sharing Partners
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.top_partners.slice(0, 5).map((partner, index) => (
                  <div key={partner.firm_id} className="flex items-center justify-between p-3 bg-slate-600 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="bg-orange-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-white font-medium">{partner.firm_name}</p>
                      </div>
                    </div>
                    <Badge className="bg-orange-600 text-white">
                      {partner.share_count} shares
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderSharesList = (shares: Share[], type: 'outgoing' | 'incoming') => {
    const filteredShares = filterShares(shares);

    return (
      <div className="space-y-4">
        {filteredShares.map((share) => (
          <Card key={share.id} className="bg-slate-700 border-slate-600">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-white font-medium">{share.matter?.title || 'Unknown Matter'}</h3>
                      <p className="text-slate-400 text-sm">
                        {share.matter?.matter_number || 'N/A'} • {share.matter?.client?.name || 'Unknown Client'}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(share.status)}
                      {getRoleBadge(share.role)}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                    <div className="flex items-center space-x-1">
                      <Building className="h-4 w-4" />
                      <span>{type === 'outgoing' ? 'Shared with' : 'Shared by'}: {share.shared_with_firm_name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>By: {share.shared_by?.display_name || 'Unknown User'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Created: {new Date(share.created_at).toLocaleDateString()}</span>
                    </div>
                    {share.expires_at && (
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>Expires: {new Date(share.expires_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    {type === 'outgoing' && share.status === 'active' && (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => revokeShare(share.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Revoke
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => manageShare(share.id)}
                          className="bg-slate-600 hover:bg-slate-500"
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Manage
                        </Button>
                      </>
                    )}
                    {type === 'incoming' && share.status === 'pending' && (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => acceptShare(share.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => declineShare(share.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Decline
                        </Button>
                      </>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => viewShareDetails(share.id)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredShares.length === 0 && (
          <Card className="bg-slate-700 border-slate-600">
            <CardContent className="p-8 text-center">
              <Share2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No shares found</h3>
              <p className="text-slate-400">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your filters to see more results.'
                  : `No ${type} shares available.`
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-white">
              <Share2 className="h-6 w-6 mr-3 text-orange-400" />
              Cross-Firm Share Management
            </CardTitle>
            <div className="flex items-center space-x-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Past Week</SelectItem>
                  <SelectItem value="month">Past Month</SelectItem>
                  <SelectItem value="quarter">Past Quarter</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={createNewShare} className="bg-orange-600 hover:bg-orange-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Share
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-6">
          <TabsList className="bg-slate-800 border-slate-700">
            <TabsTrigger value="analytics" className="data-[state=active]:bg-slate-700">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="outgoing" className="data-[state=active]:bg-slate-700">
              <Share2 className="h-4 w-4 mr-2" />
              Outgoing Shares
            </TabsTrigger>
            <TabsTrigger value="incoming" className="data-[state=active]:bg-slate-700">
              <Globe className="h-4 w-4 mr-2" />
              Incoming Shares
            </TabsTrigger>
          </TabsList>

          {(activeTab === 'outgoing' || activeTab === 'incoming') && (
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search shares..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                  <SelectItem value="revoked">Revoked</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <TabsContent value="analytics" className="space-y-6">
          {renderAnalyticsDashboard()}
        </TabsContent>

        <TabsContent value="outgoing" className="space-y-6">
          {renderSharesList(outgoingShares, 'outgoing')}
        </TabsContent>

        <TabsContent value="incoming" className="space-y-6">
          {renderSharesList(incomingShares, 'incoming')}
        </TabsContent>
      </Tabs>
    </div>
  );
};
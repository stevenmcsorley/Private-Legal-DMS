import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building, 
  Users, 
  FileText, 
  Share2, 
  Activity,
  TrendingUp,
  Clock,
  Shield,
  Download,
  Eye,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
// Table component not available - will implement as needed
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CollaborationStats {
  total_outgoing_shares: number;
  total_incoming_shares: number;
  active_partnerships: number;
  documents_shared: number;
  total_downloads: number;
  average_response_time_hours: number;
}

interface RecentActivity {
  id: string;
  type: 'share_created' | 'share_accepted' | 'document_accessed' | 'share_expired';
  matter_title: string;
  matter_number: string;
  partner_firm: string;
  user_name: string;
  timestamp: string;
  details?: string;
}

interface PartnerFirm {
  id: string;
  name: string;
  total_shares: number;
  active_shares: number;
  last_activity: string;
  trust_level: 'high' | 'medium' | 'low';
  total_documents_shared: number;
}

interface ShareTrend {
  date: string;
  outgoing: number;
  incoming: number;
  downloads: number;
}

export const CollaborationDashboard = () => {
  const [stats, setStats] = useState<CollaborationStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [partnerFirms, setPartnerFirms] = useState<PartnerFirm[]>([]);
  const [trends, setTrends] = useState<ShareTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Mock data for development - replace with actual API calls
      setStats({
        total_outgoing_shares: 23,
        total_incoming_shares: 15,
        active_partnerships: 8,
        documents_shared: 156,
        total_downloads: 89,
        average_response_time_hours: 4.2,
      });

      setRecentActivity([
        {
          id: '1',
          type: 'share_created',
          matter_title: 'Corporate Merger Agreement',
          matter_number: 'CM-2025-001',
          partner_firm: 'Johnson Legal Group',
          user_name: 'Sarah Mitchell',
          timestamp: '2025-09-13T09:30:00Z',
          details: 'Shared 12 documents with reviewer access',
        },
        {
          id: '2',
          type: 'document_accessed',
          matter_title: 'Patent Application Review',
          matter_number: 'PA-2025-003',
          partner_firm: 'TechLaw Associates',
          user_name: 'David Chen',
          timestamp: '2025-09-13T08:15:00Z',
          details: 'Downloaded contract.pdf (watermarked)',
        },
        {
          id: '3',
          type: 'share_accepted',
          matter_title: 'Environmental Compliance',
          matter_number: 'EC-2025-007',
          partner_firm: 'Green & Associates',
          user_name: 'Maria Garcia',
          timestamp: '2025-09-12T16:45:00Z',
          details: 'Accepted collaboration invitation',
        },
        {
          id: '4',
          type: 'share_expired',
          matter_title: 'Contract Dispute Resolution',
          matter_number: 'CD-2025-002',
          partner_firm: 'Dispute Resolution LLC',
          user_name: 'System',
          timestamp: '2025-09-12T14:20:00Z',
          details: 'Share expired after 30 days',
        },
      ]);

      setPartnerFirms([
        {
          id: '1',
          name: 'Johnson Legal Group',
          total_shares: 8,
          active_shares: 5,
          last_activity: '2025-09-13T09:30:00Z',
          trust_level: 'high',
          total_documents_shared: 42,
        },
        {
          id: '2',
          name: 'TechLaw Associates',
          total_shares: 6,
          active_shares: 3,
          last_activity: '2025-09-13T08:15:00Z',
          trust_level: 'high',
          total_documents_shared: 28,
        },
        {
          id: '3',
          name: 'Green & Associates',
          total_shares: 4,
          active_shares: 4,
          last_activity: '2025-09-12T16:45:00Z',
          trust_level: 'medium',
          total_documents_shared: 19,
        },
        {
          id: '4',
          name: 'Dispute Resolution LLC',
          total_shares: 3,
          active_shares: 1,
          last_activity: '2025-09-10T11:30:00Z',
          trust_level: 'medium',
          total_documents_shared: 15,
        },
        {
          id: '5',
          name: 'Corporate Law Partners',
          total_shares: 2,
          active_shares: 2,
          last_activity: '2025-09-09T14:20:00Z',
          trust_level: 'low',
          total_documents_shared: 8,
        },
      ]);

      setTrends([
        { date: '2025-09-07', outgoing: 2, incoming: 1, downloads: 5 },
        { date: '2025-09-08', outgoing: 1, incoming: 3, downloads: 8 },
        { date: '2025-09-09', outgoing: 3, incoming: 2, downloads: 12 },
        { date: '2025-09-10', outgoing: 1, incoming: 1, downloads: 6 },
        { date: '2025-09-11', outgoing: 4, incoming: 2, downloads: 15 },
        { date: '2025-09-12', outgoing: 2, incoming: 3, downloads: 11 },
        { date: '2025-09-13', outgoing: 3, incoming: 1, downloads: 9 },
      ]);

    } catch (error) {
      console.error('Error fetching collaboration dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'share_created': return <Share2 className="h-4 w-4 text-blue-500" />;
      case 'share_accepted': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'document_accessed': return <Eye className="h-4 w-4 text-amber-500" />;
      case 'share_expired': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'share_created': return 'Share Created';
      case 'share_accepted': return 'Share Accepted';
      case 'document_accessed': return 'Document Accessed';
      case 'share_expired': return 'Share Expired';
      default: return 'Activity';
    }
  };

  const getTrustLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'border-green-700 bg-green-900/30 text-green-400';
      case 'medium': return 'border-yellow-700 bg-yellow-900/30 text-yellow-400';
      case 'low': return 'border-red-700 bg-red-900/30 text-red-400';
      default: return 'border-gray-700 bg-gray-900/30 text-gray-400';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-2 text-slate-400">Loading collaboration data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center">
            <Building className="h-6 w-6 mr-2" />
            Cross-Firm Collaboration Dashboard
          </h2>
          <p className="text-slate-400">
            Monitor sharing activity and partner firm relationships
          </p>
        </div>
        
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Last 24h</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Share2 className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-slate-300">Outgoing Shares</p>
                  <p className="text-2xl font-bold text-slate-100">{stats.total_outgoing_shares}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Download className="h-5 w-5 text-green-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-slate-300">Incoming Shares</p>
                  <p className="text-2xl font-bold text-slate-100">{stats.total_incoming_shares}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Building className="h-5 w-5 text-purple-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-slate-300">Active Partners</p>
                  <p className="text-2xl font-bold text-slate-100">{stats.active_partnerships}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-amber-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-slate-300">Documents Shared</p>
                  <p className="text-2xl font-bold text-slate-100">{stats.documents_shared}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Eye className="h-5 w-5 text-cyan-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-slate-300">Total Downloads</p>
                  <p className="text-2xl font-bold text-slate-100">{stats.total_downloads}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-orange-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-slate-300">Avg Response</p>
                  <p className="text-2xl font-bold text-slate-100">{stats.average_response_time_hours}h</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-slate-800/60">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-slate-200">
                        {getActivityLabel(activity.type)}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                    <p className="text-sm text-slate-300">
                      {activity.matter_title} ({activity.matter_number})
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-slate-400">
                        {activity.partner_firm} • {activity.user_name}
                      </p>
                    </div>
                    {activity.details && (
                      <p className="text-xs text-slate-500 mt-1">{activity.details}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Partner Firms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Partner Firms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {partnerFirms.map((firm) => (
                <div key={firm.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/60">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-slate-200">{firm.name}</p>
                      <Badge className={getTrustLevelColor(firm.trust_level)}>
                        <Shield className="h-3 w-3 mr-1" />
                        {firm.trust_level}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-slate-400">
                      <span>{firm.active_shares}/{firm.total_shares} active</span>
                      <span>{firm.total_documents_shared} docs</span>
                      <span>{formatTimeAgo(firm.last_activity)}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <TrendingUp className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Activity Trends ({timeRange})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trends.map((trend) => (
              <div key={trend.date} className="flex items-center space-x-4 p-3 rounded-lg bg-slate-800/60">
                <div className="w-20 text-sm text-slate-400">
                  {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="flex-1 grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-xs text-slate-400">Outgoing</p>
                    <p className="text-lg font-bold text-blue-400">{trend.outgoing}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-400">Incoming</p>
                    <p className="text-lg font-bold text-green-400">{trend.incoming}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-400">Downloads</p>
                    <p className="text-lg font-bold text-amber-400">{trend.downloads}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
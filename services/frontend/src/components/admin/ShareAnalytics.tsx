import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart3,
  Share2,
  Globe,
  Building,
  CheckCircle,
  TrendingUp,
  RefreshCw,
  Download,
  Calendar,
} from 'lucide-react';

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

export const ShareAnalytics = () => {
  const [analytics, setAnalytics] = useState<ShareAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = async () => {
    try {
      const response = await fetch(`/api/shares/analytics/export?timeRange=${timeRange}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `share-analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting analytics:', error);
    }
  };

  if (loading && !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-white">
              <BarChart3 className="h-6 w-6 mr-3 text-blue-400" />
              Cross-Firm Sharing Analytics
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

              <Button 
                onClick={fetchAnalytics}
                disabled={loading}
                variant="outline"
                className="border-slate-600"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>

              <Button onClick={exportAnalytics} className="bg-blue-600 hover:bg-blue-700">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          {analytics && (
            <div className="flex items-center space-x-4 text-sm text-slate-400 mt-2">
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(analytics.start_date).toLocaleDateString()} - {new Date(analytics.end_date).toLocaleDateString()}
              </span>
            </div>
          )}
        </CardHeader>
      </Card>

      {analytics && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Outgoing</p>
                    <p className="text-2xl font-bold text-white">{analytics.outgoing.total}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {analytics.outgoing.accepted} active
                    </p>
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
                    <p className="text-xs text-slate-500 mt-1">
                      {analytics.incoming.accepted} accepted
                    </p>
                  </div>
                  <Globe className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Success Rate</p>
                    <p className="text-2xl font-bold text-white">
                      {analytics.outgoing.total > 0 
                        ? Math.round((analytics.outgoing.accepted / analytics.outgoing.total) * 100)
                        : 0
                      }%
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Acceptance rate
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-emerald-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Active Partners</p>
                    <p className="text-2xl font-bold text-white">{analytics.top_partners.length}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Unique firms
                    </p>
                  </div>
                  <Building className="h-8 w-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Status Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Outgoing Status */}
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Share2 className="h-5 w-5 mr-2 text-blue-400" />
                  Outgoing Shares Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-600 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-white">Accepted</span>
                    </div>
                    <span className="text-white font-medium">{analytics.outgoing.accepted}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-600 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-white">Pending</span>
                    </div>
                    <span className="text-white font-medium">{analytics.outgoing.pending}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-600 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-white">Declined</span>
                    </div>
                    <span className="text-white font-medium">{analytics.outgoing.declined}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-600 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      <span className="text-white">Revoked</span>
                    </div>
                    <span className="text-white font-medium">{analytics.outgoing.revoked}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-600 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="text-white">Expired</span>
                    </div>
                    <span className="text-white font-medium">{analytics.outgoing.expired}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Incoming Status */}
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-green-400" />
                  Incoming Shares Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-600 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-white">Accepted</span>
                    </div>
                    <span className="text-white font-medium">{analytics.incoming.accepted}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-600 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-white">Pending</span>
                    </div>
                    <span className="text-white font-medium">{analytics.incoming.pending}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Lists */}
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
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate max-w-64">{matter.matter_title}</p>
                        </div>
                      </div>
                      <div className="bg-blue-600 text-white px-2 py-1 rounded text-sm">
                        {matter.share_count} shares
                      </div>
                    </div>
                  ))}
                  {analytics.top_shared_matters.length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      <TrendingUp className="h-8 w-8 mx-auto mb-2" />
                      <p>No sharing activity yet</p>
                    </div>
                  )}
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
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">{partner.firm_name}</p>
                        </div>
                      </div>
                      <div className="bg-orange-600 text-white px-2 py-1 rounded text-sm">
                        {partner.share_count} shares
                      </div>
                    </div>
                  ))}
                  {analytics.top_partners.length === 0 && (
                    <div className="text-center py-8 text-slate-400">
                      <Building className="h-8 w-8 mx-auto mb-2" />
                      <p>No partner firms yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
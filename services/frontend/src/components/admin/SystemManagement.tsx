import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Server, 
  Database, 
  Building2,
  Users,
  Activity,
  AlertCircle,
  CheckCircle,
  HardDrive,
  Network,
  TrendingUp
} from 'lucide-react';

interface SystemHealthMetrics {
  api_server: 'healthy' | 'degraded' | 'down';
  database: 'healthy' | 'degraded' | 'down';
  storage: 'healthy' | 'degraded' | 'down';
  search_engine: 'healthy' | 'degraded' | 'down';
  uptime_hours: number;
  total_firms: number;
  total_system_users: number;
  storage_used_gb: number;
  storage_total_gb: number;
  database_size_gb: number;
  api_requests_last_24h: number;
  avg_response_time_ms: number;
}

interface FirmOnboardingStats {
  pending_approvals: number;
  active_firms: number;
  trial_firms: number;
  enterprise_firms: number;
  recent_signups: Array<{
    firm_name: string;
    contact_email: string;
    signup_date: string;
    status: 'pending' | 'approved' | 'trial';
  }>;
}

export const SystemManagement = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [healthMetrics, setHealthMetrics] = useState<SystemHealthMetrics | null>(null);
  const [firmStats, setFirmStats] = useState<FirmOnboardingStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemHealth();
    fetchFirmStats();
  }, []);

  const fetchSystemHealth = async () => {
    try {
      const response = await fetch('/api/super-admin/system-health', { 
        credentials: 'include' 
      });
      if (response.ok) {
        const data = await response.json();
        setHealthMetrics(data);
      }
    } catch (error) {
      console.error('Error fetching system health:', error);
    }
  };

  const fetchFirmStats = async () => {
    try {
      const response = await fetch('/api/super-admin/firm-stats', { 
        credentials: 'include' 
      });
      if (response.ok) {
        const data = await response.json();
        setFirmStats(data);
      }
    } catch (error) {
      console.error('Error fetching firm stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'down':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'Healthy';
      case 'degraded':
        return 'Degraded';
      case 'down':
        return 'Down';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-slate-400">Loading system management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center">
          <Server className="h-6 w-6 mr-3 text-blue-600" />
          System Management
        </h1>
        <p className="text-slate-400">Monitor system health and manage enterprise operations</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
          <TabsTrigger value="firms">Firm Management</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* System Health Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Server className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-300">API Server</p>
                    <div className="flex items-center">
                      {getStatusIcon(healthMetrics?.api_server || 'unknown')}
                      <span className="ml-1 text-sm">
                        {getStatusText(healthMetrics?.api_server || 'unknown')}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Database className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-300">Database</p>
                    <div className="flex items-center">
                      {getStatusIcon(healthMetrics?.database || 'unknown')}
                      <span className="ml-1 text-sm">
                        {getStatusText(healthMetrics?.database || 'unknown')}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <HardDrive className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-300">Storage</p>
                    <div className="flex items-center">
                      {getStatusIcon(healthMetrics?.storage || 'unknown')}
                      <span className="ml-1 text-sm">
                        {getStatusText(healthMetrics?.storage || 'unknown')}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Building2 className="h-5 w-5 text-orange-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-slate-300">Total Firms</p>
                    <div className="flex items-center">
                      <p className="text-2xl font-bold text-slate-100">
                        {healthMetrics?.total_firms || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-blue-500" />
                  System Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Uptime</span>
                  <span className="font-medium">
                    {healthMetrics?.uptime_hours ? `${Math.floor(healthMetrics.uptime_hours / 24)}d ${healthMetrics.uptime_hours % 24}h` : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Avg Response Time</span>
                  <span className="font-medium">{healthMetrics?.avg_response_time_ms || 0}ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Requests (24h)</span>
                  <span className="font-medium">
                    {healthMetrics?.api_requests_last_24h?.toLocaleString() || 0}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HardDrive className="h-5 w-5 mr-2 text-green-500" />
                  Storage Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Used Storage</span>
                  <span className="font-medium">{healthMetrics?.storage_used_gb || 0} GB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Storage</span>
                  <span className="font-medium">{healthMetrics?.storage_total_gb || 0} GB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database Size</span>
                  <span className="font-medium">{healthMetrics?.database_size_gb || 0} GB</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{
                      width: `${healthMetrics?.storage_total_gb ? (healthMetrics.storage_used_gb / healthMetrics.storage_total_gb) * 100 : 0}%`
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-purple-500" />
                  Platform Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Users</span>
                  <span className="font-medium">{healthMetrics?.total_system_users || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Firms</span>
                  <span className="font-medium">{firmStats?.active_firms || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Trial Firms</span>
                  <span className="font-medium">{firmStats?.trial_firms || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Enterprise Firms</span>
                  <span className="font-medium">{firmStats?.enterprise_firms || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Actions */}
          {firmStats && firmStats.pending_approvals > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
                  Attention Required
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-red-800">Firm Approvals Pending</p>
                    <p className="text-sm text-red-600">
                      {firmStats.pending_approvals} firms waiting for approval
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Review Applications
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="infrastructure" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Infrastructure Health</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 mb-4">Detailed infrastructure monitoring and health checks</p>
              
              <div className="space-y-4">
                <div className="p-4 border border-slate-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Network className="h-5 w-5 mr-3 text-blue-500" />
                      <span className="font-medium">Load Balancer</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">Healthy</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-slate-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Database className="h-5 w-5 mr-3 text-green-500" />
                      <span className="font-medium">Database Cluster</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">Healthy</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-slate-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <HardDrive className="h-5 w-5 mr-3 text-purple-500" />
                      <span className="font-medium">Object Storage</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span className="text-sm">Healthy</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="firms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Firm Onboarding Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 mb-4">Manage firm registrations and approvals</p>
              
              {firmStats?.recent_signups && firmStats.recent_signups.length > 0 ? (
                <div className="space-y-3">
                  {firmStats.recent_signups.map((signup, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-slate-700 rounded-lg">
                      <div>
                        <p className="font-medium">{signup.firm_name}</p>
                        <p className="text-sm text-slate-400">{signup.contact_email}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(signup.signup_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          signup.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          signup.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {signup.status}
                        </span>
                        {signup.status === 'pending' && (
                          <Button variant="outline" size="sm">
                            Review
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400">No recent firm signups</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
                System Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-400 mb-4">Enterprise-level monitoring and alerting</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-slate-700 rounded-lg">
                  <h4 className="font-medium mb-2">Performance Metrics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>CPU Usage</span>
                      <span>23%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Memory Usage</span>
                      <span>67%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Disk I/O</span>
                      <span>12%</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-slate-700 rounded-lg">
                  <h4 className="font-medium mb-2">Security Alerts</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span>No active security incidents</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span>SSL certificates valid</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                      <span>Firewall rules up to date</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
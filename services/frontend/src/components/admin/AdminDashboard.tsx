import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Shield, 
  BarChart3,
  FileText,
  Archive,
  Building,
  AlertCircle,
  Clock,
  Activity
} from 'lucide-react';
import { UserManagement } from './UserManagement';
import { TeamManagement } from './TeamManagement';
import { RetentionPolicies } from './RetentionPolicies';
import { LegalHoldManagement } from './LegalHoldManagement';
import { ShareManagement } from './ShareManagement';
import { SystemSettings } from './SystemSettings';

interface AdminStats {
  total_users: number;
  active_users: number;
  total_matters: number;
  active_matters: number;
  total_documents: number;
  documents_on_hold: number;
  total_clients: number;
  active_clients: number;
  active_shares: number;
  pending_retention_actions: number;
}

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/system-stats', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useState(() => {
    fetchStats();
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Shield className="h-6 w-6 mr-3 text-blue-600" />
          Admin Dashboard
        </h1>
        <p className="text-gray-600">Manage users, system settings, and firm operations</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
          <TabsTrigger value="holds">Legal Holds</TabsTrigger>
          <TabsTrigger value="shares">Shares</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {stats && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Users className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">Total Users</p>
                        <div className="flex items-center">
                          <p className="text-2xl font-bold text-gray-900">{stats.total_users}</p>
                          <span className="ml-2 text-sm text-green-600">
                            ({stats.active_users} active)
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
                        <Archive className="h-5 w-5 text-green-500" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">Matters</p>
                        <div className="flex items-center">
                          <p className="text-2xl font-bold text-gray-900">{stats.total_matters}</p>
                          <span className="ml-2 text-sm text-green-600">
                            ({stats.active_matters} active)
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
                        <FileText className="h-5 w-5 text-orange-500" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">Documents</p>
                        <div className="flex items-center">
                          <p className="text-2xl font-bold text-gray-900">{stats.total_documents}</p>
                          {stats.documents_on_hold > 0 && (
                            <span className="ml-2 text-sm text-red-600">
                              ({stats.documents_on_hold} on hold)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Building className="h-5 w-5 text-purple-500" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">Clients</p>
                        <div className="flex items-center">
                          <p className="text-2xl font-bold text-gray-900">{stats.total_clients}</p>
                          <span className="ml-2 text-sm text-green-600">
                            ({stats.active_clients} active)
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Action Items */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
                      Attention Required
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {stats.pending_retention_actions > 0 && (
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div>
                          <p className="font-medium text-yellow-800">Retention Actions Pending</p>
                          <p className="text-sm text-yellow-600">
                            {stats.pending_retention_actions} items require review
                          </p>
                        </div>
                        <Clock className="h-5 w-5 text-yellow-600" />
                      </div>
                    )}
                    
                    {stats.documents_on_hold > 0 && (
                      <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div>
                          <p className="font-medium text-red-800">Legal Holds Active</p>
                          <p className="text-sm text-red-600">
                            {stats.documents_on_hold} documents under legal hold
                          </p>
                        </div>
                        <Shield className="h-5 w-5 text-red-600" />
                      </div>
                    )}

                    {stats.pending_retention_actions === 0 && stats.documents_on_hold === 0 && (
                      <div className="text-center py-6">
                        <Activity className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <p className="text-green-700 font-medium">All systems operational</p>
                        <p className="text-sm text-green-600">No immediate action required</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Cross-firm shares</span>
                        <span className="font-medium">{stats.active_shares} active</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>New matters this month</span>
                        <span className="font-medium text-green-600">+12</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Documents uploaded today</span>
                        <span className="font-medium text-blue-600">47</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>User logins (24h)</span>
                        <span className="font-medium">{stats.active_users}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="teams">
          <TeamManagement />
        </TabsContent>

        <TabsContent value="retention">
          <RetentionPolicies />
        </TabsContent>

        <TabsContent value="holds">
          <LegalHoldManagement />
        </TabsContent>

        <TabsContent value="shares">
          <ShareManagement />
        </TabsContent>

        <TabsContent value="settings">
          <SystemSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

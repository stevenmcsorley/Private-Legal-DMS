import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users,
  Shield,
  Trash2,
  Search,
  UserPlus,
  Crown,
  Briefcase,
  FileText,
  Eye,
  AlertTriangle
} from 'lucide-react';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  hierarchy_level: number;
  is_active: boolean;
  is_system_role: boolean;
  users?: { id: string; display_name: string; email: string }[];
}

interface User {
  id: string;
  email: string;
  display_name: string;
  roles: { id: string; name: string }[];
}

const getRoleIcon = (roleName: string) => {
  switch (roleName) {
    case 'super_admin':
      return <Crown className="h-4 w-4 text-red-500" />;
    case 'firm_admin':
      return <Shield className="h-4 w-4 text-orange-500" />;
    case 'legal_manager':
      return <Briefcase className="h-4 w-4 text-blue-500" />;
    case 'legal_professional':
      return <FileText className="h-4 w-4 text-green-500" />;
    case 'support_staff':
      return <FileText className="h-4 w-4 text-purple-500" />;
    case 'secretary':
      return <Eye className="h-4 w-4 text-gray-500" />;
    default:
      return <Users className="h-4 w-4 text-gray-400" />;
  }
};

const getRoleBadgeColor = (roleName: string) => {
  switch (roleName) {
    case 'super_admin':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'firm_admin':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'legal_manager':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'legal_professional':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'support_staff':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'secretary':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [roleToAssign, setRoleToAssign] = useState<string>('');
  const { canManageUsers } = useAuth();

  useEffect(() => {
    fetchRoles();
    fetchUsers();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/admin/roles', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setRoles(data.roles || data);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch roles',
        variant: 'destructive',
      });
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users?limit=100', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || data.items || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const assignRole = async () => {
    if (!selectedUser || !roleToAssign) return;

    try {
      const response = await fetch(`/api/admin/users/${selectedUser}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role_id: roleToAssign }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Role assigned successfully',
        });
        fetchUsers();
        setShowAssignDialog(false);
        setSelectedUser('');
        setRoleToAssign('');
      } else {
        throw new Error('Failed to assign role');
      }
    } catch (error) {
      console.error('Error assigning role:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign role',
        variant: 'destructive',
      });
    }
  };

  const removeUserRole = async (userId: string, roleId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/roles/${roleId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Role removed successfully',
        });
        fetchUsers();
      } else {
        throw new Error('Failed to remove role');
      }
    } catch (error) {
      console.error('Error removing role:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove role',
        variant: 'destructive',
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!canManageUsers()) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
            <p className="text-slate-600">You don't have permission to manage user roles.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold flex items-center">
              <Shield className="h-5 w-5 mr-2 text-blue-600" />
              Role Management
            </h2>
            <p className="text-slate-600">Manage user roles and permissions</p>
          </div>
          <Button onClick={() => setShowAssignDialog(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Assign Role
          </Button>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Roles Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => (
            <Card key={role.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center">
                    {getRoleIcon(role.name)}
                    <span className="ml-2 capitalize">{role.name.replace('_', ' ')}</span>
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className={getRoleBadgeColor(role.name)}
                  >
                    Level {role.hierarchy_level}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-3">{role.description}</p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{role.permissions.length} permissions</span>
                  <span>{users.filter(u => u.roles.some(r => r.id === role.id)).length} users</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Users with Roles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Users & Their Roles
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-slate-600">Loading users...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="font-medium">{user.display_name}</p>
                          <p className="text-sm text-slate-600">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {user.roles.length > 0 ? (
                          user.roles.map((role) => (
                            <div key={role.id} className="flex items-center">
                              <Badge
                                variant="outline"
                                className={`${getRoleBadgeColor(role.name)} flex items-center`}
                              >
                                {getRoleIcon(role.name)}
                                <span className="ml-1 capitalize">{role.name.replace('_', ' ')}</span>
                                {canManageUsers() && !roles.find(r => r.id === role.id)?.is_system_role && (
                                  <button
                                    onClick={() => removeUserRole(user.id, role.id)}
                                    className="ml-2 text-red-500 hover:text-red-700"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                )}
                              </Badge>
                            </div>
                          ))
                        ) : (
                          <Badge variant="outline" className="text-slate-500">
                            No roles assigned
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Assign Role Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Role to User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">User</label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.display_name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Role</label>
              <Select value={roleToAssign} onValueChange={setRoleToAssign}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.filter(role => role.is_active).map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      <div className="flex items-center">
                        {getRoleIcon(role.name)}
                        <span className="ml-2 capitalize">{role.name.replace('_', ' ')}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                Cancel
              </Button>
              <Button onClick={assignRole} disabled={!selectedUser || !roleToAssign}>
                Assign Role
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Plus, 
  Filter,
  User,
  Shield,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Crown,
  Loader2
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';

interface User {
  id: string;
  email: string;
  display_name: string;
  roles: string[];
  is_active: boolean;
  created_at: string;
  firm: {
    id: string;
    name: string;
  };
}

interface CreateUserFormData {
  email: string;
  display_name: string;
  first_name: string;
  last_name: string;
  job_title: string;
  department: string;
  phone: string;
  roles: string[];
  is_active: boolean;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUserForm, setEditUserForm] = useState<CreateUserFormData>({
    email: '',
    display_name: '',
    first_name: '',
    last_name: '',
    job_title: '',
    department: '',
    phone: '',
    roles: [],
    is_active: true,
  });
  const [createUserForm, setCreateUserForm] = useState<CreateUserFormData>({
    email: '',
    display_name: '',
    first_name: '',
    last_name: '',
    job_title: '',
    department: '',
    phone: '',
    roles: [],
    is_active: true,
  });

  useEffect(() => {
    fetchCurrentUser();
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/admin/roles', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setRoles(data);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async () => {
    if (!createUserForm.email || !createUserForm.display_name || !createUserForm.first_name || !createUserForm.last_name) {
      alert('Please fill in all required fields');
      return;
    }

    if (createUserForm.roles.length === 0) {
      alert('Please select at least one role');
      return;
    }

    if (!currentUser?.firmId) {
      alert('Unable to determine your firm. Please refresh the page and try again.');
      return;
    }

    setIsCreating(true);
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: createUserForm.email,
          display_name: createUserForm.display_name,
          roles: createUserForm.roles,
          is_active: createUserForm.is_active,
          firm_id: currentUser.firmId,
          attributes: {
            first_name: createUserForm.first_name,
            last_name: createUserForm.last_name,
            job_title: createUserForm.job_title,
            department: createUserForm.department,
            phone: createUserForm.phone,
          }
        }),
      });

      if (response.ok) {
        const newUser = await response.json();
        setUsers([...users, newUser]);
        setShowCreateDialog(false);
        setCreateUserForm({
          email: '',
          display_name: '',
          first_name: '',
          last_name: '',
          job_title: '',
          department: '',
          phone: '',
          roles: [],
          is_active: true,
        });
        alert('User created successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to create user: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const toggleUserStatus = async (userId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ enabled }),
      });
      
      if (response.ok) {
        setUsers(users.map(user => 
          user.id === userId ? { ...user, enabled } : user
        ));
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleRoleToggle = (roleName: string, checked: boolean) => {
    setCreateUserForm(prev => ({
      ...prev,
      roles: checked 
        ? [...prev.roles, roleName]
        : prev.roles.filter(role => role !== roleName)
    }));
  };

  const handleEditRoleToggle = (roleName: string, checked: boolean) => {
    setEditUserForm(prev => ({
      ...prev,
      roles: checked 
        ? [...prev.roles, roleName]
        : prev.roles.filter(role => role !== roleName)
    }));
  };

  const openEditDialog = (user: any) => {
    setEditingUser(user);
    setEditUserForm({
      email: user.email,
      display_name: user.display_name,
      first_name: user.attributes?.first_name || '',
      last_name: user.attributes?.last_name || '',
      job_title: user.attributes?.job_title || '',
      department: user.attributes?.department || '',
      phone: user.attributes?.phone || '',
      roles: user.roles || [],
      is_active: user.is_active,
    });
    setShowEditDialog(true);
  };

  const updateUser = async () => {
    if (!editingUser) return;
    
    if (!editUserForm.email || !editUserForm.display_name || !editUserForm.first_name || !editUserForm.last_name) {
      alert('Please fill in all required fields');
      return;
    }
    if (editUserForm.roles.length === 0) {
      alert('Please select at least one role');
      return;
    }

    setIsEditing(true);
    
    try {
      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: editUserForm.email,
          display_name: editUserForm.display_name,
          roles: editUserForm.roles,
          is_active: editUserForm.is_active,
          attributes: {
            first_name: editUserForm.first_name,
            last_name: editUserForm.last_name,
            job_title: editUserForm.job_title,
            department: editUserForm.department,
            phone: editUserForm.phone,
          }
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers(users.map(u => u.id === editingUser.id ? updatedUser : u));
        setShowEditDialog(false);
        setEditingUser(null);
        alert('User updated successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to update user: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user. Please try again.');
    } finally {
      setIsEditing(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.roles.includes(roleFilter);
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.is_active) ||
      (statusFilter === 'inactive' && !user.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (_role: string) => {
    // Unify role pill styling with dark palette + amber accent
    return 'border-slate-700 bg-slate-800 text-amber-400';
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
      case 'firm_admin':
        return <Crown className="h-3 w-3" />;
      case 'legal_manager':
        return <Shield className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-2 text-slate-400">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">User Management</h2>
          <p className="text-slate-400">Manage user accounts and permissions</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button data-testid="admin-user-create-button">
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]" data-testid="admin-user-create-dialog">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
            </DialogHeader>
            
            <form data-testid="admin-user-create-form" className="space-y-4 py-4">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    data-testid="admin-user-email-input"
                    placeholder="user@example.com"
                    value={createUserForm.email}
                    onChange={(e) => setCreateUserForm({...createUserForm, email: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="display_name">Display Name *</Label>
                  <Input
                    id="display_name"
                    data-testid="admin-user-name-input"
                    placeholder="John Doe"
                    value={createUserForm.display_name}
                    onChange={(e) => setCreateUserForm({...createUserForm, display_name: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    data-testid="admin-user-first-name-input"
                    placeholder="John"
                    value={createUserForm.first_name}
                    onChange={(e) => setCreateUserForm({...createUserForm, first_name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    data-testid="admin-user-last-name-input"
                    placeholder="Doe"
                    value={createUserForm.last_name}
                    onChange={(e) => setCreateUserForm({...createUserForm, last_name: e.target.value})}
                    required
                  />
                </div>
              </div>

              {/* Optional Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="job_title">Job Title</Label>
                  <Input
                    id="job_title"
                    data-testid="admin-user-job-title-input"
                    placeholder="Senior Associate"
                    value={createUserForm.job_title}
                    onChange={(e) => setCreateUserForm({...createUserForm, job_title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    data-testid="admin-user-department-input"
                    placeholder="Corporate Law"
                    value={createUserForm.department}
                    onChange={(e) => setCreateUserForm({...createUserForm, department: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  data-testid="admin-user-phone-input"
                  placeholder="+1-555-123-4567"
                  value={createUserForm.phone}
                  onChange={(e) => setCreateUserForm({...createUserForm, phone: e.target.value})}
                />
              </div>

              {/* Role Selection */}
              <div className="space-y-3">
                <Label>User Roles *</Label>
                <div className="grid grid-cols-2 gap-3" data-testid="admin-user-roles-select">
                  {roles.map((role) => (
                    <div key={role.name} className="flex items-center space-x-2">
                      <Checkbox
                        id={`role-${role.name}`}
                        data-testid={`admin-user-role-${role.name}-checkbox`}
                        checked={createUserForm.roles.includes(role.name)}
                        onCheckedChange={(checked) => handleRoleToggle(role.name, checked as boolean)}
                      />
                      <Label htmlFor={`role-${role.name}`} className="text-sm">
                        <div className="flex items-center space-x-1">
                          {role.name === 'super_admin' || role.name === 'firm_admin' ? (
                            <Crown className="h-3 w-3 text-yellow-600" />
                          ) : role.name === 'legal_manager' ? (
                            <Shield className="h-3 w-3 text-blue-600" />
                          ) : (
                            <User className="h-3 w-3 text-gray-600" />
                          )}
                          <span className="capitalize">{role.name.replace('_', ' ')}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{role.description}</p>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  data-testid="admin-user-active-checkbox"
                  checked={createUserForm.is_active}
                  onCheckedChange={(checked) => setCreateUserForm({...createUserForm, is_active: checked as boolean})}
                />
                <Label htmlFor="is_active">Account is active</Label>
              </div>
            </form>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowCreateDialog(false)}
                data-testid="admin-user-create-cancel"
              >
                Cancel
              </Button>
              <Button 
                onClick={createUser}
                disabled={isCreating || !currentUser?.firmId}
                data-testid="admin-user-create-submit"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : !currentUser?.firmId ? (
                  'Loading...'
                ) : (
                  'Create User'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card data-testid="admin-user-filters">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  data-testid="admin-user-search-input"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger data-testid="admin-user-role-filter">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="firm_admin">Firm Admin</SelectItem>
                <SelectItem value="legal_manager">Legal Manager</SelectItem>
                <SelectItem value="legal_professional">Legal Professional</SelectItem>
                <SelectItem value="paralegal">Paralegal</SelectItem>
                <SelectItem value="client_user">Client User</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger data-testid="admin-user-status-filter">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center text-sm text-slate-400">
        <Filter className="h-4 w-4 mr-2" />
        Showing {filteredUsers.length} of {users.length} users
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="admin-user-list">
              <thead className="border-b border-slate-800 bg-slate-800/60">
                <tr>
                  <th className="text-left py-3 px-6 font-medium text-slate-300">User</th>
                  <th className="text-left py-3 px-6 font-medium text-slate-300">Roles</th>
                  <th className="text-left py-3 px-6 font-medium text-slate-300">Status</th>
                  <th className="text-left py-3 px-6 font-medium text-slate-300">Last Login</th>
                  <th className="text-left py-3 px-6 font-medium text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-slate-800 hover:bg-slate-800/60" data-testid={`admin-user-row-${user.id}`}>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-slate-700 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-slate-300" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-slate-100">{user.display_name}</p>
                            {user.roles.includes('firm_admin') && (
                              <Crown className="h-4 w-4 text-yellow-600" />
                            )}
                          </div>
                          <p className="text-sm text-slate-400">{user.email}</p>
                          <p className="text-xs text-slate-500">ID: {user.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <Badge 
                            key={role} 
                            className={`${getRoleColor(role)} text-xs flex items-center`}
                          >
                            {getRoleIcon(role)}
                            <span className="ml-1">{role.replace('_', ' ')}</span>
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Firm: {user.firm.name}
                      </p>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        {user.is_active ? (
                          <UserCheck className="h-4 w-4 text-green-400" />
                        ) : (
                          <UserX className="h-4 w-4 text-red-400" />
                        )}
                        <Badge className={user.is_active ? 'border border-green-700 bg-green-900/30 text-green-400' : 'border border-red-700 bg-red-900/30 text-red-400'}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6 text-sm text-slate-400">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2" data-testid={`admin-user-actions-${user.id}`}>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openEditDialog(user)}
                          data-testid={`admin-user-edit-${user.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          data-testid={`admin-user-toggle-status-${user.id}`}
                          onClick={() => toggleUserStatus(user.id, !user.is_active)}
                          className={user.is_active ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                        >
                          {user.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          data-testid={`admin-user-delete-${user.id}`}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-100 mb-2">No users found</h3>
            <p className="text-slate-400">
              {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'No users have been created yet.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          
          {editingUser && (
            <form data-testid="admin-user-edit-form" className="space-y-4 py-4">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email Address *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    data-testid="admin-user-edit-email-input"
                    placeholder="user@example.com"
                    value={editUserForm.email}
                    onChange={(e) => setEditUserForm({...editUserForm, email: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-display_name">Display Name *</Label>
                  <Input
                    id="edit-display_name"
                    data-testid="admin-user-edit-name-input"
                    placeholder="John Doe"
                    value={editUserForm.display_name}
                    onChange={(e) => setEditUserForm({...editUserForm, display_name: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-first_name">First Name *</Label>
                  <Input
                    id="edit-first_name"
                    data-testid="admin-user-edit-first-name-input"
                    placeholder="John"
                    value={editUserForm.first_name}
                    onChange={(e) => setEditUserForm({...editUserForm, first_name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-last_name">Last Name *</Label>
                  <Input
                    id="edit-last_name"
                    data-testid="admin-user-edit-last-name-input"
                    placeholder="Doe"
                    value={editUserForm.last_name}
                    onChange={(e) => setEditUserForm({...editUserForm, last_name: e.target.value})}
                    required
                  />
                </div>
              </div>
              {/* Optional Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-job_title">Job Title</Label>
                  <Input
                    id="edit-job_title"
                    data-testid="admin-user-edit-job-title-input"
                    placeholder="Senior Associate"
                    value={editUserForm.job_title}
                    onChange={(e) => setEditUserForm({...editUserForm, job_title: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-department">Department</Label>
                  <Input
                    id="edit-department"
                    data-testid="admin-user-edit-department-input"
                    placeholder="Corporate Law"
                    value={editUserForm.department}
                    onChange={(e) => setEditUserForm({...editUserForm, department: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  data-testid="admin-user-edit-phone-input"
                  placeholder="+1-555-123-4567"
                  value={editUserForm.phone}
                  onChange={(e) => setEditUserForm({...editUserForm, phone: e.target.value})}
                />
              </div>
              {/* Role Selection */}
              <div className="space-y-3">
                <Label>User Roles *</Label>
                <div className="grid grid-cols-2 gap-3" data-testid="admin-user-edit-roles-select">
                  {roles.map((role) => (
                    <div key={role.name} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-role-${role.name}`}
                        data-testid={`admin-user-edit-role-${role.name}-checkbox`}
                        checked={editUserForm.roles.includes(role.name)}
                        onCheckedChange={(checked) => handleEditRoleToggle(role.name, checked as boolean)}
                      />
                      <Label htmlFor={`edit-role-${role.name}`} className="text-sm">
                        <div className="flex items-center space-x-1">
                          {role.name === 'super_admin' || role.name === 'firm_admin' ? (
                            <Crown className="h-3 w-3 text-yellow-600" />
                          ) : role.name === 'legal_manager' ? (
                            <Shield className="h-3 w-3 text-blue-600" />
                          ) : (
                            <User className="h-3 w-3 text-gray-600" />
                          )}
                          <span>{role.description}</span>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              {/* Status */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit-is_active"
                  data-testid="admin-user-edit-active-checkbox"
                  checked={editUserForm.is_active}
                  onCheckedChange={(checked) => setEditUserForm({...editUserForm, is_active: checked as boolean})}
                />
                <Label htmlFor="edit-is_active">Account is active</Label>
              </div>
            </form>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowEditDialog(false)}
              data-testid="admin-user-edit-cancel"
            >
              Cancel
            </Button>
            <Button 
              onClick={updateUser}
              disabled={isEditing}
              data-testid="admin-user-edit-submit"
            >
              {isEditing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update User'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

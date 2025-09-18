import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ClearanceLevelInput } from '@/components/ui/clearance-level-input';
import { ClearanceLevelDisplay } from '@/components/ui/clearance-level-display';
import { 
  Shield, 
  Users, 
  AlertTriangle, 
  CheckCircle,
  Loader2,
  History,
  Search
} from 'lucide-react';
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
  clearance_level: number;
  roles: string[];
}

interface ClearanceAuditLog {
  id: string;
  user_id: string;
  user_name: string;
  old_clearance: number;
  new_clearance: number;
  changed_by: string;
  reason: string;
  created_at: string;
}

export const ClearanceManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<ClearanceAuditLog[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [showAuditDialog, setShowAuditDialog] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [bulkClearanceLevel, setBulkClearanceLevel] = useState<number>(5);
  const [bulkReason, setBulkReason] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchCurrentUser();
    fetchUsers();
    fetchAuditLogs();
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

  const fetchAuditLogs = async () => {
    try {
      const response = await fetch('/api/admin/clearance-audit', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    }
  };

  const updateUserClearance = async (userId: string, clearanceLevel: number, reason: string = '') => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/clearance`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ clearance_level: clearanceLevel, reason }),
      });

      if (response.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, clearance_level: clearanceLevel } : u));
        await fetchAuditLogs(); // Refresh audit logs
        return true;
      } else {
        const error = await response.json();
        alert(`Failed to update clearance: ${error.message}`);
        return false;
      }
    } catch (error) {
      console.error('Error updating user clearance:', error);
      alert('Failed to update clearance. Please try again.');
      return false;
    }
  };

  const updateBulkClearance = async () => {
    if (selectedUsers.size === 0) return;

    setIsUpdating(true);
    try {
      const response = await fetch('/api/admin/clearance/bulk-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          user_ids: Array.from(selectedUsers),
          clearance_level: bulkClearanceLevel,
          reason: bulkReason
        }),
      });

      if (response.ok) {
        await fetchUsers();
        await fetchAuditLogs();
        setSelectedUsers(new Set());
        setShowBulkDialog(false);
        setBulkReason('');
        alert('Bulk clearance update completed successfully');
      } else {
        const error = await response.json();
        alert(`Bulk update failed: ${error.message}`);
      }
    } catch (error) {
      console.error('Error performing bulk clearance update:', error);
      alert('Failed to perform bulk update. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    return user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleUserSelection = (userId: string, checked: boolean) => {
    const newSelected = new Set(selectedUsers);
    if (checked) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedUsers(newSelected);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-2 text-slate-400">Loading clearance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center space-x-2">
            <Shield className="h-5 w-5 text-amber-500" />
            <span>Clearance Level Management</span>
          </h2>
          <p className="text-slate-400">Manage user security clearance levels and view audit history</p>
        </div>
        
        <div className="flex items-center space-x-2">
          {selectedUsers.size > 0 && (
            <Dialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Bulk Update ({selectedUsers.size})
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Bulk Clearance Update</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <ClearanceLevelInput
                    value={bulkClearanceLevel}
                    onChange={setBulkClearanceLevel}
                    label="New Clearance Level"
                    maxLevel={currentUser?.clearance_level || 10}
                    required
                  />
                  
                  <div>
                    <Label htmlFor="bulk-reason">Reason for Change</Label>
                    <Input
                      id="bulk-reason"
                      value={bulkReason}
                      onChange={(e) => setBulkReason(e.target.value)}
                      placeholder="Enter reason for audit trail"
                    />
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-md p-3 dark:bg-amber-900/20 dark:border-amber-800">
                    <div className="flex">
                      <AlertTriangle className="h-5 w-5 text-amber-400" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                          Bulk Update Warning
                        </h3>
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                          This will update clearance levels for {selectedUsers.size} users. This action will be logged for audit purposes.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowBulkDialog(false)}
                    disabled={isUpdating}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={updateBulkClearance} 
                    disabled={isUpdating || !bulkReason.trim()}
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Clearances'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          <Dialog open={showAuditDialog} onOpenChange={setShowAuditDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <History className="h-4 w-4 mr-2" />
                Audit Log
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Clearance Level Audit Log</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-slate-800">
                      <tr>
                        <th className="text-left py-2 text-slate-300">Date/Time</th>
                        <th className="text-left py-2 text-slate-300">User</th>
                        <th className="text-left py-2 text-slate-300">Change</th>
                        <th className="text-left py-2 text-slate-300">Changed By</th>
                        <th className="text-left py-2 text-slate-300">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="border-b border-slate-800">
                          <td className="py-2 text-slate-400">
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                          <td className="py-2">{log.user_name}</td>
                          <td className="py-2">
                            <div className="flex items-center space-x-2">
                              <ClearanceLevelDisplay level={log.old_clearance} size="sm" showLabel={false} />
                              <span className="text-slate-400">→</span>
                              <ClearanceLevelDisplay level={log.new_clearance} size="sm" showLabel={false} />
                            </div>
                          </td>
                          <td className="py-2 text-slate-400">{log.changed_by}</td>
                          <td className="py-2 text-slate-400">{log.reason || 'No reason provided'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-800 bg-slate-800/60">
                <tr>
                  <th className="text-left py-3 px-6 font-medium text-slate-300 w-12">
                    <input
                      type="checkbox"
                      checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(new Set(filteredUsers.map(user => user.id)));
                        } else {
                          setSelectedUsers(new Set());
                        }
                      }}
                    />
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-slate-300">User</th>
                  <th className="text-left py-3 px-6 font-medium text-slate-300">Current Clearance</th>
                  <th className="text-left py-3 px-6 font-medium text-slate-300">Roles</th>
                  <th className="text-left py-3 px-6 font-medium text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-slate-800 hover:bg-slate-800/60">
                    <td className="py-4 px-6">
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.id)}
                        onChange={(e) => handleUserSelection(user.id, e.target.checked)}
                      />
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-slate-100">{user.display_name}</p>
                        <p className="text-sm text-slate-400">{user.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <ClearanceLevelDisplay level={user.clearance_level || 5} />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.slice(0, 2).map((role) => (
                          <span key={role} className="px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded">
                            {role.replace('_', ' ')}
                          </span>
                        ))}
                        {user.roles.length > 2 && (
                          <span className="px-2 py-1 bg-slate-600 text-slate-400 text-xs rounded">
                            +{user.roles.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <QuickClearanceUpdate 
                        user={user}
                        maxLevel={currentUser?.clearance_level || 10}
                        onUpdate={updateUserClearance}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Quick inline clearance update component
interface QuickClearanceUpdateProps {
  user: User;
  maxLevel: number;
  onUpdate: (userId: string, level: number, reason: string) => Promise<boolean>;
}

const QuickClearanceUpdate = ({ user, maxLevel, onUpdate }: QuickClearanceUpdateProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [newLevel, setNewLevel] = useState(user.clearance_level);
  const [reason, setReason] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    if (newLevel === user.clearance_level) {
      setIsOpen(false);
      return;
    }

    setIsUpdating(true);
    const success = await onUpdate(user.id, newLevel, reason);
    setIsUpdating(false);
    
    if (success) {
      setIsOpen(false);
      setReason('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={() => setNewLevel(user.clearance_level)}>
          <Shield className="h-4 w-4 mr-1" />
          Update
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Clearance for {user.display_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label>Current Clearance</Label>
            <div className="mt-1">
              <ClearanceLevelDisplay level={user.clearance_level} />
            </div>
          </div>
          
          <ClearanceLevelInput
            value={newLevel}
            onChange={setNewLevel}
            label="New Clearance Level"
            maxLevel={maxLevel}
            required
          />
          
          <div>
            <Label htmlFor="reason">Reason for Change</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for audit trail"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isUpdating}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdate} 
            disabled={isUpdating || !reason.trim() || newLevel === user.clearance_level}
          >
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Update Clearance
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
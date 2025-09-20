import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowLeft,
  Save,
  Loader2,
  Users,
  Shield,
  User,
} from 'lucide-react';

interface User {
  id: string;
  display_name: string;
  email: string;
  roles: string[];
  is_active: boolean;
}

interface Matter {
  id: string;
  title: string;
}

interface AddMemberFormData {
  user_id: string;
  role: string;
  access_level: string;
}

const MATTER_ROLES = [
  { value: 'lead_lawyer', label: 'Lead Lawyer' },
  { value: 'associate', label: 'Associate' },
  { value: 'paralegal', label: 'Paralegal' },
  { value: 'legal_assistant', label: 'Legal Assistant' },
  { value: 'observer', label: 'Observer' },
];

const ACCESS_LEVELS = [
  { value: 'full', label: 'Full Access', description: 'Can view and edit all matter content' },
  { value: 'read_write', label: 'Read & Write', description: 'Can view and add content, but not edit existing' },
  { value: 'read_only', label: 'Read Only', description: 'Can only view matter content' },
  { value: 'limited', label: 'Limited', description: 'Limited access to specific documents only' },
];

export const MatterAddMember: React.FC = () => {
  const { id: matterId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [matter, setMatter] = useState<Matter | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<AddMemberFormData>({
    user_id: '',
    role: 'observer',
    access_level: 'read_only',
  });

  useEffect(() => {
    if (matterId) {
      fetchMatter();
      fetchUsers();
    }
  }, [matterId]);

  const fetchMatter = async () => {
    try {
      const response = await fetch(`/api/matters/${matterId}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setMatter(data);
      } else {
        setError('Failed to fetch matter details');
      }
    } catch (error) {
      console.error('Error fetching matter:', error);
      setError('Failed to fetch matter details');
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        // Filter out inactive users, client users, and get only firm members
        const firmUsers = (data.users || []).filter((user: User) => 
          user.is_active && !user.roles.includes('client_user')
        );
        setUsers(firmUsers);
      } else {
        setError('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToMatter = () => {
    navigate(`/matters/${matterId}?tab=people`);
  };

  const addMember = async () => {
    if (!formData.user_id || !formData.role || !formData.access_level) {
      alert('Please fill in all required fields');
      return;
    }

    setAdding(true);
    
    try {
      const response = await fetch(`/api/matters/${matterId}/team`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          user_id: formData.user_id,
          role: formData.role,
          access_level: formData.access_level,
        }),
      });

      if (response.ok) {
        alert('Team member added successfully!');
        navigate(`/matters/${matterId}?tab=people`);
      } else {
        const error = await response.json();
        alert(`Failed to add team member: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding team member:', error);
      alert('Failed to add team member. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  const selectedUser = users.find(user => user.id === formData.user_id);
  const selectedAccessLevel = ACCESS_LEVELS.find(level => level.value === formData.access_level);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto" />
          <p className="mt-2 text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !matter) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleBackToMatter}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Matter
          </Button>
        </div>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-100 mb-2">Error Loading Matter</h3>
            <p className="text-slate-400">{error || 'Matter not found'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleBackToMatter}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Matter
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Add Team Member</h1>
            <p className="text-slate-400">Add a team member to: {matter.title}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleBackToMatter}>
            Cancel
          </Button>
          <Button onClick={addMember} disabled={adding}>
            {adding ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Add Member
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Add Member Form */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Users className="h-5 w-5 mr-2 text-orange-500" />
            Team Member Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Selection */}
          <div className="space-y-2">
            <Label htmlFor="user" className="text-white">User *</Label>
            <Select value={formData.user_id} onValueChange={(value) => setFormData({...formData, user_id: value})}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Select user to add" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id} className="text-white hover:bg-slate-600">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm">
                        {user.display_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">{user.display_name}</div>
                        <div className="text-sm text-slate-400">{user.email}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedUser && (
              <div className="text-sm text-slate-400">
                Roles: {selectedUser.roles.join(', ')}
              </div>
            )}
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role" className="text-white">Matter Role *</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {MATTER_ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value} className="text-white hover:bg-slate-600">
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Access Level Selection */}
          <div className="space-y-2">
            <Label htmlFor="access_level" className="text-white">Access Level *</Label>
            <Select value={formData.access_level} onValueChange={(value) => setFormData({...formData, access_level: value})}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {ACCESS_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value} className="text-white hover:bg-slate-600">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-orange-400" />
                      <span>{level.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedAccessLevel && (
              <p className="text-sm text-slate-400">
                {selectedAccessLevel.description}
              </p>
            )}
          </div>

          {/* Summary */}
          {formData.user_id && formData.role && formData.access_level && (
            <Card className="bg-slate-700 border-slate-600">
              <CardContent className="pt-6">
                <h4 className="text-white font-medium mb-4">Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">User:</span>
                    <span className="text-white">{selectedUser?.display_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Role:</span>
                    <span className="text-white">{MATTER_ROLES.find(r => r.value === formData.role)?.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Access:</span>
                    <span className="text-white">{selectedAccessLevel?.label}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Save,
  Loader2,
  User,
  Shield,
  Users,
  Plus,
  X,
} from 'lucide-react';

interface Team {
  id: string;
  name: string;
  description?: string;
}

interface UserData {
  id: string;
  email: string;
  display_name: string;
  roles: string[];
  clearance_level: number;
  is_active: boolean;
  keycloak_id?: string;
  attributes: Record<string, any>;
  teams?: Team[];
}

interface UpdateUserFormData {
  email: string;
  display_name: string;
  roles: string[];
  clearance_level: number;
  is_active: boolean;
  team_ids: string[];
  keycloak_id?: string;
  attributes: Record<string, any>;
}

const AVAILABLE_ROLES = [
  'super_admin',
  'firm_admin',
  'legal_manager',
  'legal_professional',
  'support_staff',
  'external_partner',
  'client_user'
];

const CLEARANCE_LEVELS = [
  { value: 1, label: 'Level 1 - Public', description: 'Access to public documents only' },
  { value: 2, label: 'Level 2 - Internal', description: 'Access to internal non-sensitive documents' },
  { value: 3, label: 'Level 3 - Confidential', description: 'Access to confidential client information' },
  { value: 4, label: 'Level 4 - Restricted', description: 'Access to sensitive legal matters' },
  { value: 5, label: 'Level 5 - Top Secret', description: 'Full access to all documents and systems' },
];

export const UserEdit: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [availableTeams, setAvailableTeams] = useState<Team[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<UpdateUserFormData>({
    email: '',
    display_name: '',
    roles: [],
    clearance_level: 3,
    is_active: true,
    team_ids: [],
    attributes: {},
  });

  useEffect(() => {
    if (userId) {
      fetchUser();
      fetchAvailableTeams();
    }
  }, [userId]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${userId}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setFormData({
          email: userData.email,
          display_name: userData.display_name,
          roles: userData.roles || [],
          clearance_level: userData.clearance_level || 3,
          is_active: userData.is_active,
          team_ids: userData.teams?.map((t: Team) => t.id) || [],
          keycloak_id: userData.keycloak_id,
          attributes: userData.attributes || {},
        });
      } else {
        setError('Failed to fetch user details');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setError('Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTeams = async () => {
    setLoadingTeams(true);
    try {
      const response = await fetch('/api/admin/teams', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setAvailableTeams(data.teams || []);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoadingTeams(false);
    }
  };

  const handleBackToUsers = () => {
    navigate('/admin?tab=users');
  };

  const updateUser = async () => {
    if (!formData.email || !formData.display_name || formData.roles.length === 0) {
      alert('Please fill in all required fields (email, display name, and at least one role)');
      return;
    }

    setUpdating(true);
    
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('User updated successfully!');
        navigate('/admin?tab=users');
      } else {
        const error = await response.json();
        alert(`Failed to update user: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const addRole = (role: string) => {
    if (!formData.roles.includes(role)) {
      setFormData({
        ...formData,
        roles: [...formData.roles, role]
      });
    }
  };

  const removeRole = (role: string) => {
    setFormData({
      ...formData,
      roles: formData.roles.filter(r => r !== role)
    });
  };

  const addTeam = (teamId: string) => {
    if (!formData.team_ids.includes(teamId)) {
      setFormData({
        ...formData,
        team_ids: [...formData.team_ids, teamId]
      });
    }
  };

  const removeTeam = (teamId: string) => {
    setFormData({
      ...formData,
      team_ids: formData.team_ids.filter(id => id !== teamId)
    });
  };

  const selectedTeams = availableTeams.filter(team => 
    formData.team_ids.includes(team.id)
  );

  const availableRoles = AVAILABLE_ROLES.filter(role => 
    !formData.roles.includes(role)
  );

  const selectedClearanceLevel = CLEARANCE_LEVELS.find(level => 
    level.value === formData.clearance_level
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500 mx-auto" />
          <p className="mt-2 text-slate-400">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleBackToUsers}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <User className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-100 mb-2">Error Loading User</h3>
            <p className="text-slate-400">{error || 'User not found'}</p>
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
          <Button variant="outline" onClick={handleBackToUsers}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Edit User: {user.display_name}</h1>
            <p className="text-slate-400">Update user information, roles, and team assignments</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleBackToUsers}>
            Cancel
          </Button>
          <Button onClick={updateUser} disabled={updating}>
            {updating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Update User
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Edit Form */}
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Information</TabsTrigger>
          <TabsTrigger value="permissions">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="teams">Team Assignments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.smith@lawfirm.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="display_name">Display Name *</Label>
                  <Input
                    id="display_name"
                    placeholder="John Smith"
                    value={formData.display_name}
                    onChange={(e) => setFormData({...formData, display_name: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="keycloak_id">Keycloak User ID</Label>
                <Input
                  id="keycloak_id"
                  placeholder="Keycloak user identifier"
                  value={formData.keycloak_id || ''}
                  onChange={(e) => setFormData({...formData, keycloak_id: e.target.value})}
                  disabled
                />
                <p className="text-xs text-slate-400">
                  Keycloak ID cannot be modified after user creation
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="is_active">User is active</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              {/* Selected Roles */}
              {formData.roles.length > 0 && (
                <div className="space-y-2">
                  <Label>Assigned Roles ({formData.roles.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.roles.map((role) => (
                      <Badge 
                        key={role} 
                        variant="outline" 
                        className="flex items-center space-x-1 px-3 py-1"
                      >
                        <Shield className="h-3 w-3" />
                        <span>{role.replace('_', ' ')}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-red-600"
                          onClick={() => removeRole(role)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Roles */}
              <div className="space-y-2">
                <Label>Add Roles *</Label>
                <div className="grid grid-cols-2 gap-2">
                  {availableRoles.map((role) => (
                    <Button
                      key={role}
                      variant="outline"
                      size="sm"
                      onClick={() => addRole(role)}
                      className="justify-start"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {role.replace('_', ' ')}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Clearance Level */}
              <div className="space-y-2">
                <Label>Security Clearance Level</Label>
                <Select 
                  value={formData.clearance_level.toString()} 
                  onValueChange={(value) => setFormData({...formData, clearance_level: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CLEARANCE_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value.toString()}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedClearanceLevel && (
                  <p className="text-sm text-slate-400">
                    {selectedClearanceLevel.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              {/* Selected Teams */}
              {selectedTeams.length > 0 && (
                <div className="space-y-2">
                  <Label>Assigned Teams ({selectedTeams.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedTeams.map((team) => (
                      <Badge 
                        key={team.id} 
                        variant="outline" 
                        className="flex items-center space-x-1 px-3 py-1"
                      >
                        <Users className="h-3 w-3" />
                        <span>{team.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-red-600"
                          onClick={() => removeTeam(team.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Available Teams */}
              <div className="space-y-2">
                <Label>Add to Teams</Label>
                {loadingTeams ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                    <span className="ml-2 text-slate-400">Loading teams...</span>
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto border border-slate-700 rounded-lg">
                    {availableTeams.filter(team => !formData.team_ids.includes(team.id)).length > 0 ? (
                      <div className="space-y-1 p-2">
                        {availableTeams
                          .filter(team => !formData.team_ids.includes(team.id))
                          .map((team) => (
                            <div 
                              key={team.id}
                              className="flex items-center justify-between p-3 hover:bg-slate-800 rounded-lg cursor-pointer"
                              onClick={() => addTeam(team.id)}
                            >
                              <div>
                                <div className="font-medium text-slate-100">{team.name}</div>
                                {team.description && (
                                  <div className="text-sm text-slate-400">{team.description}</div>
                                )}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addTeam(team.id);
                                }}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                        <p className="text-slate-400">
                          {availableTeams.length === 0 
                            ? 'No teams available'
                            : 'User is assigned to all available teams'
                          }
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
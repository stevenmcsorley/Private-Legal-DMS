import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Save,
  Loader2,
  Users,
  Search,
  Plus,
  X,
} from 'lucide-react';

interface User {
  id: string;
  display_name: string;
  email: string;
  roles: string[];
  is_active: boolean;
}

interface Team {
  id: string;
  name: string;
  description?: string;
  members: User[];
}

interface UpdateTeamFormData {
  name: string;
  description: string;
  member_ids: string[];
}

export const TeamEdit: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [team, setTeam] = useState<Team | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<UpdateTeamFormData>({
    name: '',
    description: '',
    member_ids: [],
  });

  useEffect(() => {
    if (teamId) {
      fetchTeam();
      fetchAvailableUsers();
    }
  }, [teamId]);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/teams/${teamId}`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const teamData = await response.json();
        setTeam(teamData);
        setFormData({
          name: teamData.name,
          description: teamData.description || '',
          member_ids: teamData.members?.map((m: User) => m.id) || [],
        });
      } else {
        setError('Failed to fetch team details');
      }
    } catch (error) {
      console.error('Error fetching team:', error);
      setError('Failed to fetch team details');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch('/api/admin/users', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setAvailableUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleBackToTeams = () => {
    navigate('/admin?tab=teams');
  };

  const updateTeam = async () => {
    if (!formData.name) {
      alert('Please fill in the team name');
      return;
    }

    setUpdating(true);
    
    try {
      const response = await fetch(`/api/admin/teams/${teamId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Team updated successfully!');
        navigate('/admin?tab=teams');
      } else {
        const error = await response.json();
        alert(`Failed to update team: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating team:', error);
      alert('Failed to update team. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const addMember = (userId: string) => {
    if (!formData.member_ids.includes(userId)) {
      setFormData({
        ...formData,
        member_ids: [...formData.member_ids, userId]
      });
    }
  };

  const removeMember = (userId: string) => {
    setFormData({
      ...formData,
      member_ids: formData.member_ids.filter(id => id !== userId)
    });
  };

  const selectedUsers = availableUsers.filter(user => 
    formData.member_ids.includes(user.id)
  );

  const filteredAvailableUsers = availableUsers.filter(user => 
    !formData.member_ids.includes(user.id) &&
    (user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500 mx-auto" />
          <p className="mt-2 text-slate-400">Loading team details...</p>
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleBackToTeams}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Teams
          </Button>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-100 mb-2">Error Loading Team</h3>
            <p className="text-slate-400">{error || 'Team not found'}</p>
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
          <Button variant="outline" onClick={handleBackToTeams}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Teams
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Edit Team: {team.name}</h1>
            <p className="text-slate-400">Update team information and manage team members</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleBackToTeams}>
            Cancel
          </Button>
          <Button onClick={updateTeam} disabled={updating}>
            {updating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Update Team
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Edit Form */}
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Basic Information</TabsTrigger>
          <TabsTrigger value="members">Team Members</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Team Name *</Label>
                <Input
                  id="name"
                  placeholder="Corporate Legal Team"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the team's responsibilities and focus areas..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardContent className="pt-6 space-y-4">
              {/* Selected Members */}
              {selectedUsers.length > 0 && (
                <div className="space-y-2">
                  <Label>Current Team Members ({selectedUsers.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedUsers.map((user) => (
                      <Badge 
                        key={user.id} 
                        variant="outline" 
                        className="flex items-center space-x-1 px-3 py-1"
                      >
                        <span>{user.display_name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-red-600"
                          onClick={() => removeMember(user.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* User Search */}
              <div className="space-y-2">
                <Label>Add Team Members</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Available Users */}
              <div className="space-y-2">
                <Label>Available Users</Label>
                {loadingUsers ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                    <span className="ml-2 text-slate-400">Loading users...</span>
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto border border-slate-700 rounded-lg">
                    {filteredAvailableUsers.length > 0 ? (
                      <div className="space-y-1 p-2">
                        {filteredAvailableUsers.map((user) => (
                          <div 
                            key={user.id}
                            className="flex items-center justify-between p-3 hover:bg-slate-800 rounded-lg cursor-pointer"
                            onClick={() => addMember(user.id)}
                          >
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-slate-100">{user.display_name}</span>
                                {!user.is_active && (
                                  <Badge variant="outline" className="text-xs text-red-400 border-red-600">
                                    Inactive
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-slate-400">{user.email}</div>
                              {user.roles.length > 0 && (
                                <div className="flex space-x-1 mt-1">
                                  {user.roles.map((role) => (
                                    <Badge key={role} variant="outline" className="text-xs">
                                      {role.replace('_', ' ')}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                addMember(user.id);
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
                          {searchTerm 
                            ? 'No users found matching your search'
                            : 'All users have been added to the team'
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
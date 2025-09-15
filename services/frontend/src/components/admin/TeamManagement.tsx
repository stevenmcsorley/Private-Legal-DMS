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
  Users,
  Edit,
  UserPlus,
  Loader2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';

interface Team {
  id: string;
  name: string;
  description?: string;
  firm_id: string;
  firm: {
    id: string;
    name: string;
  };
  members: User[];
}

interface User {
  id: string;
  email: string;
  display_name: string;
  roles: string[];
  is_active: boolean;
}

interface CreateTeamFormData {
  name: string;
  description: string;
  initial_member_ids: string[];
}

export const TeamManagement = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [createTeamForm, setCreateTeamForm] = useState<CreateTeamFormData>({
    name: '',
    description: '',
    initial_member_ids: [],
  });
  const [editTeamForm, setEditTeamForm] = useState<CreateTeamFormData>({
    name: '',
    description: '',
    initial_member_ids: [],
  });

  useEffect(() => {
    fetchCurrentUser();
    fetchTeams();
    fetchUsers();
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

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/admin/teams', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setTeams(data || []);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
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
    }
  };

  const createTeam = async () => {
    if (!createTeamForm.name) {
      alert('Please enter a team name');
      return;
    }

    if (!currentUser?.firmId) {
      alert('Unable to determine your firm. Please refresh the page and try again.');
      return;
    }

    setIsCreating(true);
    
    try {
      const response = await fetch('/api/admin/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...createTeamForm,
          firm_id: currentUser.firmId,
        }),
      });

      if (response.ok) {
        const newTeam = await response.json();
        setTeams([...teams, newTeam]);
        setShowCreateDialog(false);
        setCreateTeamForm({
          name: '',
          description: '',
          initial_member_ids: [],
        });
        alert('Team created successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to create team: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating team:', error);
      alert('Failed to create team. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const openEditDialog = (team: Team) => {
    setEditingTeam(team);
    setEditTeamForm({
      name: team.name,
      description: team.description || '',
      initial_member_ids: team.members?.map(m => m.id) || [],
    });
    setShowEditDialog(true);
  };

  const updateTeam = async () => {
    if (!editingTeam) return;
    
    if (!editTeamForm.name) {
      alert('Please enter a team name');
      return;
    }

    setIsEditing(true);
    
    try {
      const response = await fetch(`/api/admin/teams/${editingTeam.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: editTeamForm.name,
          description: editTeamForm.description,
          member_ids: editTeamForm.initial_member_ids,
        }),
      });

      if (response.ok) {
        const updatedTeam = await response.json();
        setTeams(teams.map(t => t.id === editingTeam.id ? updatedTeam : t));
        setShowEditDialog(false);
        setEditingTeam(null);
        alert('Team updated successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to update team: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating team:', error);
      alert('Failed to update team. Please try again.');
    } finally {
      setIsEditing(false);
    }
  };

  const handleMemberToggle = (userId: string, checked: boolean, isEdit = false) => {
    const formSetter = isEdit ? setEditTeamForm : setCreateTeamForm;
    
    formSetter(prev => ({
      ...prev,
      initial_member_ids: checked 
        ? [...prev.initial_member_ids, userId]
        : prev.initial_member_ids.filter(id => id !== userId)
    }));
  };

  const filteredTeams = teams.filter((team) => 
    team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (team.description && team.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-2 text-slate-400">Loading teams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center">
            <Users className="h-6 w-6 mr-2" />
            Team Management
          </h2>
          <p className="text-slate-400">Create and manage teams for your organization</p>
        </div>
      </div>

      {/* Search and Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search teams..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="admin-teams-search"
              />
            </div>
            
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button data-testid="admin-teams-create-button">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Team
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Team</DialogTitle>
                </DialogHeader>
                
                <form data-testid="admin-team-create-form" className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Team Name *</Label>
                    <Input
                      id="name"
                      data-testid="admin-team-name-input"
                      placeholder="Corporate Law Team"
                      value={createTeamForm.name}
                      onChange={(e) => setCreateTeamForm({...createTeamForm, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      data-testid="admin-team-description-input"
                      placeholder="Team handling corporate legal matters"
                      value={createTeamForm.description}
                      onChange={(e) => setCreateTeamForm({...createTeamForm, description: e.target.value})}
                    />
                  </div>
                  
                  {/* Initial Members Selection */}
                  <div className="space-y-3">
                    <Label>Initial Team Members</Label>
                    <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto border rounded p-3" data-testid="admin-team-members-select">
                      {users.filter(u => u.is_active).map((user) => (
                        <div key={user.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`member-${user.id}`}
                            data-testid={`admin-team-member-${user.id}-checkbox`}
                            checked={createTeamForm.initial_member_ids.includes(user.id)}
                            onCheckedChange={(checked) => handleMemberToggle(user.id, checked as boolean)}
                          />
                          <Label htmlFor={`member-${user.id}`} className="text-sm flex-1">
                            <div className="flex items-center justify-between">
                              <span>{user.display_name}</span>
                              <span className="text-slate-400 text-xs">{user.email}</span>
                            </div>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </form>
                
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowCreateDialog(false)}
                    data-testid="admin-team-create-cancel"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={createTeam}
                    disabled={isCreating || !currentUser?.firmId}
                    data-testid="admin-team-create-submit"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : !currentUser?.firmId ? (
                      'Loading...'
                    ) : (
                      'Create Team'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Teams List */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800 border-b border-slate-700">
                <tr>
                  <th className="text-left py-4 px-6 text-slate-300 font-medium">Team</th>
                  <th className="text-left py-4 px-6 text-slate-300 font-medium">Description</th>
                  <th className="text-left py-4 px-6 text-slate-300 font-medium">Members</th>
                  <th className="text-left py-4 px-6 text-slate-300 font-medium">Firm</th>
                  <th className="text-left py-4 px-6 text-slate-300 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredTeams.map((team) => (
                  <tr key={team.id} className="hover:bg-slate-800/50" data-testid={`admin-team-row-${team.id}`}>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <Users className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-100">{team.name}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <p className="text-slate-300">
                        {team.description || <span className="text-slate-500 italic">No description</span>}
                      </p>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-300">{team.members?.length || 0} members</span>
                        {team.members?.length > 0 && (
                          <div className="flex -space-x-1">
                            {team.members.slice(0, 3).map((member) => (
                              <div key={member.id} className="w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center text-xs text-slate-200 border-2 border-slate-800">
                                {member.display_name.charAt(0).toUpperCase()}
                              </div>
                            ))}
                            {team.members.length > 3 && (
                              <div className="w-6 h-6 bg-slate-500 rounded-full flex items-center justify-center text-xs text-slate-200 border-2 border-slate-800">
                                +{team.members.length - 3}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <Badge variant="outline" className="text-slate-300 border-slate-600">
                        {team.firm?.name}
                      </Badge>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2" data-testid={`admin-team-actions-${team.id}`}>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openEditDialog(team)}
                          data-testid={`admin-team-edit-${team.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          data-testid={`admin-team-manage-members-${team.id}`}
                        >
                          <UserPlus className="h-4 w-4" />
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

      {filteredTeams.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-100 mb-2">No teams found</h3>
            <p className="text-slate-400">
              {searchTerm 
                ? 'Try adjusting your search to see more results.'
                : 'No teams have been created yet.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Team Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
          </DialogHeader>
          
          {editingTeam && (
            <form data-testid="admin-team-edit-form" className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Team Name *</Label>
                <Input
                  id="edit-name"
                  data-testid="admin-team-edit-name-input"
                  placeholder="Corporate Law Team"
                  value={editTeamForm.name}
                  onChange={(e) => setEditTeamForm({...editTeamForm, name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  data-testid="admin-team-edit-description-input"
                  placeholder="Team handling corporate legal matters"
                  value={editTeamForm.description}
                  onChange={(e) => setEditTeamForm({...editTeamForm, description: e.target.value})}
                />
              </div>
              
              {/* Team Members Selection */}
              <div className="space-y-3">
                <Label>Team Members</Label>
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto border rounded p-3" data-testid="admin-team-edit-members-select">
                  {users.filter(u => u.is_active).map((user) => (
                    <div key={user.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-member-${user.id}`}
                        data-testid={`admin-team-edit-member-${user.id}-checkbox`}
                        checked={editTeamForm.initial_member_ids.includes(user.id)}
                        onCheckedChange={(checked) => handleMemberToggle(user.id, checked as boolean, true)}
                      />
                      <Label htmlFor={`edit-member-${user.id}`} className="text-sm flex-1">
                        <div className="flex items-center justify-between">
                          <span>{user.display_name}</span>
                          <span className="text-slate-400 text-xs">{user.email}</span>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </form>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowEditDialog(false)}
              data-testid="admin-team-edit-cancel"
            >
              Cancel
            </Button>
            <Button 
              onClick={updateTeam}
              disabled={isEditing}
              data-testid="admin-team-edit-submit"
            >
              {isEditing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Team'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
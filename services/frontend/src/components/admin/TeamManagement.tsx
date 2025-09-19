import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Users,
  Edit,
  Trash2,
  UserPlus
} from 'lucide-react';

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

export const TeamManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTeams();
  }, []);

  // Refetch teams when navigating back to this tab (e.g., from team creation)
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    if (tab === 'teams') {
      fetchTeams();
    }
  }, [location.search]);

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/admin/teams', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        // API returns array directly, not wrapped in teams property
        setTeams(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to delete this team?')) return;

    try {
      const response = await fetch(`/api/admin/teams/${teamId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setTeams(teams.filter(t => t.id !== teamId));
        alert('Team deleted successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to delete team: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting team:', error);
      alert('Failed to delete team. Please try again.');
    }
  };

  const filteredTeams = teams.filter((team) => {
    return team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (team.description && team.description.toLowerCase().includes(searchTerm.toLowerCase()));
  });

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-500" />
            <span>Team Management</span>
          </h2>
          <p className="text-slate-400">Manage teams and their members</p>
        </div>
        
        <Button 
          data-testid="admin-teams-create-button"
          onClick={() => navigate('/admin/teams/create')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Team
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="admin-teams-search"
            />
          </div>
        </CardContent>
      </Card>

      {/* Teams Table */}
      <Card>
        <CardContent>
          <div className="space-y-4">
            {/* Table Header */}
            <div className="grid grid-cols-5 gap-4 pb-2 border-b border-slate-700 text-sm font-medium text-slate-300">
              <div>Team Name</div>
              <div>Description</div>
              <div>Members</div>
              <div>Firm</div>
              <div>Actions</div>
            </div>
            
            {/* Table Body */}
            {filteredTeams.map((team) => (
              <div key={team.id} className="grid grid-cols-5 gap-4 py-4 border-b border-slate-800 items-center">
                <div>
                  <div className="font-medium text-slate-100">{team.name}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-400">
                    {team.description || 'No description'}
                  </div>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <UserPlus className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-300">{team.members?.length || 0}</span>
                    {team.members && team.members.length > 0 && (
                      <div className="flex -space-x-1">
                        {team.members.slice(0, 3).map((member) => (
                          <div
                            key={member.id}
                            className="w-6 h-6 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs"
                            title={member.display_name}
                          >
                            {member.display_name.charAt(0).toUpperCase()}
                          </div>
                        ))}
                        {team.members.length > 3 && (
                          <div className="w-6 h-6 rounded-full bg-slate-600 border border-slate-500 flex items-center justify-center text-xs">
                            +{team.members.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <Badge variant="outline" className="text-xs">
                    {team.firm?.name || 'Unknown'}
                  </Badge>
                </div>
                <div>
                  <div className="flex items-center space-x-2" data-testid={`admin-team-actions-${team.id}`}>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/admin/teams/${team.id}/edit`)}
                      data-testid={`admin-team-edit-${team.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteTeam(team.id)}
                      className="text-red-400 hover:text-red-300"
                      data-testid={`admin-team-delete-${team.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredTeams.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-100 mb-2">No teams found</h3>
              <p className="text-slate-400">
                {searchTerm ? 'Try adjusting your search terms.' : 'Create your first team to get started.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  Filter,
  Building,
  Edit,
  Trash2,
  Users,
  Calendar,
  BarChart3,
  CheckCircle,
} from 'lucide-react';

interface Firm {
  id: string;
  name: string;
  external_ref?: string;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
  users?: {
    id: string;
    display_name: string;
    is_active: boolean;
  }[];
}


export const FirmManagement = () => {
  const navigate = useNavigate();
  const [firms, setFirms] = useState<Firm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFirms();
  }, []);

  const fetchFirms = async () => {
    try {
      const response = await fetch('/api/admin/firms', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setFirms(data || []);
      }
    } catch (error) {
      console.error('Error fetching firms:', error);
    } finally {
      setLoading(false);
    }
  };


  const deleteFirm = async (firmId: string) => {
    if (!confirm('Are you sure you want to delete this firm? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/firms/${firmId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setFirms(firms.filter(f => f.id !== firmId));
        alert('Firm deleted successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to delete firm: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting firm:', error);
      alert('Failed to delete firm. Please try again.');
    }
  };


  const filteredFirms = firms.filter((firm) => {
    return firm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (firm.external_ref && firm.external_ref.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-2 text-slate-400">Loading firms...</p>
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
            <Building className="h-5 w-5 text-amber-500" />
            <span>Firm Management</span>
          </h2>
          <p className="text-slate-400">Manage law firms and their settings</p>
        </div>
        
        <Button onClick={() => navigate('/admin/firms/create')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Firm
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search firms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center text-sm text-slate-400">
        <Filter className="h-4 w-4 mr-2" />
        Showing {filteredFirms.length} of {firms.length} firms
      </div>

      {/* Firms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFirms.map((firm) => (
          <Card key={firm.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Building className="h-5 w-5 text-amber-500" />
                  <h3 className="font-semibold text-lg">{firm.name}</h3>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/admin/firms/${firm.id}`)}
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/admin/firms/${firm.id}/edit`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteFirm(firm.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {firm.external_ref && (
                <div className="mb-3">
                  <Badge variant="outline" className="text-xs">
                    {firm.external_ref}
                  </Badge>
                </div>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Users:</span>
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3 text-slate-400" />
                    <span>{firm.users?.length || 0}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Created:</span>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    <span>{new Date(firm.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Status:</span>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-3 w-3 text-green-400" />
                    <span className="text-green-400">Active</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFirms.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Building className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-100 mb-2">No firms found</h3>
            <p className="text-slate-400">
              {searchTerm 
                ? 'Try adjusting your search to see more results.'
                : 'No firms have been created yet.'}
            </p>
          </CardContent>
        </Card>
      )}

    </div>
  );
};